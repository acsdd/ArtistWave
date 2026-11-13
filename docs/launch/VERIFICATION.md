# Release verification — 2026-11-13

Status: local automated checks pass; release verification is incomplete.

- JavaScript syntax checks: passed for every root JavaScript file.
- Existing tests: 91 passed, zero failed using `node --test --test-isolation=none tests/*.test.cjs`.
- Whitespace validation: `git diff --check` passed.
- Default test process isolation is unavailable in this managed environment (`spawn EPERM`); no test assertions were disabled.

Outstanding: clean-browser desktop/mobile review, real provider playback, local-file permissions, browser installation, hosted Pages/version verification, Google authorized-origin and real sign-in checks, and demo capture. Automated cloud tests use fixtures and do not establish real OAuth readiness.

No deployment, account settings, repository visibility or public announcement was changed.

## Mini playlist update

Mini Player now lists saved playlists and starts playback through the existing playlist engine. The 91 existing tests pass after this change; interactive playlist browsing still needs a browser check. AudioWave requires these site changes to be deployed before its hosted player exposes the new playlist controls.
