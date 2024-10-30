---
title: Git vs. Composer installation | Commerce Testing
description: Compare installation methods for Adobe Commerce and Magento Open Source projects when using the Functional Testing Framework.
keywords:
  - Install
  - Tools
---

# Git vs Composer installation of Commerce with MFTF

Depending on how you plan to use Adobe Commerce or Magento Open Source code, there are different options for installing the application.

## GitHub Installation

If you are contributing a pull request to the Magento Open Source codebase, download it from our GitHub repository. Contribution to the codebase is done using the 'fork and pull' model where contributors maintain their own fork of the repository. This repository is then used to submit a pull request to the base repository.

Install guide: [GitHub Installation][]

## Composer-based installation

A Composer install downloads released packages of Adobe Commerce and Magento Open Source from the Composer repository [https://repo.magento.com](https://repo.magento.com).

All modules and their test are put under `<vendor>` directory, for convenience of thid-party developers. With this setup, you can keep your custom modules separate from core modules. You can also develop modules in a separate VCS repository and add them to your `composer.json` which installs them into the `vendor` directory.

Install guide: [Composer based Installation][]

## Functional Testing Framework installation

After installing your project in either of the above ways, the composer dependency `magento/magento2-functional-testing-framework` downloads and installs the Functional Testing Framework. The Functional Testing Framework is embedded in your Adobe Commerce or Magento Open Source installation and will cover your project with functional tests.

If you want to contribute a pull request into the Functional Testing Framework codebase, you will need to install it in [Standalone][] mode.

## Managing modules - Composer vs GitHub

### Via GitHub

Cloning the Magento Open Source Git repository is a way of installing where you do not have to worry about matching your codebase with production. Your version control system generally holds and manages your `app/code` folder and you can do manual, ad-hoc development here.

### Via Composer

We advocate using Composer to manage modules. When you install a module with Composer, it is added to the `vendor/<vendor-name>/<module>` directory.

When developing your own module or adding test to a module, you should not edit in `vendor` because a composer update could overwrite your changes. Instead, overwrite a module under `vendor` by adding files or cloning your module-specific Git repository to `app/code/<vendor-name>/<module>`.

To distribute the module and its tests, you can initialize a Git repository and create a [composer package][]. In this way others will be able to download and install your module and access your tests as a composer package, in their `<vendor>` folder.

## test materials location

-  For GitHub installations, test materials are located in `<magento_root>/app/code/<vendor_name>/<module_name>/Test/Mftf/`. This is the directory for new tests or to maintain existing ones.
-  For Composer-based installations, test materials are located at `<magento_root>/vendor/<vendor_name>/<module_name>/Test/Mftf/`. This is the directory to run tests fetched by Composer.

The file structure under both paths is the same:

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

## How ModuleResolver reads modules

With either type of installation, all tests and test data are read and merged by MFTF's ModuleResolver in this order:

1. `<magento_root>/app/code/<vendor_name>/<module_name>/Test/Mftf/`
1. `<magento_root>/vendor/<vendor_name>/<module_name>/Test/Mftf/`
1. `<magento_root>/dev/tests/acceptance/tests/functional/<vendor_name>/<module_name>/`

## Conclusion

There is no difference between having the test materials in `app/code` or in `/vendor`: it works the same. Composer-based installs may benefit teams when there is a need to match file systems in `development` and `production`.

If you are a contributing developer with an understanding of Git and Composer commands, you can choose the GitHub installation method instead.

<!-- Link definitions -->

[Composer based Installation]: https://experienceleague.adobe.com/en/docs/commerce-operations/installation-guide/composer
[GitHub Installation]: https://developer.adobe.com/commerce/contributor/guides/install/clone-repository/
[Standalone]: getting-started.md#set-up-a-standalone-mftf
[composer package]: https://developer.adobe.com/commerce/php/development/package/component/
