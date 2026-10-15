"""Safe repository source resolution for local paths and public GitHub checkouts."""

import os
import re
import subprocess
import tempfile
import time
from collections.abc import Iterator
from contextlib import contextmanager
from dataclasses import dataclass
from pathlib import Path
from urllib.parse import urlsplit

from .execution import sanitized_output

MAX_CHECKOUT_SECONDS = 120
MAX_CHECKOUT_FILES = 20_000
MAX_CHECKOUT_BYTES = 100 * 1024 * 1024
_SHA_RE = re.compile(r"^[0-9a-fA-F]{40}$")
_OWNER_RE = re.compile(r"^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$")
_REPOSITORY_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]{0,99}$")


@dataclass(frozen=True)
class RepositorySource:
    path: Path
    repository: str
    commit: str | None = None


def normalize_github_url(value: str) -> str:
    """Accept only a public GitHub HTTPS repository URL."""
    try:
        parsed = urlsplit(value)
        path_parts = parsed.path.strip("/").split("/")
        if (
            parsed.scheme.lower() != "https"
            or parsed.netloc.lower() != "github.com"
            or parsed.username
            or parsed.password
            or parsed.port
            or parsed.query
            or parsed.fragment
            or len(path_parts) != 2
        ):
            raise ValueError
        owner, repository = path_parts
        if repository.lower().endswith(".git"):
            repository = repository[:-4]
        if not _OWNER_RE.fullmatch(owner) or not _REPOSITORY_RE.fullmatch(repository):
            raise ValueError
    except (ValueError, AttributeError):
        raise ValueError(
            "Repository source must be a local directory or public "
            "https://github.com/<owner>/<repository> URL."
        ) from None
    return f"https://github.com/{owner.lower()}/{repository.lower()}"


def _git_environment(empty_config: Path) -> dict[str, str]:
    env = os.environ.copy()
    env.update(
        {
            "GIT_CONFIG_GLOBAL": str(empty_config),
            "GIT_CONFIG_NOSYSTEM": "1",
            "GIT_TERMINAL_PROMPT": "0",
            "GIT_LFS_SKIP_SMUDGE": "1",
        }
    )
    for name in (
        "GIT_DIR",
        "GIT_WORK_TREE",
        "GIT_INDEX_FILE",
        "GIT_COMMON_DIR",
        "GIT_OBJECT_DIRECTORY",
        "GIT_ALTERNATE_OBJECT_DIRECTORIES",
    ):
        env.pop(name, None)
    return env


def _git(
    args: list[str],
    *,
    cwd: Path | None,
    env: dict[str, str],
    deadline: float,
) -> subprocess.CompletedProcess[str]:
    remaining = deadline - time.monotonic()
    if remaining <= 0:
        raise ValueError("Public GitHub checkout exceeded the 120-second time limit.")
    try:
        result = subprocess.run(
            ["git", "-c", "credential.helper=", *args],
            cwd=cwd,
            env=env,
            capture_output=True,
            text=True,
            timeout=remaining,
            check=False,
        )
    except FileNotFoundError as error:
        raise ValueError("Git is required to check out public GitHub repositories.") from error
    except subprocess.TimeoutExpired as error:
        raise ValueError("Public GitHub checkout exceeded the 120-second time limit.") from error
    if result.returncode:
        detail = sanitized_output(result.stderr).strip()[:1000]
        raise ValueError(
            "Could not check out the public GitHub repository."
            + (f" Git reported: {detail}" if detail else "")
        )
    return result


def _validate_checkout(root: Path) -> None:
    file_count = 0
    total_bytes = 0
    pending = [root]
    while pending:
        current = pending.pop()
        with os.scandir(current) as entries:
            for entry in entries:
                if entry.name == ".git":
                    continue
                if entry.is_symlink() or os.path.isjunction(entry.path):
                    continue
                if entry.is_dir(follow_symlinks=False):
                    pending.append(Path(entry.path))
                    continue
                if entry.is_file(follow_symlinks=False):
                    file_count += 1
                    total_bytes += entry.stat(follow_symlinks=False).st_size
                    if file_count > MAX_CHECKOUT_FILES:
                        raise ValueError(
                            f"Repository exceeds the {MAX_CHECKOUT_FILES:,}-file checkout limit."
                        )
                    if total_bytes > MAX_CHECKOUT_BYTES:
                        raise ValueError(
                            "Repository exceeds the 100 MiB checked-out source limit."
                        )


@contextmanager
def open_repository(
    value: str,
    *,
    revision: str | None = None,
) -> Iterator[RepositorySource]:
    """Resolve a local directory or own a bounded temporary public checkout."""
    source = value.strip()
    if not source:
        raise ValueError("Repository source cannot be empty.")
    if "://" in source and not source.lower().startswith(("http://", "https://")):
        raise ValueError("Only public GitHub HTTPS repository URLs are supported.")
    if source.lower().startswith(("http://", "https://")):
        repository = normalize_github_url(source)
        if revision is not None and not _SHA_RE.fullmatch(revision):
            raise ValueError("Pinned GitHub source commit must be a 40-character commit SHA.")
        with tempfile.TemporaryDirectory(prefix="gemforge-checkout-") as temporary:
            base = Path(temporary)
            empty_config = base / "gitconfig"
            empty_config.touch()
            hooks = base / "hooks"
            hooks.mkdir()
            env = _git_environment(empty_config)
            deadline = time.monotonic() + MAX_CHECKOUT_SECONDS
            checkout = base / "repository"
            _git(
                [
                    "clone",
                    "--depth=1",
                    "--single-branch",
                    "--no-tags",
                    "--no-recurse-submodules",
                    "--filter=blob:limit=2m",
                    "--config",
                    f"core.hooksPath={hooks}",
                    "--no-checkout",
                    repository,
                    str(checkout),
                ],
                cwd=base,
                env=env,
                deadline=deadline,
            )
            if revision:
                _git(
                    [
                        "fetch",
                        "--depth=1",
                        "--no-tags",
                        "--no-recurse-submodules",
                        "origin",
                        revision,
                    ],
                    cwd=checkout,
                    env=env,
                    deadline=deadline,
                )
                resolved = revision.lower()
            else:
                resolved = _git(
                    ["rev-parse", "--verify", "HEAD^{commit}"],
                    cwd=checkout,
                    env=env,
                    deadline=deadline,
                ).stdout.strip().lower()
            if not _SHA_RE.fullmatch(resolved):
                raise ValueError("Git returned an invalid commit SHA for the repository.")
            _git(
                [
                    "checkout",
                    "--detach",
                    "--force",
                    "--no-recurse-submodules",
                    resolved,
                ],
                cwd=checkout,
                env=env,
                deadline=deadline,
            )
            checked_out = _git(
                ["rev-parse", "--verify", "HEAD^{commit}"],
                cwd=checkout,
                env=env,
                deadline=deadline,
            ).stdout.strip().lower()
            if checked_out != resolved:
                raise ValueError("Checked-out repository revision did not match the pinned commit.")
            _validate_checkout(checkout)
            yield RepositorySource(path=checkout, repository=repository, commit=resolved)
        return

    if revision is not None:
        raise ValueError("A source commit can only be pinned for a public GitHub URL.")
    path = Path(source).expanduser().resolve(strict=True)
    if not path.is_dir():
        raise ValueError(f"Repository path must be a directory: {path}")
    yield RepositorySource(path=path, repository=str(path))
