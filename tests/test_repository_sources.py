"""Repository source validation and API pinning tests; no network or target execution."""

import subprocess
from contextlib import contextmanager
from pathlib import Path
from unittest.mock import Mock

import pytest
from fastapi.testclient import TestClient

import gemforge.api as api
from gemforge.engine import scan_repository
from gemforge.repositories import RepositorySource, normalize_github_url, open_repository

GITHUB_URL = "https://github.com/ExampleOrg/demo-project"
COMMIT = "a" * 40


@pytest.mark.parametrize(
    ("value", "expected"),
    [
        ("https://github.com/Owner/Repo", "https://github.com/owner/repo"),
        ("https://github.com/Owner/Repo.git/", "https://github.com/owner/repo"),
    ],
)
def test_normalize_public_github_urls(value, expected):
    assert normalize_github_url(value) == expected


@pytest.mark.parametrize(
    "value",
    [
        "http://github.com/owner/repo",
        "ssh://git@github.com/owner/repo.git",
        "file:///tmp/repo",
        "https://github.com.evil.test/owner/repo",
        "https://user:password@github.com/owner/repo",
        "https://github.com/owner/repo?ref=main",
        "https://github.com/owner/repo#readme",
        "https://github.com/owner",
        "https://github.com/owner/repo/tree/main",
        "https://github.com/owner/%2e%2e",
    ],
)
def test_reject_unsafe_or_malformed_urls(value):
    with pytest.raises(ValueError, match="public"):
        normalize_github_url(value)


def test_local_repository_is_used_without_git_or_temporary_copy(tmp_path, monkeypatch):
    repository = tmp_path / "repo"
    repository.mkdir()
    git = Mock(side_effect=AssertionError("Local paths must not invoke Git"))
    monkeypatch.setattr("gemforge.repositories.subprocess.run", git)

    with open_repository(str(repository)) as source:
        assert source.path == repository.resolve()
        assert source.repository == str(repository.resolve())
        assert source.commit is None
    git.assert_not_called()


def test_capsule_records_normalized_import_mapping(tmp_path):
    repository = tmp_path / "repo"
    repository.mkdir()
    (repository / "requirements.txt").write_text("python-dateutil==2.9\n")
    (repository / "module.py").write_text("import dateutil\n")

    capsule = scan_repository(repository, {"dateutil": "python-dateutil"})

    assert capsule.import_map == {"dateutil": "python-dateutil"}
    assert any(usage.package == "python-dateutil" for usage in capsule.usages)


def test_github_checkout_pins_commit_and_cleans_temporary_files(monkeypatch):
    commands = []

    def fake_run(command, cwd, env, capture_output, text, timeout, check):
        commands.append(command)
        if "clone" in command:
            checkout = Path(command[-1])
            checkout.mkdir()
            (checkout / "requirements.txt").write_text("sample==1\n")
        return subprocess.CompletedProcess(
            command, 0, stdout=f"{COMMIT}\n", stderr=""
        )

    monkeypatch.setattr("gemforge.repositories.subprocess.run", fake_run)
    with open_repository(GITHUB_URL, revision=COMMIT.upper()) as source:
        checkout_path = source.path
        assert source.repository == GITHUB_URL.lower()
        assert source.commit == COMMIT
        assert (source.path / "requirements.txt").is_file()
        assert any("--no-recurse-submodules" in command for command in commands)
        assert any("--depth=1" in command for command in commands)
        assert any("core.hooksPath=" in " ".join(command) for command in commands)
        assert any("fetch" in command for command in commands)
        assert any("checkout" in command and COMMIT in command for command in commands)
    assert not checkout_path.exists()


def test_github_checkout_rejects_invalid_pin_before_git(monkeypatch):
    git = Mock(side_effect=AssertionError("Invalid pins must not invoke Git"))
    monkeypatch.setattr("gemforge.repositories.subprocess.run", git)
    with pytest.raises(ValueError, match="40-character"):
        with open_repository(GITHUB_URL, revision="not-a-commit"):
            pass
    git.assert_not_called()


def test_api_analysis_and_preview_reuse_pinned_github_commit(tmp_path, monkeypatch):
    repository = tmp_path / "fixture"
    repository.mkdir()
    (repository / "requirements.txt").write_text("demo==1\n")
    revisions = []

    @contextmanager
    def fake_open_repository(value, *, revision=None):
        revisions.append(revision)
        yield RepositorySource(
            path=repository,
            repository=GITHUB_URL.lower(),
            commit=COMMIT,
        )

    monkeypatch.setattr(api, "open_repository", fake_open_repository)
    with api._analysis_lock:
        api._analyses.clear()

    client = TestClient(api.app)
    analysis = client.post(
        "/analyze",
        json={"path": GITHUB_URL, "ai": False, "import_map": {"demo": "demo"}},
    )
    assert analysis.status_code == 201, analysis.text
    data = analysis.json()
    assert data["capsule"]["repository"] == GITHUB_URL.lower()
    assert data["capsule"]["source_commit"] == COMMIT
    assert data["capsule"]["import_map"] == {"demo": "demo"}

    preview = client.post(
        "/verify",
        json={
            "path": GITHUB_URL,
            "analysis_id": data["id"],
            "dependency": "demo",
            "target": "demo>=2",
            "confirm_execution": False,
        },
    )
    assert preview.status_code == 201, preview.text
    assert preview.json()["capsule"]["source_commit"] == COMMIT
    assert preview.json()["capsule"]["verification"]["verdict"] == "not_run"
    assert revisions == [None, COMMIT]


def test_api_rejects_non_github_network_scheme():
    response = TestClient(api.app).post("/scan", json={"path": "ssh://github.com/owner/repo"})
    assert response.status_code == 400
    assert "HTTPS" in response.json()["detail"]
