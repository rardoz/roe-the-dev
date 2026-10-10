- [x] **done** — Update all of the packages and the Node.js version of the site.

  - Assigned to the package-upgrade agent. Verify current stable releases and compatibility, migrate affected code/configuration, and run tests, linters, type checking, and production builds.
  - Implemented: Node.js 24.21.0 LTS installed and selected through nvm; package upgrades and framework, localization, styles, and Storybook migrations completed.
  - Pre-commit repair: installed ESLint 9.39.5, TypeScript 6.0.3 compiler API, and TypeScript 7.0.2 CLI; manifest and lockfile synchronized. Fixed newly exposed lint errors and added sketchbook regression tests.
  - Automated checks pass: 18/18 test suites, 32/32 tests, 26/26 snapshots, coverage thresholds, full lint, TypeScript, production build, Storybook build, and equivalent staged-file hook checks.
  - Before retrying the commit, stage the repair changes and new files. Existing staging was preserved; lint-staged hides unstaged changes when checking partially staged files.
  - Manual testing after automated checks: mobile/desktop layout and navigation, language switching, blog/portfolio/experiment pages, sketchbook drawing/saving/page locks, and /api-doc. Swagger's upstream React peer compatibility needs attention during manual testing.
  - Manual testing and completion confirmed by the user.

- [x] **done** — Remove Storybook from the restored codebase.

  - Assigned to the Storybook-removal agent. Remove Storybook dependencies, scripts, configuration, component stories, lint integration, generated output, and documentation references.
  - Preserve the restored application's components, routes, content, tests, live functionality, and existing staging. Design work is stopped.
  - Use nvm and run the full tests, coverage checks, linters, TypeScript check, and production build. Verify that no active Storybook references or packages remain.
  - Removed seven direct Storybook dependencies, 15 component stories, the Storybook configuration directory, scripts, ESLint integration, README references, generated-output ignore, and obsolete Jest coverage exclusion. Manifest, lockfile, and installed dependencies are synchronized; no retained package versions changed.
  - Verification through nvm: 18 test suites, 32 tests, 26 snapshots, coverage thresholds, full ESLint and Stylelint, standalone TypeScript, production build, and diff checks passed.
  - Cleared stale generated Next.js development types left by the reset, then rebuilt successfully. Application source, routes, content, styles, tests, snapshots, and existing staging are unchanged.
