---
title: Functional Testing Framework | Commerce Testing
description: Learn how to perform end-to-end functional testing on Adobe Commerce and Magento Open Source projects.
---

# Introduction to the Functional Testing Framework

The Functional Testing Framework is a framework used to perform automated end-to-end functional testing on Adobe Commerce and Magento Open Source projects.

<InlineAlert variant="info" slots="text"/>

This documentation is for version 3.0 of the framework, which was released in conjunction with Adobe Commerce and Magento Open Source 2.4. It is a major update and introduces many new changes and fixes. You can find documentation for version 2.0 [here](https://devdocs.magento.com/mftf/v2/docs/introduction.html). See [find your version](#find-your-framework-version) if you are unsure about which version you are using.

## Goals

-  To facilitate functional testing and minimize the effort it takes to perform regression testing
-  Enable extension developers to provide functional tests for their extensions
-  Ensure a common standard of quality between Adobe Commerce and Magento Open Source, extension developer,s and system integrators

The framework also focuses on the following:

-  **Traceability** for clear logging and reporting capabilities
-  **Modularity** to run tests based on installed modules and extensions
-  **Customizability** for existing tests
-  **Readability** using clear and declarative XML test steps
-  **Maintainability** based on simple test creation and overall structure

## Audience

-  **Contributors**: Test build confidence about the results of changes introduced to the platform
-  **Extension developers**: Can adjust expected behaviour according to their customizations
-  **System integrators**: Functional testing coverage provided out-of-the-box with Adobe Commerce and Magento Open Source is a solid base for acceptance and regression tests

## Use cases

-  **Contributor**: Changes core Adobe Commerce and Magento Open Source behavior and fixes bugs. Uses the framework as an automated "supervisor" that continuously verifies work across the stages of bug fixing. When a fix is complete, the functional test serves as proof of completed work.
-  **Extension developer**: Creates an extension that changes core Adobe Commerce or Magento Open Source behavior. Writes tests to make sure that Adobe Commerce or Magento Open Source behaves as expected after enabling a feature. Typically extends existing tests and does not need to write tests from scratch.
-  **System integrator**: Maintains ecommerce implementations for clients. Customizes existing tests to match customizations implemented in Adobe Commerce or Magento Open Source. After each upgrade, they Run tests after each Adobe Commerce or Magento OPen Source upgrade to verify that no regression bugs were introduced.

## Output

-  Generated PHP Codeception tests
-  Codeception results and console logs
-  Screenshots and HTML failure report
-  Allure formatted XML results
-  Allure report dashboard of results

## Tests

The framework supports three different locations for storing the tests and test artifacts:

-  `<magento_root>/app/code/<vendor_name>/<module_name>/Test/Mftf/` is where you should create new tests.
-  `<magento_root>/vendor/<vendor_name>/<module_name>/Test/Mftf/` is where out-of-the box tests are stored (fetched by Composer).
-  `<magento_root>/dev/tests/acceptance/tests/functional/<vendor_name>/<module_name>/` is where tests that depend on multiple modules are stored.

All tests and test data from these locations are merged in the order indicated in the preceding list.

Directories immediately following the preceding paths use the same format. Subdirectories under each category are supported.

```tree
<Path>
├── ActionGroup
│   └── ...
├── Data
│   └── ...
├── Metadata
│   └── ...
├── Page
│   └── ...
├── Section
│   └── ...
├── Suite
│   └── ...
└── Test
    └── ...
```

## Find your framework version

There are two options to find the version of the framework you are using:

-  Using the MFTF CLI
-  Using the Composer CLI

All of the command-line commands must be executed from the `<magento_root>` directory.

### MFTF CLI

```bash
vendor/bin/mftf --version
```

### Composer CLI

```bash
composer show magento/magento2-functional-testing-framework
```

## Contents of dev/tests/acceptance

```tree
tests
      _data                       // Additional files required for tests (pictures, CSV files for import/export)
      _output                     // The directory is generated during test run. It contains testing reports.
      _suite                      // Test suites.
      _bootstrap.php              // The script that executes essential initialization routines.
      functional.suite.dist.yml   // The Codeception functional test suite configuration (generated while running 'bin/mftf build:project')
utils                           // The test-running utilities.
.env.example                    // Example file for environment settings.
.credentials.example            // Example file for credentials to be used by the third-party integrations (generated while running 'bin/mftf build:project'; should be filled with the appropriate credentials in the corresponding sandboxes).
.gitignore                      // List of files ignored by git.
.htaccess.sample                // Access settings for the Apache web server to perform the Magento CLI commands.
codeception.dist.yml            // Codeception configuration (generated while running 'bin/mftf build:project')
```

## MFTF on Github

Follow the [project](https://github.com/magento/magento2-functional-testing-framework) and [contribute on Github](https://github.com/magento/magento2-functional-testing-framework/blob/master/.github/CONTRIBUTING.md).
