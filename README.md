# soulclaw

Public interactive story sandbox for multiple simulation modes.

## Public Pages

- `docs/services.html` - service hub
- `docs/scenario_sandbox.html` - anthology simulator

## Deployment

This repository is configured for GitHub Pages via GitHub Actions.
On push to `main`, the workflow will:

1. run `python tools/generate_scenarios.py`
2. publish the `docs/` directory

After deployment, the expected URLs are:

- `https://andre-110.github.io/soulclaw/services.html`
- `https://andre-110.github.io/soulclaw/scenario_sandbox.html`
