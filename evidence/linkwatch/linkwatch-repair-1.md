# Dependency Exit Capsule

Repository: `C:\Users\yojit\Documents\Hackathons\hacktober\GemForge\.dist\LinkWatch`
Generated: 2026-10-15T07:55:10.351219+00:00

## Dependencies

- `toml==0.10.2` — `pyproject.toml:13` (runtime)
- `appdirs==1.4.4` — `pyproject.toml:14` (runtime)
- `requests==2.31.0` — `pyproject.toml:15` (runtime)
- `jinja2==2.11.3` — `pyproject.toml:16` (runtime)
- `pydantic>=2` — `pyproject.toml:17` (runtime)
- `click>=7` — `pyproject.toml:18` (runtime)
- `six` — `pyproject.toml:19` (runtime)
- `chardet==5.2.0` — `pyproject.toml:20` (runtime)
- `setuptools==75.8.0` — `pyproject.toml:21` (runtime)
- `idna==2.7` — `pyproject.toml:22` (runtime)
- `python-dateutil` — `pyproject.toml:23` (runtime)
- `rich` — `pyproject.toml:24` (runtime)
- `pytest` — `requirements-dev.txt:1` (runtime)
- `nose==1.3.7` — `requirements-dev.txt:2` (runtime)
- `toml==0.10.2` — `requirements.txt:1` (runtime)
- `appdirs==1.4.4` — `requirements.txt:2` (runtime)
- `requests==2.31.0` — `requirements.txt:3` (runtime)
- `jinja2==2.11.3` — `requirements.txt:4` (runtime)
- `pydantic==1.10.13` — `requirements.txt:5` (runtime)
- `click>=7` — `requirements.txt:6` (runtime)
- `six` — `requirements.txt:7` (runtime)
- `chardet==5.2.0` — `requirements.txt:8` (runtime)
- `setuptools==75.8.0` — `requirements.txt:9` (runtime)
- `idna==2.7` — `requirements.txt:10` (runtime)
- `python-dateutil` — `requirements.txt:11` (runtime)
- `rich` — `requirements.txt:12` (runtime)

## Detected risks

- **pydantic** (proven): Exact pin 1.10.13 is excluded by the combined PEP 440 constraints: ==1.10.13,>=2.

## Migration recommendations

- **pydantic**: generated
  - Origin: ai_hypothesis; model: gemma-4-26b-a4b-it
  - Proposed target (unverified): pydantic>=2
  - AI risk explanation: The project has a fundamental dependency conflict: 'pyproject.toml' requires 'pydantic>=2', while 'requirements.txt' pins 'pydantic==1.10.13'. These constraints are mutually exclusive (pydantic:risk:1). Additionally, the existing usage in 'linkwatch/config.py' relies on Pydantic v1 APIs (e.g., '@validator' and 'class Config'), which are incompatible with Pydantic v2.
  - AI rationale: The 'pyproject.toml' manifest indicates an intended move to version 2 or higher. To resolve the constraint conflict and satisfy the primary project configuration, 'requirements.txt' must be updated and the codebase must be migrated to Pydantic v2 syntax.
  - Evidence references: pydantic:manifest:1, pydantic:manifest:2, pydantic:risk:1, pydantic:usage:1, pydantic:usage:2, pydantic:source:1, pydantic:source:2, pydantic:source:3, pydantic:limitation:1, pydantic:limitation:2, pydantic:limitation:3, pydantic:limitation:4, pydantic:limitation:5, pydantic:limitation:6, pydantic:limitation:7
  - Proposed change in `requirements.txt`: Remove the explicit pin 'pydantic==1.10.13' to resolve the conflict with the 'pyproject.toml' requirement of 'pydantic>=2'.
  - Proposed change in `linkwatch/config.py`: Migrate Pydantic v1 syntax to v2. Change 'from pydantic import BaseModel, validator' to 'from pydantic import BaseModel, field_validator, ConfigDict'. Replace 'class Config' with 'model_config = ConfigDict(str_strip_whitespace=True)' and replace '@validator' decorators with '@field_validator'.
  - Compatibility concern: Pydantic v2 is a major version upgrade with breaking API changes.
  - Compatibility concern: Configuration logic using 'class Config' must be transitioned to 'model_config' using 'ConfigDict'.
  - Compatibility concern: Validator decorators ('@validator') have been replaced by '@field_validator' or '@model_validator'.
  - Unknown: The extent of Pydantic usage in other files not covered by the current scan is unknown.
  - Unknown: Whether 'pydantic.BaseSettings' (part of pydantic-settings in v2) is used elsewhere in the project.
  - Proposed verification (not_run): `pip install "pydantic>=2"` — Verify that the new version can be installed alongside other project dependencies.
  - Proposed verification (not_run): `pytest tests/test_config.py` — Verify that the migrated Pydantic models in 'linkwatch/config.py' still behave correctly with v2.
  - Synchronize dependency manifests by removing the conflicting version pin in 'requirements.txt'.
  - Upgrade the environment to 'pydantic>=2'.
  - Refactor 'linkwatch/config.py' to replace v1 'validator' and 'Config' patterns with v2 'field_validator' and 'model_config'.
  - Execute the test suite to ensure functional parity.
  - Static analysis only; runtime behavior of the models cannot be verified without execution.
  - No external metadata (PyPI/vulnerability) was queried to determine the latest stable v2 release.
  - The migration plan assumes the 'pyproject.toml' intent is the correct source of truth for the desired version.

## Inference provenance

AI analysis status: generated

- pydantic: succeeded; gemma-4-26b-a4b-it; google_genai_developer_api; access=confirmed; calls=3; duration_ms=65646.4
  - Response ID: 4obQav-dAZ6qg8UPkfm--AM; model version: gemma-4-26b-a4b-it; finish: STOP
  - Prompt SHA256: ed6628121dd93a318f0ab9a7eb8de15439b4a1ee8b22f1e3005b41eea12fc68d; response SHA256: 7b6cda54e7ec3c942c2742bbf7883b00e663f678b45792cc3036585e9271b97e
  - generation attempt 1: HTTP 500 / INTERNAL; Internal error encountered.

## Observed evidence

- `pydantic:manifest:1` (manifest): Declaration: pydantic>=2; group: runtime.
  - `pyproject.toml:17`
- `pydantic:manifest:2` (manifest): Declaration: pydantic==1.10.13; group: runtime.
  - `requirements.txt:5`
- `pydantic:risk:1` (risk): constraint_conflict (proven): Exact pin 1.10.13 is excluded by the combined PEP 440 constraints: ==1.10.13,>=2.
- `pydantic:usage:1` (usage): import: pydantic.BaseModel; alias=BaseModel; mapping=name_heuristic.
  - `linkwatch/config.py:4`
- `pydantic:usage:2` (usage): import: pydantic.validator; alias=validator; mapping=name_heuristic.
  - `linkwatch/config.py:4`
- `pydantic:source:1` (source): Bounded source excerpt, at most 60 lines/4000 characters; credential-like assignments redacted.
  - `pyproject.toml:12`
  - Excerpt SHA256: 26561f000240b64becab07b642ed7330741e47af1a5850eaf9384e3fb56b3f1b

    dependencies = [

        "toml==0.10.2",

        "appdirs==1.4.4",

        "requests==2.31.0",

        "Jinja2==2.11.3",

        "pydantic>=2",

        "click>=7",

        "six",

        "chardet==5.2.0",

        "setuptools==75.8.0",

        "idna==2.7",

        "python-dateutil",

        "rich",

    ]

    

    [project.scripts]

    linkwatch = "linkwatch.cli:cli"

    

    [tool.setuptools]

    packages = ["linkwatch"]

    

    [tool.setuptools.package-data]

    linkwatch = ["templates/*.j2"]

    

    [tool.pytest.ini_options]

    testpaths = ["tests"]
- `pydantic:source:2` (source): Bounded source excerpt, at most 60 lines/4000 characters; credential-like assignments redacted.
  - `requirements.txt:1`
  - Excerpt SHA256: fd119c0d39bd45e67acb41ac6c0d57028e521a638b29a1f5f51c3f9bff0ca613

    toml==0.10.2

    appdirs==1.4.4

    requests==2.31.0

    Jinja2==2.11.3

    pydantic==1.10.13

    click>=7

    six

    chardet==5.2.0

    setuptools==75.8.0

    idna==2.7

    python-dateutil

    rich

    # PyYAML==5.1
- `pydantic:source:3` (source): Bounded source excerpt, at most 60 lines/4000 characters; credential-like assignments redacted.
  - `linkwatch/config.py:1`
  - Excerpt SHA256: 41a8a725326ad8713de86a2fa4cf21184d7cb736d4dce023aee9148dd1400619

    from typing import List

    

    import toml

    from pydantic import BaseModel, validator

    

    

    class Site(BaseModel):

        name: str

        url: str

    

        class Config:

            anystr_strip_whitespace = True

    

        @validator("name")

        def name_not_empty(cls, value):

            if not value:

                raise ValueError("site name can not be empty")

            return value

    

        @validator("url")

        def url_has_scheme(cls, value):

            if not value.startswith(("http://", "https://")):

                raise ValueError("url must start with http:// or https://")

            return value

    

    

    class Settings(BaseModel):

        title: str = "linkwatch"

        output: str = "status.html"

        sites: List[Site] = []

    

        class Config:

            extra = "forbid"

    

    

    def load_settings(path="sites.toml"):

        data = toml.load(path)

        return Settings(**data)
- `pydantic:test_inventory:1` (test_inventory): Test file detected by filename only. Not executed or judged sufficient.
  - `tests/conftest.py:?`
- `pydantic:test_inventory:2` (test_inventory): Test file detected by filename only. Not executed or judged sufficient.
  - `tests/test_cache.py:?`
- `pydantic:test_inventory:3` (test_inventory): Test file detected by filename only. Not executed or judged sufficient.
  - `tests/test_checker.py:?`
- `pydantic:test_inventory:4` (test_inventory): Test file detected by filename only. Not executed or judged sufficient.
  - `tests/test_config.py:?`
- `pydantic:test_inventory:5` (test_inventory): Test file detected by filename only. Not executed or judged sufficient.
  - `tests/test_report.py:?`
- `pydantic:limitation:1` (limitation): Static local manifest facts only: no PyPI release, vulnerability, maintenance, transitive dependency or installed-distribution metadata was queried.
- `pydantic:limitation:2` (limitation): All discovered requirements*.txt and pyproject.toml declarations are compared together; independent nested projects and alternative install profiles may need separate scans.
- `pydantic:limitation:3` (limitation): Pip includes/options, hashes, editable requirements, lockfiles, setup.py and build-system dependencies are not resolved. Symlinked files/directories are skipped.
- `pydantic:limitation:4` (limitation): Constraint compatibility is metadata overlap, not runtime/API compatibility. Prereleases are allowed for existential overlap checks. Conditional constraints remain uncertain.
- `pydantic:limitation:5` (limitation): Import-to-distribution matching uses normalized-name heuristics unless explicitly mapped; mismatched names (e.g. python-dateutil/dateutil) need --import-map. Dynamic imports, star imports, relative imports, alias reassignment, conditional bindings, local module shadowing and nested-scope references are not resolved. Imports are syntax evidence, not executed usage.
- `pydantic:limitation:6` (limitation): No external dependency/release/API/maintenance metadata is available. Do not claim a version exists or that migration is compatible.
- `pydantic:limitation:7` (limitation): Evidence is read from a mutable working tree after scanning, not an atomic repository snapshot. Excerpt hashes cover only the redacted text shown.

## Repair suggestions — unverified, unapplied

### pydantic: unavailable

Created: 2026-10-15T09:07:22.080188+00:00
Verification: **unverified**. Gemma API request failed (HTTP 504); no fallback was attempted.
Parent verification SHA256: 463cdbd724e5d2695bbcfb1d38cd140524af2217d409e392899c0db38eceba57

Inference: failed; model: gemma-4-26b-a4b-it; calls: 3; response ID: none
Prompt SHA256: 1466f7b66af0aa46bb6ff0b30665cf794ea8b201b69c0d228fbf04792b7293eb; response SHA256: None
Model version: None; finish: None; input/output tokens: None/None
Inference error: server_error; Gemma API request failed (HTTP 504); no fallback was attempted.
- generation attempt 1: HTTP 504; DEADLINE_EXCEEDED; Deadline expired before operation could complete.; request IDs: {}
- generation attempt 2: HTTP 504; DEADLINE_EXCEEDED; Deadline expired before operation could complete.; request IDs: {}

Repair evidence:

- `repair:source:1` (source): Current source matches the previously captured redacted excerpt; no code executed.
  - Excerpt SHA256: 41a8a725326ad8713de86a2fa4cf21184d7cb736d4dce023aee9148dd1400619
  - `linkwatch/config.py:1–38`

    from typing import List
    
    import toml
    from pydantic import BaseModel, validator
    
    
    class Site(BaseModel):
        name: str
        url: str
    
        class Config:
            anystr_strip_whitespace = True
    
        @validator("name")
        def name_not_empty(cls, value):
            if not value:
                raise ValueError("site name can not be empty")
            return value
    
        @validator("url")
        def url_has_scheme(cls, value):
            if not value.startswith(("http://", "https://")):
                raise ValueError("url must start with http:// or https://")
            return value
    
    
    class Settings(BaseModel):
        title: str = "linkwatch"
        output: str = "status.html"
        sites: List[Site] = []
    
        class Config:
            extra = "forbid"
    
    
    def load_settings(path="sites.toml"):
        data = toml.load(path)
        return Settings(**data)

- `repair:probe:2` (probe): Observed settings_defaults: baseline=passed; candidate=passed.
  - Excerpt SHA256: 4b5cb51164174d01207895dfb3a5d0d550b2a401a4f06672352fea76b0966f5f

    {"name": "settings_defaults", "specification": {"name": "settings_defaults", "module": "linkwatch.config", "class_name": "Settings", "kwargs": {}, "expected_attributes": {"title": "linkwatch", "output": "status.html", "sites": []}, "expected_exception": null}, "baseline": {"name": "settings_defaults", "status": "passed", "actual": {"title": "linkwatch", "output": "status.html", "sites": []}, "actual_exception": null, "error_type": null, "message": null}, "candidate": {"name": "settings_defaults", "status": "passed", "actual": {"title": "linkwatch", "output": "status.html", "sites": []}, "actual_exception": null, "error_type": null, "message": null}, "comparison": {"check": "probe:settings_defaults", "status": "passed_both", "explanation": "Baseline=passed; candidate=passed."}}

- `repair:probe:3` (probe): Observed settings_forbids_extra: baseline=passed; candidate=passed.
  - Excerpt SHA256: b9abeb91d842e4925625da85278b1a312e4b4e15cd807d8b9702a808bbc0ddd1

    {"name": "settings_forbids_extra", "specification": {"name": "settings_forbids_extra", "module": "linkwatch.config", "class_name": "Settings", "kwargs": {"unexpected": true}, "expected_attributes": {}, "expected_exception": "pydantic.ValidationError"}, "baseline": {"name": "settings_forbids_extra", "status": "passed", "actual": null, "actual_exception": "ValidationError", "error_type": null, "message": null}, "candidate": {"name": "settings_forbids_extra", "status": "passed", "actual": null, "actual_exception": "ValidationError", "error_type": null, "message": null}, "comparison": {"check": "probe:settings_forbids_extra", "status": "passed_both", "explanation": "Baseline=passed; candidate=passed."}}

- `repair:probe:4` (probe): Observed site_rejects_empty_name: baseline=passed; candidate=passed.
  - Excerpt SHA256: 60164a6b7d6994cc077bc0dfd1996b7617c48b9130b09b4ebe80d293db002f67

    {"name": "site_rejects_empty_name", "specification": {"name": "site_rejects_empty_name", "module": "linkwatch.config", "class_name": "Site", "kwargs": {"name": "", "url": "[URL redacted]"}, "expected_attributes": {}, "expected_exception": "pydantic.ValidationError"}, "baseline": {"name": "site_rejects_empty_name", "status": "passed", "actual": null, "actual_exception": "ValidationError", "error_type": null, "message": null}, "candidate": {"name": "site_rejects_empty_name", "status": "passed", "actual": null, "actual_exception": "ValidationError", "error_type": null, "message": null}, "comparison": {"check": "probe:site_rejects_empty_name", "status": "passed_both", "explanation": "Baseline=passed; candidate=passed."}}

- `repair:probe:5` (probe): Observed site_rejects_invalid_url: baseline=passed; candidate=passed.
  - Excerpt SHA256: ba9818e4a7ccc7572c78cf9f0b322b54fe3f94cb69462fdcbd1fd003a3ce7f4b

    {"name": "site_rejects_invalid_url", "specification": {"name": "site_rejects_invalid_url", "module": "linkwatch.config", "class_name": "Site", "kwargs": {"name": "alpha", "url": "invalid"}, "expected_attributes": {}, "expected_exception": "pydantic.ValidationError"}, "baseline": {"name": "site_rejects_invalid_url", "status": "passed", "actual": null, "actual_exception": "ValidationError", "error_type": null, "message": null}, "candidate": {"name": "site_rejects_invalid_url", "status": "passed", "actual": null, "actual_exception": "ValidationError", "error_type": null, "message": null}, "comparison": {"check": "probe:site_rejects_invalid_url", "status": "passed_both", "explanation": "Baseline=passed; candidate=passed."}}

- `repair:probe:6` (probe): Observed site_strips_whitespace: baseline=passed; candidate=failed.
  - Excerpt SHA256: 5fa7aa265a547b6acf1a73af9b92ef2a3835398066f1e041cc5518676c2b63d7

    {"name": "site_strips_whitespace", "specification": {"name": "site_strips_whitespace", "module": "linkwatch.config", "class_name": "Site", "kwargs": {"name": "  alpha  ", "url": "[URL redacted]"}, "expected_attributes": {"name": "alpha"}, "expected_exception": null}, "baseline": {"name": "site_strips_whitespace", "status": "passed", "actual": {"name": "alpha"}, "actual_exception": null, "error_type": null, "message": null}, "candidate": {"name": "site_strips_whitespace", "status": "failed", "actual": {"name": "  alpha  "}, "actual_exception": null, "error_type": null, "message": null}, "comparison": {"check": "probe:site_strips_whitespace", "status": "regression", "explanation": "Baseline=passed; candidate=failed."}}

- `repair:diagnostic:7` (diagnostic): Recorded candidate import warnings.
  - Excerpt SHA256: 108ad11668d2df83df95008e694b217fffd0ea22591ef2a8065c3fe7d034a517

    Valid config keys have changed in V2:
    * 'anystr_strip_whitespace' has been renamed to 'str_strip_whitespace'

- `repair:prior_recommendation:8` (prior_recommendation): Previous AI hypothesis, not verified repair guidance.
  - Excerpt SHA256: 4414b1f0fb359e3cccbfb01b346928e4ca05b497860b8513bf61c51c99c05a6f

    {"package": "pydantic", "status": "generated", "model_id": "gemma-4-26b-a4b-it", "replacement": "pydantic>=2", "migration_steps": ["Synchronize dependency manifests by removing the conflicting version pin in 'requirements.txt'.", "Upgrade the environment to 'pydantic>=2'.", "Refactor 'linkwatch/config.py' to replace v1 'validator' and 'Config' patterns with v2 'field_validator' and 'model_config'.", "Execute the test suite to ensure functional parity."], "limitations": ["Static analysis only; runtime behavior of the models cannot be verified without execution.", "No external metadata (PyPI/vulnerability) was queried to determine the latest stable v2 release.", "The migration plan assumes the 'pyproject.toml' intent is the correct source of truth for the desired version."], "origin": "ai_hypothesis", "original_constraints": ["==1.10.13", ">=2"], "evidence_ids": ["pydantic:manifest:1", "pydantic:manifest:2", "pydantic:risk:1", "pydantic:usage:1", "pydantic:usage:2", "pydantic:source:1", "pydantic:source:2", "pydantic:source:3", "pydantic:limitation:1", "pydantic:limitation:2", "pydantic:limitation:3", "pydantic:limitation:4", "pydantic:limitation:5", "pydantic:limitation:6", "pydantic:limitation:7"], "risk_explanation": "The project has a fundamental dependency conflict: 'pyproject.toml' requires 'pydantic>=2', while 'requirements.txt' pins 'pydantic==1.10.13'. These constraints are mutually exclusive (pydantic:risk:1). Additionally, the existing usage in 'linkwatch/config.py' relies on Pydantic v1 APIs (e.g., '@validator' and 'class Config'), which are incompatible with Pydantic v2.", "rationale": "The 'pyproject.toml' manifest indicates an intended move to version 2 or higher. To resolve the constraint conflict and satisfy the primary project configuration, 'requirements.txt' must be updated and the codebase must be migrated to Pydantic v2 syntax.", "affected_files": ["pyproject.toml", "requirements.txt", "linkwatch/config.py"], "proposed_changes": [{"file": "requirements.txt", "description": "Remove the explicit pin 'pydantic==1.10.13' to resolve the conflict with the 'pyproject.toml' requirement of 'pydantic>=2'."}, {"file": "linkwatch/config.py", "description": "Migrate Pydantic v1 syntax to v2. Change 'from pydantic import BaseModel, validator' to 'from pydantic import BaseModel, field_validator, ConfigDict'. Replace 'class Config' with 'model_config = ConfigDict(str_strip_whitespace=True)' and replace '@validator' decorators with '@field_validator'."}], "compatibility_concerns": ["Pydantic v2 is a major version upgrade with breaking API changes.", "Configuration logic using 'class Config' must be transitioned to 'model_config' using 'ConfigDict'.", "Validator decorators ('@validator') have been replaced by '@field_validator' or '@model_validator'."], "verification_checks": [{"command": "pip install \"pydantic>=2\"", "purpose": "Verify that the new version can be installed alongside other project dependencies.", "status": "not_run"}, {"command": "pytest tests/test_config.py", "purpose": "Verify that the migrated Pydantic models in 'linkwatch/config.py' still behave correctly with v2.", "status": "not_run"}], "unknowns": ["The extent of Pydantic usage in other files not covered by the current scan is unknown.", "Whether 'pydantic.BaseSettings' (part of pydantic-settings in v2) is used elsewhere in the project."]}


## Usage evidence

- `appdirs`: import `appdirs.user_cache_dir` at `linkwatch/cache.py:4` (name_heuristic)
- `requests`: import `requests` at `linkwatch/checker.py:5` (name_heuristic)
- `requests`: import `requests.Session` at `linkwatch/checker.py:6` (name_heuristic)
- `click`: import `click` at `linkwatch/cli.py:1` (name_heuristic)
- `rich`: import `rich.console.Console` at `linkwatch/cli.py:2` (name_heuristic)
- `rich`: import `rich.live.Live` at `linkwatch/cli.py:3` (name_heuristic)
- `rich`: import `rich.table.Table` at `linkwatch/cli.py:4` (name_heuristic)
- `rich`: reference `rich.console.Console` at `linkwatch/cli.py:9` (name_heuristic)
- `toml`: import `toml` at `linkwatch/config.py:3` (name_heuristic)
- `pydantic`: import `pydantic.BaseModel` at `linkwatch/config.py:4` (name_heuristic)
- `pydantic`: import `pydantic.validator` at `linkwatch/config.py:4` (name_heuristic)
- `python-dateutil`: import `dateutil.parser` at `linkwatch/dates.py:1` (explicit)
- `chardet`: import `chardet` at `linkwatch/encoding.py:4` (name_heuristic)
- `requests`: import `requests.utils._parse_content_type_header` at `linkwatch/encoding.py:5` (name_heuristic)
- `requests`: import `requests` at `linkwatch/http_patch.py:1` (name_heuristic)
- `requests`: reference `requests.Session.request` at `linkwatch/http_patch.py:5` (name_heuristic)
- `requests`: reference `requests.Session.request` at `linkwatch/http_patch.py:14` (name_heuristic)
- `jinja2`: import `jinja2.Environment` at `linkwatch/report.py:3` (name_heuristic)
- `jinja2`: import `jinja2.FileSystemLoader` at `linkwatch/report.py:3` (name_heuristic)
- `jinja2`: import `jinja2.select_autoescape` at `linkwatch/report.py:3` (name_heuristic)
- `pytest`: import `pytest` at `tests/conftest.py:6` (name_heuristic)
- `click`: import `click.testing.CliRunner` at `tests/test_report.py:1` (name_heuristic)

## Verification

Status: **failed**. At least one comparable baseline-passing check failed in the candidate.

Verdict: **regression_detected**

Started: 2026-10-15 08:35:29.306543+00:00; completed: 2026-10-15 08:38:59.721559+00:00
Snapshot SHA256: 0722e3403726984523f1c34bbcf1d3da8c42588211752ef79bb7211f5e958999
Temporary cleanup: True
Install profile: Root requirements.txt + requirements-dev.txt (or PEP 621 runtime fallback); binary wheels only; no project installation; pytest harness >=8.3,<10.
Import module: linkwatch.config; check timeout: 60; install timeout: 180

### Reviewed probe specifications

    [
      {
        "name": "site_strips_whitespace",
        "module": "linkwatch.config",
        "class_name": "Site",
        "kwargs": {
          "name": "  alpha  ",
          "url": "https://example.test"
        },
        "expected_attributes": {
          "name": "alpha"
        },
        "expected_exception": null
      },
      {
        "name": "site_rejects_empty_name",
        "module": "linkwatch.config",
        "class_name": "Site",
        "kwargs": {
          "name": "",
          "url": "https://example.test"
        },
        "expected_attributes": {},
        "expected_exception": "pydantic.ValidationError"
      },
      {
        "name": "site_rejects_invalid_url",
        "module": "linkwatch.config",
        "class_name": "Site",
        "kwargs": {
          "name": "alpha",
          "url": "invalid"
        },
        "expected_attributes": {},
        "expected_exception": "pydantic.ValidationError"
      },
      {
        "name": "settings_forbids_extra",
        "module": "linkwatch.config",
        "class_name": "Settings",
        "kwargs": {
          "unexpected": true
        },
        "expected_attributes": {},
        "expected_exception": "pydantic.ValidationError"
      },
      {
        "name": "settings_defaults",
        "module": "linkwatch.config",
        "class_name": "Settings",
        "kwargs": {},
        "expected_attributes": {
          "title": "linkwatch",
          "output": "status.html",
          "sites": []
        },
        "expected_exception": null
      }
    ]
### Manifest-only candidate

Target: `pydantic>=2,<3`

    --- a/pyproject.toml
    +++ b/pyproject.toml
    @@ -14,7 +14,7 @@
         "appdirs==1.4.4",
         "requests==2.31.0",
         "Jinja2==2.11.3",
    -    "pydantic>=2",
    +    "pydantic>=2,<3",
         "click>=7",
         "six",
         "chardet==5.2.0",
    --- a/requirements.txt
    +++ b/requirements.txt
    @@ -2,7 +2,7 @@
     appdirs==1.4.4
     requests==2.31.0
     Jinja2==2.11.3
    -pydantic==1.10.13
    +pydantic>=2,<3
     click>=7
     six
     chardet==5.2.0

- `pyproject.toml` original SHA256: 66ee1348ff0f1bb4b978e79415501b981460fad29aef760628fc5a5d11c1d4da

- `requirements.txt` original SHA256: 3bd1f74dd873755e17c3ecbf0c02e80d29e8230417d1b14797b4dc592b97bc8c
- Plan limitation: Manifest-only candidate; no AI-generated source changes applied.

### Baseline execution

Python: 3.12.14

Installation requirements:

- `toml==0.10.2`
- `appdirs==1.4.4`
- `requests==2.31.0`
- `Jinja2==2.11.3`
- `pydantic==1.10.13`
- `click>=7`
- `six`
- `chardet==5.2.0`
- `setuptools==75.8.0`
- `idna==2.7`
- `python-dateutil`
- `rich`
- `pytest`
- `nose==1.3.7`
- `pytest>=8.3,<10`

Pinned control constraints:


Installed versions and wheel SHA256:

- `appdirs==1.4.4`; wheel: a841dacd6b99318a741b166adb07e19ee71a274450e68237b4650ca1055ab128
- `certifi==2026.7.22`; wheel: 62f22742b58a1a33014a2b6b706588a8d7e2a88ae7bd1a6ebe8c992928483775
- `chardet==5.2.0`; wheel: e1cf59446890a00105fe7b7912492ea04b6e6f06d4b742b2c788469e34c82970
- `charset-normalizer==3.5.2`; wheel: 780fbe7cab297b81dad9fb8dc5eb003c0468ffb0d9e5f65068c53a34661a96bc
- `click==8.5.0`; wheel: 255bc9599cf7748b4b1a446ccc735421bd08a2ae529a8b88597d3de5664ee360
- `colorama==0.4.6`; wheel: 4f1d9991f5acc0ca119f9d443620b77f9d6b33703e51011c16baf57afb285fc6
- `idna==2.7`; wheel: 156a6814fb5ac1fc6850fb002e0852d56c0c8d2531923a51032d1b70760e186e
- `iniconfig==2.3.1`; wheel: 9121e2c1fdb355232495be3194c8dfe87ccc2d5dee45947b78e68f499790d7a7
- `jinja2==2.11.3`; wheel: 03e47ad063331dd6a3f04a43eddca8a966a26ba0c5b7207a9a9e4e08f1b29419
- `markdown-it-py==4.2.0`; wheel: 9f7ebbcd14fe59494226453aed97c1070d83f8d24b6fc3a3bcf9a38092641c4a
- `markupsafe==3.0.4`; wheel: 11935df9bf455ed0c04eb87bcd720f02b1fe5e02128a9430f23aed6f93336fc7
- `mdurl==0.1.2`; wheel: 84008a41e51615a49fc9966191ff91509e3c40b939176e643fd50a5c2196b8f8
- `nose==1.3.7`; wheel: 9ff7c6cc443f8c51994b34a667bbcf45afd6d945be7477b52e97516fd17c53ac
- `packaging==26.3`; wheel: d7193f7c8e4e93f444fde0262bf90af30e16fa0ad0ad44cb553c87339b23cd1c
- `pip==25.0.1`; wheel: not captured
- `pluggy==1.6.0`; wheel: e920276dd6813095e9377c0bc5566d94c932c33b27a3e3945d8389c374dd4746
- `pydantic==1.10.13`; wheel: b87326822e71bd5f313e7d3bfdc77ac3247035ac10b0c0618bd99dcf95b1e687
- `pygments==2.21.0`; wheel: 2363c69b61c4a97c838da3b130dcd6468f4848992b21a82f2a63ec34377137d9
- `pytest==9.1.1`; wheel: 37a86b45efb9a47a61a36449063e8e18d0cab3161329fc099eb21783169c4f0c
- `python-dateutil==2.9.0.post0`; wheel: a8b2bc7bffae282281c8140a97d3aa9c14da0b136dfe83f850eea9a5f7470427
- `requests==2.31.0`; wheel: 58cd2187c01e70e6e26505bca751777aa9f2ee0b7f4300988b709f44e013003f
- `rich==15.0.0`; wheel: 33bd4ef74232fb73fe9279a257718407f169c09b78a87ad3d296f548e27de0bb
- `setuptools==75.8.0`; wheel: e3982f444617239225d675215d51f6ba05f845d4eec313da4418fdbb56fb27e3
- `six==1.17.0`; wheel: 4721f391ed90541fddacab5acf947aa0d3dc7d27b2e1e8eda2be8970586c3274
- `toml==0.10.2`; wheel: 806143ae5bfb6a3c6e736a764057db0e6a0e05e338b5630894a5f779cabb4f9b
- `typing-extensions==4.16.0`; wheel: 481caa481374e813c1b176ada14e97f1f67a4539ce9cfeb3f350d78d6370c2e8
- `urllib3==2.8.0`; wheel: 0cf3cae568d36aa9576b28dfb35f11328f1cb974ca7647d9475ebb86c75ac6e3

Test outcomes:

- `tests.test_cache::test_cache_round_trip`: passed
- `tests.test_checker::test_ok_is_up`: passed
- `tests.test_checker::test_missing_is_down`: passed
- `tests.test_checker::test_redirect_is_up`: passed
- `tests.test_checker::test_slow_is_up`: passed
- `tests.test_checker::test_closed_port_is_down`: passed
- `tests.test_checker::test_latin1_title`: passed
- `tests.test_checker::test_user_agent`: passed
- `tests.test_config::test_sites_file_loads`: passed
- `tests.test_report::test_report_renders_all_sites`: failed

Probe outcomes:

- `site_strips_whitespace`: passed
- `site_rejects_empty_name`: passed
- `site_rejects_invalid_url`: passed
- `settings_forbids_extra`: passed
- `settings_defaults`: passed

#### venv: passed

Exit: 0; duration: 24907.0 ms; output truncated: False

Argument vector:

    ["C:\\Users\\yojit\\Documents\\Hackathons\\hacktober\\GemForge\\.venv\\Scripts\\python.exe", "-I", "-X", "utf8", "-m", "venv", "--copies", "C:\\Users\\yojit\\Documents\\Hackathons\\hacktober\\GemForge\\.dist\\verification\\gemforge-ngpm6lf6\\baseline\\venv"]

Sanitized stdout:


Sanitized stderr:


#### python: passed

Exit: 0; duration: 2379.4 ms; output truncated: False

Argument vector:

    ["C:\\Users\\yojit\\Documents\\Hackathons\\hacktober\\GemForge\\.dist\\verification\\gemforge-ngpm6lf6\\baseline\\venv\\Scripts\\python.exe", "-I", "-X", "utf8", "-B", "-c", "import platform; print(platform.python_version())"]

Sanitized stdout:

    3.12.14

Sanitized stderr:


#### install: passed

Exit: 0; duration: 55242.3 ms; output truncated: False

Argument vector:

    ["C:\\Users\\yojit\\Documents\\Hackathons\\hacktober\\GemForge\\.dist\\verification\\gemforge-ngpm6lf6\\baseline\\venv\\Scripts\\python.exe", "-I", "-X", "utf8", "-B", "-m", "pip", "--isolated", "install", "--disable-pip-version-check", "--no-input", "--no-cache-dir", "--only-binary=:all:", "--index-url", "https://pypi.org/simple", "--report", "C:\\Users\\yojit\\Documents\\Hackathons\\hacktober\\GemForge\\.dist\\verification\\gemforge-ngpm6lf6\\baseline\\control\\install.json", "-r", "C:\\Users\\yojit\\Documents\\Hackathons\\hacktober\\GemForge\\.dist\\verification\\gemforge-ngpm6lf6\\baseline\\control\\requirements.txt"]

Sanitized stdout:

    Collecting toml==0.10.2 (from -r C:\Users\yojit\Documents\Hackathons\hacktober\GemForge\.dist\verification\gemforge-ngpm6lf6\baseline\control\requirements.txt (line 1))
      Downloading toml-0.10.2-py2.py3-none-any.whl.metadata (7.1 kB)
    Collecting appdirs==1.4.4 (from -r C:\Users\yojit\Documents\Hackathons\hacktober\GemForge\.dist\verification\gemforge-ngpm6lf6\baseline\control\requirements.txt (line 2))
      Downloading appdirs-1.4.4-py2.py3-none-any.whl.metadata (9.0 kB)
    Collecting requests==2.31.0 (from -r C:\Users\yojit\Documents\Hackathons\hacktober\GemForge\.dist\verification\gemforge-ngpm6lf6\baseline\control\requirements.txt (line 3))
      Downloading requests-2.31.0-py3-none-any.whl.metadata (4.6 kB)
    Collecting Jinja2==2.11.3 (from -r C:\Users\yojit\Documents\Hackathons\hacktober\GemForge\.dist\verification\gemforge-ngpm6lf6\baseline\control\requirements.txt (line 4))
      Downloading Jinja2-2.11.3-py2.py3-none-any.whl.metadata (3.5 kB)
    Collecting pydantic==1.10.13 (from -r C:\Users\yojit\Documents\Hackathons\hacktober\GemForge\.dist\verification\gemforge-ngpm6lf6\baseline\control\requirements.txt (line 5))
      Downloading pydantic-1.10.13-py3-none-any.whl.metadata (149 kB)
    Collecting click>=7 (from -r C:\Users\yojit\Documents\Hackathons\hacktober\GemForge\.dist\verification\gemforge-ngpm6lf6\baseline\control\requirements.txt (line 6))
      Downloading click-8.5.0-py3-none-any.whl.metadata (2.6 kB)
    Collecting six (from -r C:\Users\yojit\Documents\Hackathons\hacktober\GemForge\.dist\verification\gemforge-ngpm6lf6\baseline\control\requirements.txt (line 7))
      Downloading six-1.17.0-py2.py3-none-any.whl.metadata (1.7 kB)
    Collecting chardet==5.2.0 (from -r C:\Users\yojit\Documents\Hackathons\hacktober\GemForge\.dist\verification\gemforge-ngpm6lf6\baseline\control\requirements.txt (line 8))
      Downloading chardet-5.2.0-py3-none-any.whl.metadata (3.4 kB)
    Collecting setuptools==75.8.0 (from -r C:\Users\yojit\Documents\Hackathons\hacktober\GemForge\.dist\verification\gemforge-ngpm6lf6\baseline\control\requirements.txt (line 9))
      Downloading setuptools-75.8.0-py3-none-any.whl.metadata (6.7 kB)
    Collecting idna==2.7 (from -r C:\Users\yojit\Documents\Hackathons\hacktober\GemForge\.dist\verification\gemforge-ngpm6lf6\baseline\control\requirements.txt (line 10))
      Downloading idna-2.7-py2.py3-none-any.whl.metadata (8.9 kB)
    Collecting python-dateutil (from -r C:\Users\yojit\Documents\Hackathons\hacktober\GemForge\.dist\verification\gemforge-ngpm6lf6\baseline\control\requirements.txt (line 11))
      Downloading python_dateutil-2.9.0.post0-py2.py3-none-any.whl.metadata (8.4 kB)
    Collecting rich (from -r C:\Users\yojit\Documents\Hackathons\hacktober\GemForge\.dist\verification\gemforge-ngpm6lf6\baseline\control\requirements.txt (line 12))
      Downloading rich-15.0.0-py3-none-any.whl.metadata (18 kB)
    Collecting pytest (from -r C:\Users\yojit\Documents\Hackathons\hacktober\GemForge\.dist\verification\gemforge-ngpm6lf6\baseline\control\requirements.txt (line 13))
      Downloading pytest-9.1.1-py3-none-any.whl.metadata (7.6 kB)
    Collecting nose==1.3.7 (from -r C:\Users\yojit\Documents\Hackathons\hacktober\GemForge\.dist\verification\gemforge-ngpm6lf6\baseline\control\requirements.txt (line 14))
      Downloading nose-1.3.7-py3-none-any.whl.metadata (1.7 kB)
    Collecting charset-normalizer<4,>=2 (from requests==2.31.0->-r C:\Users\yojit\Documents\Hackathons\hacktober\GemForge\.dist\verification\gemforge-ngpm6lf6\baseline\control\requirements.txt (line 3))
      Downloading charset_normalizer-3.5.2-cp312-cp312-win_amd64.whl.metadata (47 kB)
    Collecting urllib3<3,>=1.21.1 (from requests==2.31.0->-r C:\Users\yojit\Documents\Hackathons\hacktober\GemForge\.dist\verification\gemforge-ngpm6lf6\baseline\control\requirements.txt (line 3))
      Downloading urllib3-2.8.0-py3-none-any.whl.metadata (7.4 kB)
    Collecting certifi>=2017.4.17 (from requests==2.31.0->-r C:\Users\yojit\Documents\Hackathons\hacktober\GemForge\.dist\verification\gemforge-ngpm6lf6\baseline\control\requirements.txt (line 3))
      Downloading certifi-2026.7.22-py3-none-any.whl.metadata (2.5 kB)
    Collecting MarkupSafe>=0.23 (from Jinja2==2.11.3->-r C:\Users\yojit\Documents\Hackathons\hacktober\GemForge\.dist\verification\gemforge-ngpm6lf6\baseline\control\requirements.txt (line 4))
      Downloading markupsafe-3.0.4-cp312-cp312-win_amd64.whl.metadata (2.8 kB)
    Collecting typing-extensions>=4.2.0 (from pydantic==1.10.13->-r C:\Users\yojit\Documents\Hackathons\hacktober\GemForge\.dist\verification\gemforge-ngpm6lf6\baseline\control\requirements.txt (line 5))
      Downloading typing_extensions-4.16.0-py3-none-any.whl.metadata (3.3 kB)
    Collecting markdown-it-py>=2.2.0 (from rich->-r C:\Users\yojit\Documents\Hackathons\hacktober\GemForge\.dist\verification\gemforge-ngpm6lf6\baseline\control\requirements.txt (line 12))
      Downloading markdown_it_py-4.2.0-py3-none-any.whl.metadata (7.4 kB)
    Collecting pygments<3.0.0,>=2.13.0 (from rich->-r C:\Users\yojit\Documents\Hackathons\hacktober\GemForge\.dist\verification\gemforge-ngpm6lf6\baseline\control\requirements.txt (line 12))
      Downloading pygments-2.21.0-py3-none-any.whl.metadata (2.5 kB)
    Collecting colorama>=0.4 (from pytest->-r C:\Users\yojit\Documents\Hackathons\hacktober\GemForge\.dist\verification\gemforge-ngpm6lf6\baseline\control\requirements.txt (line 13))
      Downloading colorama-0.4.6-py2.py3-none-any.whl.metadata (17 kB)
    Collecting iniconfig>=1.0.1 (from pytest->-r C:\Users\yojit\Documents\Hackathons\hacktober\GemForge\.dist\verification\gemforge-ngpm6lf6\baseline\control\requirements.txt (line 13))
      Downloading iniconfig-2.3.1-py3-none-any.whl.metadata (2.8 kB)
    Collecting packaging>=22 (from pytest->-r C:\Users\yojit\Documents\Hackathons\hacktober\GemForge\.dist\verification\gemforge-ngpm6lf6\baseline\control\requirements.txt (line 13))
      Downloading packaging-26.3-py3-none-any.whl.metadata (3.5 kB)
    Collecting pluggy<2,>=1.5 (from pytest->-r C:\Users\yojit\Documents\Hackathons\hacktober\GemForge\.dist\verification\gemforge-ngpm6lf6\baseline\control\requirements.txt (line 13))
      Downloading pluggy-1.6.0-py3-none-any.whl.metadata (4.8 kB)
    Collecting mdurl~=0.1 (from markdown-it-py>=2.2.0->rich->-r C:\Users\yojit\Documents\Hackathons\hacktober\GemForge\.dist\verification\gemforge-ngpm6lf6\baseline\control\requirements.txt (line 12))
      Downloading mdurl-0.1.2-py3-none-any.whl.metadata (1.6 kB)
    Downloading toml-0.10.2-py2.py3-none-any.whl (16 kB)
    Downloading appdirs-1.4.4-py2.py3-none-any.whl (9.6 kB)
    Downloading requests-2.31.0-py3-none-any.whl (62 kB)
    Downloading Jinja2-2.11.3-py2.py3-none-any.whl (125 kB)
    Downloading pydantic-1.10.13-py3-none-any.whl (158 kB)
    Downloading chardet-5.2.0-py3-none-any.whl (199 kB)
    Downloading setuptools-75.8.0-py3-none-any.whl (1.2 MB)
       ---------------------------------------- 1.2/1.2 MB 10.3 MB/s eta 0:00:00
    Downloading idna-2.7-py2.py3-none-any.whl (58 kB)
    Downloading nose-1.3.7-py3-none-any.whl (154 kB)
    Downloading click-8.5.0-py3-none-any.whl (125 kB)
    Downloading six-1.17.0-py2.py3-none-any.whl (11 kB)
    Downloading python_dateutil-2.9.0.post0-py2.py3-none-any.whl (229 kB)
    Downloading rich-15.0.0-py3-none-any.whl (310 kB)
    Downloading pytest-9.1.1-py3-none-any.whl (386 kB)
    Downloading certifi-2026.7.22-py3-none-any.whl (136 kB)
    Downloading charset_normalizer-3.5.2-cp312-cp312-win_amd64.whl (207 kB)
    Downloading colorama-0.4.6-py2.py3-none-any.whl (25 kB)
    Downloading iniconfig-2.3.1-py3-none-any.whl (7.6 kB)
    Downloading markdown_it_py-4.2.0-py3-none-any.whl (91 kB)
    Downloading markupsafe-3.0.4-cp312-cp312-win_amd64.whl (14 kB)
    Downloading packaging-26.3-py3-none-any.whl (129 kB)
    Downloading pluggy-1.6.0-py3-none-any.whl (20 kB)
    Downloading pygments-2.21.0-py3-none-any.whl (1.3 MB)
       ---------------------------------------- 1.3/1.3 MB 21.0 MB/s eta 0:00:00
    Downloading typing_extensions-4.16.0-py3-none-any.whl (45 kB)
    Downloading urllib3-2.8.0-py3-none-any.whl (135 kB)
    Downloading mdurl-0.1.2-py3-none-any.whl (10.0 kB)
    Installing collected packages: nose, idna, appdirs, urllib3, typing-extensions, toml, six, setuptools, pygments, pluggy, packaging, mdurl, MarkupSafe, iniconfig, colorama, click, charset-normalizer, chardet, certifi, requests, python-dateutil, pytest, pydantic, markdown-it-py, Jinja2, rich
    Successfully installed Jinja2-2.11.3 MarkupSafe-3.0.4 appdirs-1.4.4 certifi-2026.7.22 chardet-5.2.0 charset-normalizer-3.5.2 click-8.5.0 colorama-0.4.6 idna-2.7 iniconfig-2.3.1 markdown-it-py-4.2.0 mdurl-0.1.2 nose-1.3.7 packaging-26.3 pluggy-1.6.0 pydantic-1.10.13 pygments-2.21.0 pytest-9.1.1 python-dateutil-2.9.0.post0 requests-2.31.0 rich-15.0.0 setuptools-75.8.0 six-1.17.0 toml-0.10.2 typing-extensions-4.16.0 urllib3-2.8.0

Sanitized stderr:


#### packages: passed

Exit: 0; duration: 3188.7 ms; output truncated: False

Argument vector:

    ["C:\\Users\\yojit\\Documents\\Hackathons\\hacktober\\GemForge\\.dist\\verification\\gemforge-ngpm6lf6\\baseline\\venv\\Scripts\\python.exe", "-I", "-X", "utf8", "-B", "-m", "pip", "--isolated", "list", "--format=json", "--disable-pip-version-check"]

Sanitized stdout:

    [{"name": "appdirs", "version": "1.4.4"}, {"name": "certifi", "version": "2026.7.22"}, {"name": "chardet", "version": "5.2.0"}, {"name": "charset-normalizer", "version": "3.5.2"}, {"name": "click", "version": "8.5.0"}, {"name": "colorama", "version": "0.4.6"}, {"name": "idna", "version": "2.7"}, {"name": "iniconfig", "version": "2.3.1"}, {"name": "Jinja2", "version": "2.11.3"}, {"name": "markdown-it-py", "version": "4.2.0"}, {"name": "MarkupSafe", "version": "3.0.4"}, {"name": "mdurl", "version": "0.1.2"}, {"name": "nose", "version": "1.3.7"}, {"name": "packaging", "version": "26.3"}, {"name": "pip", "version": "25.0.1"}, {"name": "pluggy", "version": "1.6.0"}, {"name": "pydantic", "version": "1.10.13"}, {"name": "Pygments", "version": "2.21.0"}, {"name": "pytest", "version": "9.1.1"}, {"name": "python-dateutil", "version": "2.9.0.post0"}, {"name": "requests", "version": "2.31.0"}, {"name": "rich", "version": "15.0.0"}, {"name": "setuptools", "version": "75.8.0"}, {"name": "six", "version": "1.17.0"}, {"name": "toml", "version": "0.10.2"}, {"name": "typing_extensions", "version": "4.16.0"}, {"name": "urllib3", "version": "2.8.0"}]

Sanitized stderr:


#### syntax: passed

Exit: 0; duration: 2210.2 ms; output truncated: False

Argument vector:

    ["C:\\Users\\yojit\\Documents\\Hackathons\\hacktober\\GemForge\\.dist\\verification\\gemforge-ngpm6lf6\\baseline\\venv\\Scripts\\python.exe", "-I", "-X", "utf8", "-B", "C:\\Users\\yojit\\Documents\\Hackathons\\hacktober\\GemForge\\.dist\\verification\\gemforge-ngpm6lf6\\baseline\\control\\runner.py", "syntax", "C:\\Users\\yojit\\Documents\\Hackathons\\hacktober\\GemForge\\.dist\\verification\\gemforge-ngpm6lf6\\baseline\\repo", "C:\\Users\\yojit\\Documents\\Hackathons\\hacktober\\GemForge\\.dist\\verification\\gemforge-ngpm6lf6\\baseline\\control\\syntax.json"]

Sanitized stdout:

    {"files_parsed": 15}

Sanitized stderr:


#### import: passed

Exit: 0; duration: 2267.4 ms; output truncated: False

Argument vector:

    ["C:\\Users\\yojit\\Documents\\Hackathons\\hacktober\\GemForge\\.dist\\verification\\gemforge-ngpm6lf6\\baseline\\venv\\Scripts\\python.exe", "-I", "-X", "utf8", "-B", "C:\\Users\\yojit\\Documents\\Hackathons\\hacktober\\GemForge\\.dist\\verification\\gemforge-ngpm6lf6\\baseline\\control\\runner.py", "import", "C:\\Users\\yojit\\Documents\\Hackathons\\hacktober\\GemForge\\.dist\\verification\\gemforge-ngpm6lf6\\baseline\\repo", "C:\\Users\\yojit\\Documents\\Hackathons\\hacktober\\GemForge\\.dist\\verification\\gemforge-ngpm6lf6\\baseline\\control\\import.json", "linkwatch.config"]

Sanitized stdout:

    {"imported": "linkwatch.config"}

Sanitized stderr:


#### pytest: failed

Exit: 1; duration: 13694.0 ms; output truncated: False

Argument vector:

    ["C:\\Users\\yojit\\Documents\\Hackathons\\hacktober\\GemForge\\.dist\\verification\\gemforge-ngpm6lf6\\baseline\\venv\\Scripts\\python.exe", "-I", "-X", "utf8", "-B", "C:\\Users\\yojit\\Documents\\Hackathons\\hacktober\\GemForge\\.dist\\verification\\gemforge-ngpm6lf6\\baseline\\control\\runner.py", "pytest", "C:\\Users\\yojit\\Documents\\Hackathons\\hacktober\\GemForge\\.dist\\verification\\gemforge-ngpm6lf6\\baseline\\repo", "C:\\Users\\yojit\\Documents\\Hackathons\\hacktober\\GemForge\\.dist\\verification\\gemforge-ngpm6lf6\\baseline\\control\\pytest.xml"]

Sanitized stdout:

    .........F                                                               [100%]
    ================================== FAILURES ===================================
    ________________________ test_report_renders_all_sites ________________________
    
    tmp_path = WindowsPath('C:/Users/yojit/Documents/Hackathons/hacktober/GemForge/.dist/verification/gemforge-ngpm6lf6/baseline/control/test-tmp/test_report_renders_all_sites0')
    monkeypatch = <_pytest.monkeypatch.MonkeyPatch object at 0x00000250BA7D5580>
    
        def test_report_renders_all_sites(tmp_path, monkeypatch):
            monkeypatch.setenv("LINKWATCH_CACHE_DIR", str(tmp_path))
            cache.save_results(RESULTS)
            output = tmp_path / "status.html"
    >       result = CliRunner().invoke(cli, ["report", "-o", str(output)], catch_exceptions=False)
                     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    
    tests\test_report.py:20: 
    _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    ..\venv\Lib\site-packages\click\testing.py:687: in invoke
        return_value = cli.main(args=args or (), prog_name=prog_name, **extra)
                       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    ..\venv\Lib\site-packages\click\core.py:1552: in main
        rv = self.invoke(ctx)
             ^^^^^^^^^^^^^^^^
    ..\venv\Lib\site-packages\click\core.py:2032: in invoke
        return _process_result(sub_ctx.command.invoke(sub_ctx))
                               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    ..\venv\Lib\site-packages\click\core.py:1415: in invoke
        return ctx.invoke(self.callback, **ctx.params)
               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    ..\venv\Lib\site-packages\click\core.py:910: in invoke
        return callback(*args, **kwargs)
               ^^^^^^^^^^^^^^^^^^^^^^^^^
    linkwatch\cli.py:56: in report
        from .report import render_report
    linkwatch\report.py:3: in <module>
        from jinja2 import Environment, FileSystemLoader, select_autoescape
    ..\venv\Lib\site-packages\jinja2\__init__.py:12: in <module>
        from .environment import Environment
    ..\venv\Lib\site-packages\jinja2\environment.py:25: in <module>
        from .defaults import BLOCK_END_STRING
    ..\venv\Lib\site-packages\jinja2\defaults.py:3: in <module>
        from .filters import FILTERS as DEFAULT_FILTERS  # noqa: F401
        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    
        # -*- coding: utf-8 -*-
        """Built-in template filters used with the ``|`` operator."""
        import math
        import random
        import re
        import warnings
        from collections import namedtuple
        from itertools import chain
        from itertools import groupby
        
        from markupsafe import escape
        from markupsafe import Markup
    >   from markupsafe import soft_unicode
    E   ImportError: cannot import name 'soft_unicode' from 'markupsafe' (C:\Users\yojit\Documents\Hackathons\hacktober\GemForge\.dist\verification\gemforge-ngpm6lf6\baseline\venv\Lib\site-packages\markupsafe\__init__.py)
    
    ..\venv\Lib\site-packages\jinja2\filters.py:13: ImportError
    ============================== warnings summary ===============================
    linkwatch\resources.py:1
      C:\Users\yojit\Documents\Hackathons\hacktober\GemForge\.dist\verification\gemforge-ngpm6lf6\baseline\repo\linkwatch\resources.py:1: DeprecationWarning: pkg_resources is deprecated as an API. See [URL redacted]
        import pkg_resources
    
    -- Docs: [URL redacted]
    =========================== short test summary info ===========================
    FAILED tests/test_report.py::test_report_renders_all_sites - ImportError: can...
    1 failed, 9 passed, 1 warning in 9.45s

Sanitized stderr:


#### probes: passed

Exit: 0; duration: 1845.0 ms; output truncated: False

Argument vector:

    ["C:\\Users\\yojit\\Documents\\Hackathons\\hacktober\\GemForge\\.dist\\verification\\gemforge-ngpm6lf6\\baseline\\venv\\Scripts\\python.exe", "-I", "-X", "utf8", "-B", "C:\\Users\\yojit\\Documents\\Hackathons\\hacktober\\GemForge\\.dist\\verification\\gemforge-ngpm6lf6\\baseline\\control\\runner.py", "probes", "C:\\Users\\yojit\\Documents\\Hackathons\\hacktober\\GemForge\\.dist\\verification\\gemforge-ngpm6lf6\\baseline\\repo", "C:\\Users\\yojit\\Documents\\Hackathons\\hacktober\\GemForge\\.dist\\verification\\gemforge-ngpm6lf6\\baseline\\control\\probes.json", "C:\\Users\\yojit\\Documents\\Hackathons\\hacktober\\GemForge\\.dist\\verification\\gemforge-ngpm6lf6\\baseline\\control\\probe-specs.json"]

Sanitized stdout:

    [{"name": "site_strips_whitespace", "status": "passed", "actual": {"name": "alpha"}}, {"name": "site_rejects_empty_name", "status": "passed", "actual_exception": "ValidationError"}, {"name": "site_rejects_invalid_url", "status": "passed", "actual_exception": "ValidationError"}, {"name": "settings_forbids_extra", "status": "passed", "actual_exception": "ValidationError"}, {"name": "settings_defaults", "status": "passed", "actual": {"title": "linkwatch", "output": "status.html", "sites": []}}]

Sanitized stderr:


### Candidate execution

Python: 3.12.14

Installation requirements:

- `toml==0.10.2`
- `appdirs==1.4.4`
- `requests==2.31.0`
- `Jinja2==2.11.3`
- `pydantic<3,>=2`
- `click>=7`
- `six`
- `chardet==5.2.0`
- `setuptools==75.8.0`
- `idna==2.7`
- `python-dateutil`
- `rich`
- `pytest`
- `nose==1.3.7`
- `pytest>=8.3,<10`

Pinned control constraints:

- `appdirs==1.4.4`
- `certifi==2026.7.22`
- `chardet==5.2.0`
- `charset-normalizer==3.5.2`
- `click==8.5.0`
- `colorama==0.4.6`
- `idna==2.7`
- `iniconfig==2.3.1`
- `jinja2==2.11.3`
- `markdown-it-py==4.2.0`
- `markupsafe==3.0.4`
- `mdurl==0.1.2`
- `nose==1.3.7`
- `packaging==26.3`
- `pluggy==1.6.0`
- `pygments==2.21.0`
- `pytest==9.1.1`
- `python-dateutil==2.9.0.post0`
- `requests==2.31.0`
- `rich==15.0.0`
- `setuptools==75.8.0`
- `six==1.17.0`
- `toml==0.10.2`
- `typing-extensions==4.16.0`
- `urllib3==2.8.0`

Installed versions and wheel SHA256:

- `annotated-types==0.8.0`; wheel: f072f4d804ea359e4eaf198b1af7a8b0943881a87f31bb764f8bf219bb9419e0
- `appdirs==1.4.4`; wheel: a841dacd6b99318a741b166adb07e19ee71a274450e68237b4650ca1055ab128
- `certifi==2026.7.22`; wheel: 62f22742b58a1a33014a2b6b706588a8d7e2a88ae7bd1a6ebe8c992928483775
- `chardet==5.2.0`; wheel: e1cf59446890a00105fe7b7912492ea04b6e6f06d4b742b2c788469e34c82970
- `charset-normalizer==3.5.2`; wheel: 780fbe7cab297b81dad9fb8dc5eb003c0468ffb0d9e5f65068c53a34661a96bc
- `click==8.5.0`; wheel: 255bc9599cf7748b4b1a446ccc735421bd08a2ae529a8b88597d3de5664ee360
- `colorama==0.4.6`; wheel: 4f1d9991f5acc0ca119f9d443620b77f9d6b33703e51011c16baf57afb285fc6
- `idna==2.7`; wheel: 156a6814fb5ac1fc6850fb002e0852d56c0c8d2531923a51032d1b70760e186e
- `iniconfig==2.3.1`; wheel: 9121e2c1fdb355232495be3194c8dfe87ccc2d5dee45947b78e68f499790d7a7
- `jinja2==2.11.3`; wheel: 03e47ad063331dd6a3f04a43eddca8a966a26ba0c5b7207a9a9e4e08f1b29419
- `markdown-it-py==4.2.0`; wheel: 9f7ebbcd14fe59494226453aed97c1070d83f8d24b6fc3a3bcf9a38092641c4a
- `markupsafe==3.0.4`; wheel: 11935df9bf455ed0c04eb87bcd720f02b1fe5e02128a9430f23aed6f93336fc7
- `mdurl==0.1.2`; wheel: 84008a41e51615a49fc9966191ff91509e3c40b939176e643fd50a5c2196b8f8
- `nose==1.3.7`; wheel: 9ff7c6cc443f8c51994b34a667bbcf45afd6d945be7477b52e97516fd17c53ac
- `packaging==26.3`; wheel: d7193f7c8e4e93f444fde0262bf90af30e16fa0ad0ad44cb553c87339b23cd1c
- `pip==25.0.1`; wheel: not captured
- `pluggy==1.6.0`; wheel: e920276dd6813095e9377c0bc5566d94c932c33b27a3e3945d8389c374dd4746
- `pydantic==2.14.1`; wheel: 9195d967ec791692a04438115466764fb8b9a27b31f14a760437694f40d6b454
- `pydantic-core==2.50.1`; wheel: 132529c83901437ff642f585216831bf5fd7a91df66829907e155192ead62498
- `pygments==2.21.0`; wheel: 2363c69b61c4a97c838da3b130dcd6468f4848992b21a82f2a63ec34377137d9
- `pytest==9.1.1`; wheel: 37a86b45efb9a47a61a36449063e8e18d0cab3161329fc099eb21783169c4f0c
- `python-dateutil==2.9.0.post0`; wheel: a8b2bc7bffae282281c8140a97d3aa9c14da0b136dfe83f850eea9a5f7470427
- `requests==2.31.0`; wheel: 58cd2187c01e70e6e26505bca751777aa9f2ee0b7f4300988b709f44e013003f
- `rich==15.0.0`; wheel: 33bd4ef74232fb73fe9279a257718407f169c09b78a87ad3d296f548e27de0bb
- `setuptools==75.8.0`; wheel: e3982f444617239225d675215d51f6ba05f845d4eec313da4418fdbb56fb27e3
- `six==1.17.0`; wheel: 4721f391ed90541fddacab5acf947aa0d3dc7d27b2e1e8eda2be8970586c3274
- `toml==0.10.2`; wheel: 806143ae5bfb6a3c6e736a764057db0e6a0e05e338b5630894a5f779cabb4f9b
- `typing-extensions==4.16.0`; wheel: 481caa481374e813c1b176ada14e97f1f67a4539ce9cfeb3f350d78d6370c2e8
- `typing-inspection==0.4.4`; wheel: 65b8397ba37ccbce054456aaccddfc91e6e3083c92824df348d96ca832f3f147
- `urllib3==2.8.0`; wheel: 0cf3cae568d36aa9576b28dfb35f11328f1cb974ca7647d9475ebb86c75ac6e3

Test outcomes:

- `tests.test_cache::test_cache_round_trip`: passed
- `tests.test_checker::test_ok_is_up`: passed
- `tests.test_checker::test_missing_is_down`: passed
- `tests.test_checker::test_redirect_is_up`: passed
- `tests.test_checker::test_slow_is_up`: passed
- `tests.test_checker::test_closed_port_is_down`: passed
- `tests.test_checker::test_latin1_title`: passed
- `tests.test_checker::test_user_agent`: passed
- `tests.test_config::test_sites_file_loads`: passed
- `tests.test_report::test_report_renders_all_sites`: failed

Probe outcomes:

- `site_strips_whitespace`: failed
- `site_rejects_empty_name`: passed
- `site_rejects_invalid_url`: passed
- `settings_forbids_extra`: passed
- `settings_defaults`: passed

#### venv: passed

Exit: 0; duration: 19605.7 ms; output truncated: False

Argument vector:

    ["C:\\Users\\yojit\\Documents\\Hackathons\\hacktober\\GemForge\\.venv\\Scripts\\python.exe", "-I", "-X", "utf8", "-m", "venv", "--copies", "C:\\Users\\yojit\\Documents\\Hackathons\\hacktober\\GemForge\\.dist\\verification\\gemforge-ngpm6lf6\\candidate\\venv"]

Sanitized stdout:


Sanitized stderr:


#### python: passed

Exit: 0; duration: 1773.9 ms; output truncated: False

Argument vector:

    ["C:\\Users\\yojit\\Documents\\Hackathons\\hacktober\\GemForge\\.dist\\verification\\gemforge-ngpm6lf6\\candidate\\venv\\Scripts\\python.exe", "-I", "-X", "utf8", "-B", "-c", "import platform; print(platform.python_version())"]

Sanitized stdout:

    3.12.14

Sanitized stderr:


#### install: passed

Exit: 0; duration: 50213.5 ms; output truncated: False

Argument vector:

    ["C:\\Users\\yojit\\Documents\\Hackathons\\hacktober\\GemForge\\.dist\\verification\\gemforge-ngpm6lf6\\candidate\\venv\\Scripts\\python.exe", "-I", "-X", "utf8", "-B", "-m", "pip", "--isolated", "install", "--disable-pip-version-check", "--no-input", "--no-cache-dir", "--only-binary=:all:", "--index-url", "https://pypi.org/simple", "--report", "C:\\Users\\yojit\\Documents\\Hackathons\\hacktober\\GemForge\\.dist\\verification\\gemforge-ngpm6lf6\\candidate\\control\\install.json", "-r", "C:\\Users\\yojit\\Documents\\Hackathons\\hacktober\\GemForge\\.dist\\verification\\gemforge-ngpm6lf6\\candidate\\control\\requirements.txt", "-c", "C:\\Users\\yojit\\Documents\\Hackathons\\hacktober\\GemForge\\.dist\\verification\\gemforge-ngpm6lf6\\candidate\\control\\constraints.txt"]

Sanitized stdout:

    Collecting toml==0.10.2 (from -r C:\Users\yojit\Documents\Hackathons\hacktober\GemForge\.dist\verification\gemforge-ngpm6lf6\candidate\control\requirements.txt (line 1))
      Downloading toml-0.10.2-py2.py3-none-any.whl.metadata (7.1 kB)
    Collecting appdirs==1.4.4 (from -r C:\Users\yojit\Documents\Hackathons\hacktober\GemForge\.dist\verification\gemforge-ngpm6lf6\candidate\control\requirements.txt (line 2))
      Downloading appdirs-1.4.4-py2.py3-none-any.whl.metadata (9.0 kB)
    Collecting requests==2.31.0 (from -r C:\Users\yojit\Documents\Hackathons\hacktober\GemForge\.dist\verification\gemforge-ngpm6lf6\candidate\control\requirements.txt (line 3))
      Downloading requests-2.31.0-py3-none-any.whl.metadata (4.6 kB)
    Collecting Jinja2==2.11.3 (from -r C:\Users\yojit\Documents\Hackathons\hacktober\GemForge\.dist\verification\gemforge-ngpm6lf6\candidate\control\requirements.txt (line 4))
      Downloading Jinja2-2.11.3-py2.py3-none-any.whl.metadata (3.5 kB)
    Collecting pydantic<3,>=2 (from -r C:\Users\yojit\Documents\Hackathons\hacktober\GemForge\.dist\verification\gemforge-ngpm6lf6\candidate\control\requirements.txt (line 5))
      Downloading pydantic-2.14.1-py3-none-any.whl.metadata (133 kB)
    Collecting click>=7 (from -r C:\Users\yojit\Documents\Hackathons\hacktober\GemForge\.dist\verification\gemforge-ngpm6lf6\candidate\control\requirements.txt (line 6))
      Downloading click-8.5.0-py3-none-any.whl.metadata (2.6 kB)
    Collecting six (from -r C:\Users\yojit\Documents\Hackathons\hacktober\GemForge\.dist\verification\gemforge-ngpm6lf6\candidate\control\requirements.txt (line 7))
      Downloading six-1.17.0-py2.py3-none-any.whl.metadata (1.7 kB)
    Collecting chardet==5.2.0 (from -r C:\Users\yojit\Documents\Hackathons\hacktober\GemForge\.dist\verification\gemforge-ngpm6lf6\candidate\control\requirements.txt (line 8))
      Downloading chardet-5.2.0-py3-none-any.whl.metadata (3.4 kB)
    Collecting setuptools==75.8.0 (from -r C:\Users\yojit\Documents\Hackathons\hacktober\GemForge\.dist\verification\gemforge-ngpm6lf6\candidate\control\requirements.txt (line 9))
      Downloading setuptools-75.8.0-py3-none-any.whl.metadata (6.7 kB)
    Collecting idna==2.7 (from -r C:\Users\yojit\Documents\Hackathons\hacktober\GemForge\.dist\verification\gemforge-ngpm6lf6\candidate\control\requirements.txt (line 10))
      Downloading idna-2.7-py2.py3-none-any.whl.metadata (8.9 kB)
    Collecting python-dateutil (from -r C:\Users\yojit\Documents\Hackathons\hacktober\GemForge\.dist\verification\gemforge-ngpm6lf6\candidate\control\requirements.txt (line 11))
      Downloading python_dateutil-2.9.0.post0-py2.py3-none-any.whl.metadata (8.4 kB)
    Collecting rich (from -r C:\Users\yojit\Documents\Hackathons\hacktober\GemForge\.dist\verification\gemforge-ngpm6lf6\candidate\control\requirements.txt (line 12))
      Downloading rich-15.0.0-py3-none-any.whl.metadata (18 kB)
    Collecting pytest (from -r C:\Users\yojit\Documents\Hackathons\hacktober\GemForge\.dist\verification\gemforge-ngpm6lf6\candidate\control\requirements.txt (line 13))
      Downloading pytest-9.1.1-py3-none-any.whl.metadata (7.6 kB)
    Collecting nose==1.3.7 (from -r C:\Users\yojit\Documents\Hackathons\hacktober\GemForge\.dist\verification\gemforge-ngpm6lf6\candidate\control\requirements.txt (line 14))
      Downloading nose-1.3.7-py3-none-any.whl.metadata (1.7 kB)
    Collecting charset-normalizer<4,>=2 (from requests==2.31.0->-r C:\Users\yojit\Documents\Hackathons\hacktober\GemForge\.dist\verification\gemforge-ngpm6lf6\candidate\control\requirements.txt (line 3))
      Downloading charset_normalizer-3.5.2-cp312-cp312-win_amd64.whl.metadata (47 kB)
    Collecting urllib3<3,>=1.21.1 (from requests==2.31.0->-r C:\Users\yojit\Documents\Hackathons\hacktober\GemForge\.dist\verification\gemforge-ngpm6lf6\candidate\control\requirements.txt (line 3))
      Downloading urllib3-2.8.0-py3-none-any.whl.metadata (7.4 kB)
    Collecting certifi>=2017.4.17 (from requests==2.31.0->-r C:\Users\yojit\Documents\Hackathons\hacktober\GemForge\.dist\verification\gemforge-ngpm6lf6\candidate\control\requirements.txt (line 3))
      Downloading certifi-2026.7.22-py3-none-any.whl.metadata (2.5 kB)
    Collecting MarkupSafe>=0.23 (from Jinja2==2.11.3->-r C:\Users\yojit\Documents\Hackathons\hacktober\GemForge\.dist\verification\gemforge-ngpm6lf6\candidate\control\requirements.txt (line 4))
      Downloading markupsafe-3.0.4-cp312-cp312-win_amd64.whl.metadata (2.8 kB)
    Collecting annotated-types>=0.6.0 (from pydantic<3,>=2->-r C:\Users\yojit\Documents\Hackathons\hacktober\GemForge\.dist\verification\gemforge-ngpm6lf6\candidate\control\requirements.txt (line 5))
      Downloading annotated_types-0.8.0-py3-none-any.whl.metadata (15 kB)
    Collecting pydantic-core==2.50.1 (from pydantic<3,>=2->-r C:\Users\yojit\Documents\Hackathons\hacktober\GemForge\.dist\verification\gemforge-ngpm6lf6\candidate\control\requirements.txt (line 5))
      Downloading pydantic_core-2.50.1-cp312-cp312-win_amd64.whl.metadata (6.7 kB)
    Collecting typing-extensions>=4.16.0 (from pydantic<3,>=2->-r C:\Users\yojit\Documents\Hackathons\hacktober\GemForge\.dist\verification\gemforge-ngpm6lf6\candidate\control\requirements.txt (line 5))
      Downloading typing_extensions-4.16.0-py3-none-any.whl.metadata (3.3 kB)
    Collecting typing-inspection>=0.4.4 (from pydantic<3,>=2->-r C:\Users\yojit\Documents\Hackathons\hacktober\GemForge\.dist\verification\gemforge-ngpm6lf6\candidate\control\requirements.txt (line 5))
      Downloading typing_inspection-0.4.4-py3-none-any.whl.metadata (2.6 kB)
    Collecting markdown-it-py>=2.2.0 (from rich->-r C:\Users\yojit\Documents\Hackathons\hacktober\GemForge\.dist\verification\gemforge-ngpm6lf6\candidate\control\requirements.txt (line 12))
      Downloading markdown_it_py-4.2.0-py3-none-any.whl.metadata (7.4 kB)
    Collecting pygments<3.0.0,>=2.13.0 (from rich->-r C:\Users\yojit\Documents\Hackathons\hacktober\GemForge\.dist\verification\gemforge-ngpm6lf6\candidate\control\requirements.txt (line 12))
      Downloading pygments-2.21.0-py3-none-any.whl.metadata (2.5 kB)
    Collecting colorama>=0.4 (from pytest->-r C:\Users\yojit\Documents\Hackathons\hacktober\GemForge\.dist\verification\gemforge-ngpm6lf6\candidate\control\requirements.txt (line 13))
      Downloading colorama-0.4.6-py2.py3-none-any.whl.metadata (17 kB)
    Collecting iniconfig>=1.0.1 (from pytest->-r C:\Users\yojit\Documents\Hackathons\hacktober\GemForge\.dist\verification\gemforge-ngpm6lf6\candidate\control\requirements.txt (line 13))
      Downloading iniconfig-2.3.1-py3-none-any.whl.metadata (2.8 kB)
    Collecting packaging>=22 (from pytest->-r C:\Users\yojit\Documents\Hackathons\hacktober\GemForge\.dist\verification\gemforge-ngpm6lf6\candidate\control\requirements.txt (line 13))
      Downloading packaging-26.3-py3-none-any.whl.metadata (3.5 kB)
    Collecting pluggy<2,>=1.5 (from pytest->-r C:\Users\yojit\Documents\Hackathons\hacktober\GemForge\.dist\verification\gemforge-ngpm6lf6\candidate\control\requirements.txt (line 13))
      Downloading pluggy-1.6.0-py3-none-any.whl.metadata (4.8 kB)
    Collecting mdurl~=0.1 (from markdown-it-py>=2.2.0->rich->-r C:\Users\yojit\Documents\Hackathons\hacktober\GemForge\.dist\verification\gemforge-ngpm6lf6\candidate\control\requirements.txt (line 12))
      Downloading mdurl-0.1.2-py3-none-any.whl.metadata (1.6 kB)
    Downloading toml-0.10.2-py2.py3-none-any.whl (16 kB)
    Downloading appdirs-1.4.4-py2.py3-none-any.whl (9.6 kB)
    Downloading requests-2.31.0-py3-none-any.whl (62 kB)
    Downloading Jinja2-2.11.3-py2.py3-none-any.whl (125 kB)
    Downloading chardet-5.2.0-py3-none-any.whl (199 kB)
    Downloading setuptools-75.8.0-py3-none-any.whl (1.2 MB)
       ---------------------------------------- 1.2/1.2 MB 12.4 MB/s eta 0:00:00
    Downloading idna-2.7-py2.py3-none-any.whl (58 kB)
    Downloading nose-1.3.7-py3-none-any.whl (154 kB)
    Downloading pydantic-2.14.1-py3-none-any.whl (488 kB)
    Downloading pydantic_core-2.50.1-cp312-cp312-win_amd64.whl (2.2 MB)
       ---------------------------------------- 2.2/2.2 MB 13.5 MB/s eta 0:00:00
    Downloading click-8.5.0-py3-none-any.whl (125 kB)
    Downloading six-1.17.0-py2.py3-none-any.whl (11 kB)
    Downloading python_dateutil-2.9.0.post0-py2.py3-none-any.whl (229 kB)
    Downloading rich-15.0.0-py3-none-any.whl (310 kB)
    Downloading pytest-9.1.1-py3-none-any.whl (386 kB)
    Downloading annotated_types-0.8.0-py3-none-any.whl (13 kB)
    Downloading certifi-2026.7.22-py3-none-any.whl (136 kB)
    Downloading charset_normalizer-3.5.2-cp312-cp312-win_amd64.whl (207 kB)
    Downloading colorama-0.4.6-py2.py3-none-any.whl (25 kB)
    Downloading iniconfig-2.3.1-py3-none-any.whl (7.6 kB)
    Downloading markdown_it_py-4.2.0-py3-none-any.whl (91 kB)
    Downloading markupsafe-3.0.4-cp312-cp312-win_amd64.whl (14 kB)
    Downloading packaging-26.3-py3-none-any.whl (129 kB)
    Downloading pluggy-1.6.0-py3-none-any.whl (20 kB)
    Downloading pygments-2.21.0-py3-none-any.whl (1.3 MB)
       ---------------------------------------- 1.3/1.3 MB 15.7 MB/s eta 0:00:00
    Downloading typing_extensions-4.16.0-py3-none-any.whl (45 kB)
    Downloading typing_inspection-0.4.4-py3-none-any.whl (14 kB)
    Downloading urllib3-2.8.0-py3-none-any.whl (135 kB)
    Downloading mdurl-0.1.2-py3-none-any.whl (10.0 kB)
    Installing collected packages: nose, idna, appdirs, urllib3, typing-extensions, toml, six, setuptools, pygments, pluggy, packaging, mdurl, MarkupSafe, iniconfig, colorama, click, charset-normalizer, chardet, certifi, annotated-types, typing-inspection, requests, python-dateutil, pytest, pydantic-core, markdown-it-py, Jinja2, rich, pydantic
    Successfully installed Jinja2-2.11.3 MarkupSafe-3.0.4 annotated-types-0.8.0 appdirs-1.4.4 certifi-2026.7.22 chardet-5.2.0 charset-normalizer-3.5.2 click-8.5.0 colorama-0.4.6 idna-2.7 iniconfig-2.3.1 markdown-it-py-4.2.0 mdurl-0.1.2 nose-1.3.7 packaging-26.3 pluggy-1.6.0 pydantic-2.14.1 pydantic-core-2.50.1 pygments-2.21.0 pytest-9.1.1 python-dateutil-2.9.0.post0 requests-2.31.0 rich-15.0.0 setuptools-75.8.0 six-1.17.0 toml-0.10.2 typing-extensions-4.16.0 typing-inspection-0.4.4 urllib3-2.8.0

Sanitized stderr:


#### packages: passed

Exit: 0; duration: 2982.7 ms; output truncated: False

Argument vector:

    ["C:\\Users\\yojit\\Documents\\Hackathons\\hacktober\\GemForge\\.dist\\verification\\gemforge-ngpm6lf6\\candidate\\venv\\Scripts\\python.exe", "-I", "-X", "utf8", "-B", "-m", "pip", "--isolated", "list", "--format=json", "--disable-pip-version-check"]

Sanitized stdout:

    [{"name": "annotated-types", "version": "0.8.0"}, {"name": "appdirs", "version": "1.4.4"}, {"name": "certifi", "version": "2026.7.22"}, {"name": "chardet", "version": "5.2.0"}, {"name": "charset-normalizer", "version": "3.5.2"}, {"name": "click", "version": "8.5.0"}, {"name": "colorama", "version": "0.4.6"}, {"name": "idna", "version": "2.7"}, {"name": "iniconfig", "version": "2.3.1"}, {"name": "Jinja2", "version": "2.11.3"}, {"name": "markdown-it-py", "version": "4.2.0"}, {"name": "MarkupSafe", "version": "3.0.4"}, {"name": "mdurl", "version": "0.1.2"}, {"name": "nose", "version": "1.3.7"}, {"name": "packaging", "version": "26.3"}, {"name": "pip", "version": "25.0.1"}, {"name": "pluggy", "version": "1.6.0"}, {"name": "pydantic", "version": "2.14.1"}, {"name": "pydantic_core", "version": "2.50.1"}, {"name": "Pygments", "version": "2.21.0"}, {"name": "pytest", "version": "9.1.1"}, {"name": "python-dateutil", "version": "2.9.0.post0"}, {"name": "requests", "version": "2.31.0"}, {"name": "rich", "version": "15.0.0"}, {"name": "setuptools", "version": "75.8.0"}, {"name": "six", "version": "1.17.0"}, {"name": "toml", "version": "0.10.2"}, {"name": "typing_extensions", "version": "4.16.0"}, {"name": "typing-inspection", "version": "0.4.4"}, {"name": "urllib3", "version": "2.8.0"}]

Sanitized stderr:


#### syntax: passed

Exit: 0; duration: 1789.1 ms; output truncated: False

Argument vector:

    ["C:\\Users\\yojit\\Documents\\Hackathons\\hacktober\\GemForge\\.dist\\verification\\gemforge-ngpm6lf6\\candidate\\venv\\Scripts\\python.exe", "-I", "-X", "utf8", "-B", "C:\\Users\\yojit\\Documents\\Hackathons\\hacktober\\GemForge\\.dist\\verification\\gemforge-ngpm6lf6\\candidate\\control\\runner.py", "syntax", "C:\\Users\\yojit\\Documents\\Hackathons\\hacktober\\GemForge\\.dist\\verification\\gemforge-ngpm6lf6\\candidate\\repo", "C:\\Users\\yojit\\Documents\\Hackathons\\hacktober\\GemForge\\.dist\\verification\\gemforge-ngpm6lf6\\candidate\\control\\syntax.json"]

Sanitized stdout:

    {"files_parsed": 15}

Sanitized stderr:


#### import: passed

Exit: 0; duration: 2439.6 ms; output truncated: False

Argument vector:

    ["C:\\Users\\yojit\\Documents\\Hackathons\\hacktober\\GemForge\\.dist\\verification\\gemforge-ngpm6lf6\\candidate\\venv\\Scripts\\python.exe", "-I", "-X", "utf8", "-B", "C:\\Users\\yojit\\Documents\\Hackathons\\hacktober\\GemForge\\.dist\\verification\\gemforge-ngpm6lf6\\candidate\\control\\runner.py", "import", "C:\\Users\\yojit\\Documents\\Hackathons\\hacktober\\GemForge\\.dist\\verification\\gemforge-ngpm6lf6\\candidate\\repo", "C:\\Users\\yojit\\Documents\\Hackathons\\hacktober\\GemForge\\.dist\\verification\\gemforge-ngpm6lf6\\candidate\\control\\import.json", "linkwatch.config"]

Sanitized stdout:

    {"imported": "linkwatch.config"}

Sanitized stderr:

    C:\Users\yojit\Documents\Hackathons\hacktober\GemForge\.dist\verification\gemforge-ngpm6lf6\candidate\venv\Lib\site-packages\pydantic\_internal\_config.py:408: UserWarning: Valid config keys have changed in V2:
    * 'anystr_strip_whitespace' has been renamed to 'str_strip_whitespace'
      warnings.warn(message, UserWarning)

#### pytest: failed

Exit: 1; duration: 12830.1 ms; output truncated: False

Argument vector:

    ["C:\\Users\\yojit\\Documents\\Hackathons\\hacktober\\GemForge\\.dist\\verification\\gemforge-ngpm6lf6\\candidate\\venv\\Scripts\\python.exe", "-I", "-X", "utf8", "-B", "C:\\Users\\yojit\\Documents\\Hackathons\\hacktober\\GemForge\\.dist\\verification\\gemforge-ngpm6lf6\\candidate\\control\\runner.py", "pytest", "C:\\Users\\yojit\\Documents\\Hackathons\\hacktober\\GemForge\\.dist\\verification\\gemforge-ngpm6lf6\\candidate\\repo", "C:\\Users\\yojit\\Documents\\Hackathons\\hacktober\\GemForge\\.dist\\verification\\gemforge-ngpm6lf6\\candidate\\control\\pytest.xml"]

Sanitized stdout:

    .........F                                                               [100%]
    ================================== FAILURES ===================================
    ________________________ test_report_renders_all_sites ________________________
    
    tmp_path = WindowsPath('C:/Users/yojit/Documents/Hackathons/hacktober/GemForge/.dist/verification/gemforge-ngpm6lf6/candidate/control/test-tmp/test_report_renders_all_sites0')
    monkeypatch = <_pytest.monkeypatch.MonkeyPatch object at 0x00000222FF3FA9C0>
    
        def test_report_renders_all_sites(tmp_path, monkeypatch):
            monkeypatch.setenv("LINKWATCH_CACHE_DIR", str(tmp_path))
            cache.save_results(RESULTS)
            output = tmp_path / "status.html"
    >       result = CliRunner().invoke(cli, ["report", "-o", str(output)], catch_exceptions=False)
                     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    
    tests\test_report.py:20: 
    _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    ..\venv\Lib\site-packages\click\testing.py:687: in invoke
        return_value = cli.main(args=args or (), prog_name=prog_name, **extra)
                       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    ..\venv\Lib\site-packages\click\core.py:1552: in main
        rv = self.invoke(ctx)
             ^^^^^^^^^^^^^^^^
    ..\venv\Lib\site-packages\click\core.py:2032: in invoke
        return _process_result(sub_ctx.command.invoke(sub_ctx))
                               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    ..\venv\Lib\site-packages\click\core.py:1415: in invoke
        return ctx.invoke(self.callback, **ctx.params)
               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    ..\venv\Lib\site-packages\click\core.py:910: in invoke
        return callback(*args, **kwargs)
               ^^^^^^^^^^^^^^^^^^^^^^^^^
    linkwatch\cli.py:56: in report
        from .report import render_report
    linkwatch\report.py:3: in <module>
        from jinja2 import Environment, FileSystemLoader, select_autoescape
    ..\venv\Lib\site-packages\jinja2\__init__.py:12: in <module>
        from .environment import Environment
    ..\venv\Lib\site-packages\jinja2\environment.py:25: in <module>
        from .defaults import BLOCK_END_STRING
    ..\venv\Lib\site-packages\jinja2\defaults.py:3: in <module>
        from .filters import FILTERS as DEFAULT_FILTERS  # noqa: F401
        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    
        # -*- coding: utf-8 -*-
        """Built-in template filters used with the ``|`` operator."""
        import math
        import random
        import re
        import warnings
        from collections import namedtuple
        from itertools import chain
        from itertools import groupby
        
        from markupsafe import escape
        from markupsafe import Markup
    >   from markupsafe import soft_unicode
    E   ImportError: cannot import name 'soft_unicode' from 'markupsafe' (C:\Users\yojit\Documents\Hackathons\hacktober\GemForge\.dist\verification\gemforge-ngpm6lf6\candidate\venv\Lib\site-packages\markupsafe\__init__.py)
    
    ..\venv\Lib\site-packages\jinja2\filters.py:13: ImportError
    ============================== warnings summary ===============================
    linkwatch\config.py:14
      C:\Users\yojit\Documents\Hackathons\hacktober\GemForge\.dist\verification\gemforge-ngpm6lf6\candidate\repo\linkwatch\config.py:14: PydanticDeprecatedSince20: Pydantic V1 style `@validator` validators are deprecated. You should migrate to Pydantic V2 style `@field_validator` validators, see the migration guide for more details. Deprecated in Pydantic V2.0 to be removed in V3.0. See Pydantic V2 Migration Guide at [URL redacted]
        @validator("name")
    
    linkwatch\config.py:20
      C:\Users\yojit\Documents\Hackathons\hacktober\GemForge\.dist\verification\gemforge-ngpm6lf6\candidate\repo\linkwatch\config.py:20: PydanticDeprecatedSince20: Pydantic V1 style `@validator` validators are deprecated. You should migrate to Pydantic V2 style `@field_validator` validators, see the migration guide for more details. Deprecated in Pydantic V2.0 to be removed in V3.0. See Pydantic V2 Migration Guide at [URL redacted]
        @validator("url")
    
    linkwatch\config.py:7
      C:\Users\yojit\Documents\Hackathons\hacktober\GemForge\.dist\verification\gemforge-ngpm6lf6\candidate\repo\linkwatch\config.py:7: PydanticDeprecatedSince20: Support for class-based `config` is deprecated, use ConfigDict instead. Deprecated in Pydantic V2.0 to be removed in V3.0. See Pydantic V2 Migration Guide at [URL redacted]
        class Site(BaseModel):
    
    ..\venv\Lib\site-packages\pydantic\_internal\_config.py:408
      C:\Users\yojit\Documents\Hackathons\hacktober\GemForge\.dist\verification\gemforge-ngpm6lf6\candidate\venv\Lib\site-packages\pydantic\_internal\_config.py:408: UserWarning: Valid config keys have changed in V2:
      * 'anystr_strip_whitespace' has been renamed to 'str_strip_whitespace'
        warnings.warn(message, UserWarning)
    
    linkwatch\config.py:27
      C:\Users\yojit\Documents\Hackathons\hacktober\GemForge\.dist\verification\gemforge-ngpm6lf6\candidate\repo\linkwatch\config.py:27: PydanticDeprecatedSince20: Support for class-based `config` is deprecated, use ConfigDict instead. Deprecated in Pydantic V2.0 to be removed in V3.0. See Pydantic V2 Migration Guide at [URL redacted]
        class Settings(BaseModel):
    
    linkwatch\resources.py:1
      C:\Users\yojit\Documents\Hackathons\hacktober\GemForge\.dist\verification\gemforge-ngpm6lf6\candidate\repo\linkwatch\resources.py:1: DeprecationWarning: pkg_resources is deprecated as an API. See [URL redacted]
        import pkg_resources
    
    -- Docs: [URL redacted]
    =========================== short test summary info ===========================
    FAILED tests/test_report.py::test_report_renders_all_sites - ImportError: can...
    1 failed, 9 passed, 6 warnings in 9.29s

Sanitized stderr:


#### probes: failed

Exit: 1; duration: 2078.1 ms; output truncated: False

Argument vector:

    ["C:\\Users\\yojit\\Documents\\Hackathons\\hacktober\\GemForge\\.dist\\verification\\gemforge-ngpm6lf6\\candidate\\venv\\Scripts\\python.exe", "-I", "-X", "utf8", "-B", "C:\\Users\\yojit\\Documents\\Hackathons\\hacktober\\GemForge\\.dist\\verification\\gemforge-ngpm6lf6\\candidate\\control\\runner.py", "probes", "C:\\Users\\yojit\\Documents\\Hackathons\\hacktober\\GemForge\\.dist\\verification\\gemforge-ngpm6lf6\\candidate\\repo", "C:\\Users\\yojit\\Documents\\Hackathons\\hacktober\\GemForge\\.dist\\verification\\gemforge-ngpm6lf6\\candidate\\control\\probes.json", "C:\\Users\\yojit\\Documents\\Hackathons\\hacktober\\GemForge\\.dist\\verification\\gemforge-ngpm6lf6\\candidate\\control\\probe-specs.json"]

Sanitized stdout:

    [{"name": "site_strips_whitespace", "status": "failed", "actual": {"name": "  alpha  "}}, {"name": "site_rejects_empty_name", "status": "passed", "actual_exception": "ValidationError"}, {"name": "site_rejects_invalid_url", "status": "passed", "actual_exception": "ValidationError"}, {"name": "settings_forbids_extra", "status": "passed", "actual_exception": "ValidationError"}, {"name": "settings_defaults", "status": "passed", "actual": {"title": "linkwatch", "output": "status.html", "sites": []}}]

Sanitized stderr:

    C:\Users\yojit\Documents\Hackathons\hacktober\GemForge\.dist\verification\gemforge-ngpm6lf6\candidate\venv\Lib\site-packages\pydantic\_internal\_config.py:408: UserWarning: Valid config keys have changed in V2:
    * 'anystr_strip_whitespace' has been renamed to 'str_strip_whitespace'
      warnings.warn(message, UserWarning)

### Paired comparison

- `import`: **passed_both**. Baseline=passed; candidate=passed.
- `install`: **passed_both**. Baseline=passed; candidate=passed.
- `packages`: **passed_both**. Baseline=passed; candidate=passed.
- `probes`: **regression**. Baseline=passed; candidate=failed.
- `pytest`: **baseline_failure**. Baseline=failed; candidate=failed.
- `python`: **passed_both**. Baseline=passed; candidate=passed.
- `syntax`: **passed_both**. Baseline=passed; candidate=passed.
- `venv`: **passed_both**. Baseline=passed; candidate=passed.
- `test:tests.test_cache::test_cache_round_trip`: **passed_both**. Baseline=passed; candidate=passed.
- `test:tests.test_checker::test_closed_port_is_down`: **passed_both**. Baseline=passed; candidate=passed.
- `test:tests.test_checker::test_latin1_title`: **passed_both**. Baseline=passed; candidate=passed.
- `test:tests.test_checker::test_missing_is_down`: **passed_both**. Baseline=passed; candidate=passed.
- `test:tests.test_checker::test_ok_is_up`: **passed_both**. Baseline=passed; candidate=passed.
- `test:tests.test_checker::test_redirect_is_up`: **passed_both**. Baseline=passed; candidate=passed.
- `test:tests.test_checker::test_slow_is_up`: **passed_both**. Baseline=passed; candidate=passed.
- `test:tests.test_checker::test_user_agent`: **passed_both**. Baseline=passed; candidate=passed.
- `test:tests.test_config::test_sites_file_loads`: **passed_both**. Baseline=passed; candidate=passed.
- `test:tests.test_report::test_report_renders_all_sites`: **baseline_failure**. Baseline=failed; candidate=failed.
- `probe:settings_defaults`: **passed_both**. Baseline=passed; candidate=passed.
- `probe:settings_forbids_extra`: **passed_both**. Baseline=passed; candidate=passed.
- `probe:site_rejects_empty_name`: **passed_both**. Baseline=passed; candidate=passed.
- `probe:site_rejects_invalid_url`: **passed_both**. Baseline=passed; candidate=passed.
- `probe:site_strips_whitespace`: **regression**. Baseline=passed; candidate=failed.

### Verification evidence

- import: passed_both
- install: passed_both
- packages: passed_both
- probes: regression
- pytest: baseline_failure
- python: passed_both
- syntax: passed_both
- venv: passed_both
- test:tests.test_cache::test_cache_round_trip: passed_both
- test:tests.test_checker::test_closed_port_is_down: passed_both
- test:tests.test_checker::test_latin1_title: passed_both
- test:tests.test_checker::test_missing_is_down: passed_both
- test:tests.test_checker::test_ok_is_up: passed_both
- test:tests.test_checker::test_redirect_is_up: passed_both
- test:tests.test_checker::test_slow_is_up: passed_both
- test:tests.test_checker::test_user_agent: passed_both
- test:tests.test_config::test_sites_file_loads: passed_both
- test:tests.test_report::test_report_renders_all_sites: baseline_failure
- probe:settings_defaults: passed_both
- probe:settings_forbids_extra: passed_both
- probe:site_rejects_empty_name: passed_both
- probe:site_rejects_invalid_url: passed_both
- probe:site_strips_whitespace: regression
- Post-run audit: original LinkWatch file hashes unchanged, including Git metadata.
- Post-run audit: active GemForge environment package versions unchanged; non-administrator execution confirmed.
- Integrity audit SHA256: 220e1280d6c24c7b1a250b3ebc9115807eba2d3b16f577e64e104f6c74c11d82
- Reviewed probe inputs and configured timeouts attached after execution; original observed results preserved without another run.

### Compatibility gaps and unresolved risks

- Virtual environments isolate packages, not host filesystem/network permissions. Execute reviewed trusted code only.
- Only manifest changes applied. AI-proposed source migrations remain unresolved.
- Selected checks do not establish universal migration safety.
- Not copied (unsupported file type): .dockerignore
- Not copied (unsupported file type): .gitignore
- Not copied (unsupported file type): Dockerfile
- Not copied (unsupported file type): Makefile
- Not copied (unsupported file type): .dockerignore
- Not copied (unsupported file type): .gitignore
- Not copied (unsupported file type): Dockerfile
- Not copied (unsupported file type): Makefile
- Exact pin 1.10.13 is excluded by the combined PEP 440 constraints: ==1.10.13,>=2.

## Analysis limitations

- Static local manifest facts only: no PyPI release, vulnerability, maintenance, transitive dependency or installed-distribution metadata was queried.
- All discovered requirements*.txt and pyproject.toml declarations are compared together; independent nested projects and alternative install profiles may need separate scans.
- Pip includes/options, hashes, editable requirements, lockfiles, setup.py and build-system dependencies are not resolved. Symlinked files/directories are skipped.
- Constraint compatibility is metadata overlap, not runtime/API compatibility. Prereleases are allowed for existential overlap checks. Conditional constraints remain uncertain.
- Import-to-distribution matching uses normalized-name heuristics unless explicitly mapped; mismatched names (e.g. python-dateutil/dateutil) need --import-map. Dynamic imports, star imports, relative imports, alias reassignment, conditional bindings, local module shadowing and nested-scope references are not resolved. Imports are syntax evidence, not executed usage.
- AI recommendations are hypotheses. Structure and evidence references are validated; semantic truth, API/release availability and compatibility are unverified. Suggested commands are never executed. New file paths are not accepted as observed files.
