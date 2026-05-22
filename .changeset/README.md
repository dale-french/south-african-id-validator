# Changesets

Versioning and changelogs for this package are managed with [Changesets](https://github.com/changesets/changesets).

## Adding a changeset

When your PR includes a user-facing change, run:

```bash
pnpm changeset
```

The CLI walks you through selecting a bump type (`patch` / `minor` / `major`) and writing a short summary. The resulting markdown file lives in this directory and travels with the PR.

## Releasing

The Changesets GitHub Action opens a "Version Packages" PR on every push to `master`. Merging that PR publishes to npm and creates a GitHub Release. No manual `npm publish` needed.
