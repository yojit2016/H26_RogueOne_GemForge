# Public LinkWatch Evidence Copies

These are path-sanitized derivatives of the unchanged raw evidence in `../../linkwatch/`. They preserve the recorded findings and verification results. Absolute local user/worktree prefixes and ephemeral verification run IDs were replaced; JSON whitespace was normalized during serialization, and Markdown line endings/trailing whitespace were normalized.

In JSON copies, the `repository` metadata is normalized to `targets/LinkWatch`, the checked-in checkout of the original LinkWatch commit, so local import and repair flows can resolve the source. This is a documented metadata normalization, not the historical absolute checkout path. All original files and their exact source hashes are preserved.

The frontend fixture at `../../../frontend/src/fixtures/linkwatchCapsule.json` is byte-identical to the sanitized Phase 3 JSON copy and is labeled as a previous run in the UI.

| Original file | Original SHA-256 | Sanitized copy | Sanitized SHA-256 | Redactions (root/user/run ID) |
|---|---|---|---|---|
| [linkwatch-phase3.json](../../linkwatch/linkwatch-phase3.json) | `df9279443570ce6f550a116ccf9706ef590d7c7ed77455502a5b50b9da2328a1` | [linkwatch-phase3.json](linkwatch-phase3.json) | `83b45b482de8f7ce87a83831d98159e664aec5f4bf61a98380fb6baef58bbee7` | 165/0/162 |
| [linkwatch-phase3.md](../../linkwatch/linkwatch-phase3.md) | `79406de8600841709fa188c59700442209d961606a419233eceaa827b6898678` | [linkwatch-phase3.md](linkwatch-phase3.md) | `59b212f445ed12d121f70fdeadc5d0244c6f3862cab8aff6bb0a66a0f90494f3` | 116/0/115 |
| [linkwatch-repair-1.json](../../linkwatch/linkwatch-repair-1.json) | `7a136abf1c70f75c79d6376603db816f3492143a92def89ca37c5184dabea6ef` | [linkwatch-repair-1.json](linkwatch-repair-1.json) | `22af1d77358238ecc5cb30807477f8f8e6a7e13336cf72351fa54b4764aa8dc5` | 165/0/162 |
| [linkwatch-repair-1.md](../../linkwatch/linkwatch-repair-1.md) | `7f7790e53158353b0f95055f612019f067f6ec0b23a4811662d1152f3fea1a8c` | [linkwatch-repair-1.md](linkwatch-repair-1.md) | `ad6a9dd9cd4a85d736290a53ebe03d1cc316659b63125bf1dc2ad5f71a4e80ad` | 116/0/115 |

Frontend fixture SHA-256: `83b45b482de8f7ce87a83831d98159e664aec5f4bf61a98380fb6baef58bbee7`

The raw files remain unchanged and contain historical absolute local paths; do not use them as public copies. Earlier commits also retain those originals, so this integration branch must not be published until the repository owner reviews and accepts that history exposure or authorizes a separate history-remediation plan. Verify each derivative against its recorded source hash before relying on it as a sanitized copy.
