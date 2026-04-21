# Public Deployment

The repository already publishes `docs/` to GitHub Pages through [deploy.yml](/Users/liuqi/tuanshushu/GradQuest/.github/workflows/deploy.yml).

## What is public

- Main game: `/index.html`
- Service hub: `/services.html`
- Story sandbox: `/scenario_sandbox.html`

## What changed

- GitHub Actions now runs `python tools/generate_scenarios.py` before upload.
- This guarantees `docs/generated_scenarios.js` is always fresh at deploy time.

## Publish flow

1. Commit your current changes.
2. Push to `main` or `master`.
3. Wait for the `Deploy to GitHub Pages` workflow to finish.
4. Open:
   - `https://<username>.github.io/<repo>/services.html`
   - `https://<username>.github.io/<repo>/scenario_sandbox.html`

## Why this works

- GitHub Pages publishes only `docs/`.
- The sandbox can load from `docs/generated_scenarios.js`, so it works both on Pages and under `file://`.
- No backend is required for the current public version.
