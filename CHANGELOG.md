# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [12.0.0](https://github.com/mojaloop/central-event-processor/compare/v11.0.2...v12.0.0) (2022-07-26)


### ⚠ BREAKING CHANGES

* **mojaloop/#2092:** Major version bump for node v16 LTS support, re-structuring of project directories to align to core Mojaloop repositories and docker image now uses `/opt/app` instead of `/opt/central-event-processor` which will impact config mounts.

### Features

* **mojaloop/#2092:** upgrade nodeJS version for core services ([#61](https://github.com/mojaloop/central-event-processor/issues/61)) ([#243](https://github.com/mojaloop/central-event-processor/issues/243)) ([3e73d5b](https://github.com/mojaloop/central-event-processor/commit/3e73d5baa2884aa7e03efa24bf9676bf2714d4c2)), closes [mojaloop/#2092](https://github.com/mojaloop/project/issues/2092)


### Bug Fixes

* [Security] Bump glob-parent from 5.1.0 to 5.1.2 ([#224](https://github.com/mojaloop/central-event-processor/issues/224)) ([de3a097](https://github.com/mojaloop/central-event-processor/commit/de3a097722fd9990a892dc4982333c15b476b108))
* [Security] Bump normalize-url from 4.5.0 to 4.5.1 ([#225](https://github.com/mojaloop/central-event-processor/issues/225)) ([4b0d33e](https://github.com/mojaloop/central-event-processor/commit/4b0d33eb2b1ea2581495ca7c7dbaa88e58494a2e))
