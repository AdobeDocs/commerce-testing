---
title: PHP built-in attributes | Commerce Testing
description: Declare context in your Adobe Commerce and Magento Open Source code with built-in PHP attributes.
keywords:
  - Tools
---

# PHP built-in attributes

[PHP built-in attributes][] help to declare context in your code. Attributes can be used alone or together with Annotations to help to declare context in your code.

## Quick overview

The following attributes are available in integration tests:

| Name                            | Attribute                        | Description                                                                                                                                                                                                                                                                              |
|---------------------------------|----------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Application Isolation           | [AppIsolation][]                 | Enables or disables application isolation when you run tests. When enabled, an application state after a test run will be the same as before the test run. For example, you should enable it when you want to create sessions in a test, but you don't want them to affect other tests. |
| Configuration Fixture           | [Config][]                       | Sets up configuration settings for a particular test. The list of settings is stored in the `core_config_data` database table. Multiple configuration parameters can be set with a single command. After test execution, the settings revert to their original state.                |
| Database Isolation              | [DbIsolation][]                  | Enables or disables database isolation. Disabled by default, unless you are using the `DataFixture()` attribute, in which case it is enabled by default. All data required for a test live during transaction only. Test results won't be written to the database.                       |
| Data Fixture                    | [DataFixture][]                  | Points to a class or a method that creates testing entities (fixtures) for test execution. These are applied during the transaction.                                                                                                                                                    |
| Data Fixture Before Transaction | [DataFixtureBeforeTransaction][] | Points to a class or a method that creates testing entities (fixtures) for test execution before the transaction begins. You must implement a rollback method for changes made here.                                                                                             |
| Application Area                | [AppArea][]                      | Configures test environment in the context of specified application area.                                                                                                                                                                                                                |
| Enable/Disable Cache            | [Cache][]                        | Enables or disables certain cache segment (or all of them) to prevent isolation problems.                                                                                                                                                                                                  |
| Indexer Dimension Mode          | [IndexerDimensionMode][]         | Sets the indexer dimension mode for the test run. More information can be found in the [DevBlog](https://community.magento.com/t5/Magento-DevBlog/Indexers-parallelization-and-optimization/ba-p/104922).                                                                                |
| Register Components             | [ComponentsDir][]                | Registers fixture components from the specified directory (recursively). Unregisters the components after the test is finished.                                                                                                                                                              |

## Applying annotations

The application-specific annotations for integration tests are applied in the following order:

1. `AppIsolation`
1. `DbIsolation`
1. `DataFixtureBeforeTransaction`
1. `DataFixture`
1. `IndexerDimensionMode`
1. `ComponentsDir`
1. `AppArea`
1. `Cache`
1. `Config`

This order is necessary to meet the requirement of setting up the store-scoped configuration values for fixture stores (stores that are created by data fixtures).

<InlineAlert variant="info" slots="text" />

[PHP built-in attributes][] are only available with PHP8 and above.

\<!-- LINK DEFINITIONS --\>

[PHPUnit annotations]: ../annotations/index.md
[PHP built-in attributes]: https://www.php.net/manual/en/language.attributes.overview.php
[AppIsolation]: app-isolation.md
[Config]: config-fixture.md
[DbIsolation]: db-isolation.md
[DataFixture]: data-fixture.md
[DataFixtureBeforeTransaction]: data-fixture-before-transaction.md
[AppArea]: app-area.md
[Cache]: cache.md
[IndexerDimensionMode]: indexer-dimension-mode.md
[ComponentsDir]: components-dir.md
