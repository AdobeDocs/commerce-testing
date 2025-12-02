---
title: Getting started with functional testing | Commerce Testing
description: Learn how to get started with the Functional Testing Framework for Adobe Commerce and Magento Open Source projects.
keywords:
  - Tools
---

# Getting started

<InlineAlert variant="info" slots="text"/>

[Find your version] of the Functional Testing Framework. The latest Adobe Commerce or Magento Open Source 2.4.x release supports Functional Testing Framework 3.x. The latest Adobe Commerce or Magento Open Source 2.3.x release supports Functional Testing Framework 2.6.x.

## Prepare environment

Make sure that you have the following software installed and configured on your development environment:

-  [PHP version supported by the Adobe Commerce or Magento Open Source instance under test][php]
-  [Composer 1.3 or later][composer]
-  [Java 1.8 or later][java]
-  [Selenium Server Standalone 3.1 or later][selenium server] and [ChromeDriver 2.33 or later][chrome driver] or other webdriver in the same directory

<InlineAlert variant="success" slots="text"/>

[PhpStorm] supports [Codeception test execution][], which is helpful when debugging.

## Install Magento

Use instructions below to install Magento.

### Step 1. Clone the `magento2` source code repository

```bash
git clone https://github.com/magento/magento2.git
```

or

```bash
git clone git@github.com:magento/magento2.git
```

### Step 2. Install dependencies

Checkout the Adobe Commerce or Magento Open Source version that you are going to test.

```bash
cd magento2/
```

```bash
git checkout 2.4-develop
```

Install the Adobe Commerce or Magento Open Source application.

```bash
composer install
```

## Prepare Magento

Configure the following settings in Adobe Commerce or Magento Open Source as described below.

### WYSIWYG settings

A Selenium web driver cannot enter data to fields with WYSIWYG.

To disable the WYSIWYG and enable the web driver to process these fields as simple text areas:

1. Log in to the Admin as an administrator.
2. Navigate to **Stores** > **Settings** > **Configuration** > **General** > **Content Management**.
3. In the WYSIWYG Options section set the **Enable WYSIWYG Editor** option to **Disabled Completely**.
4. Click **Save Config**.

or via command line:

```bash
bin/magento config:set cms/wysiwyg/enabled disabled
```

Clean the cache after changing the configuration values:

```bash
bin/magento cache:clean config full_page
```

<InlineAlert variant="success" slots="text" />

When you want to test the WYSIWYG functionality, re-enable WYSIWYG in your test suite.

### Security settings

To enable the **Admin Account Sharing** setting, to avoid unpredictable logout during a testing session, and disable the **Add Secret Key in URLs** setting, to open pages using direct URLs:

1. Navigate to **Stores** > **Settings** > **Configuration** > **Advanced** > **Admin** > **Security**.
2. Set **Admin Account Sharing** to **Yes**.
3. Set **Add Secret Key to URLs** to **No**.
4. Click **Save Config**.

or via command line:

```bash
bin/magento config:set admin/security/admin_account_sharing 1
```

```bash
bin/magento config:set admin/security/use_form_key 0
```

Clean the cache after changing the configuration values:

```bash
bin/magento cache:clean config full_page
```

### Testing with the two-factor authentication (2FA) extension

If the Adobe Commerce or Magento Open Source instance under test has the [two-factor authentication (2FA) extension][] installed and enabled, additional configurations is needed to run test. Learn more in [Configure with two-factor authentication (2FA)](two-factor-authentication.md).

### Webserver configuration

The Functional Testing Framework does not support executing CLI commands if your web server points to `<MAGE_ROOT_DIR>/pub` directory as recommended in the [Installation Guide][Installation Guide docroot]. For the Functional Testing Framework to execute the CLI commands, the web server must point to the Adobe Commerce or Magento Open Source root directory.

### Nginx settings

If the Nginx Web server is used on your development environment, then **Use Web Server Rewrites** setting in **Stores** > Settings > **Configuration** > **General** > **Web** > **Search Engine Optimization** must be set to **Yes**.

Or via command line:

```bash
bin/magento config:set web/seo/use_rewrites 1
```

You must clean the cache after changing the configuration values:

```bash
bin/magento cache:clean config full_page
```

To be able to run Adobe Commerce or Magento Open Source command-line commands in tests, add the following location block to the Nginx configuration file in the Adobe Commerce or Magento Open Source root directory:

```conf
location ~* ^/dev/tests/acceptance/utils($|/) {
  root $MAGE_ROOT;
  location ~ ^/dev/tests/acceptance/utils/command.php {
      fastcgi_pass   fastcgi_backend;
      fastcgi_index  index.php;
      fastcgi_param  SCRIPT_FILENAME  $document_root$fastcgi_script_name;
      include        fastcgi_params;
  }
}
```

## Set up an embedded framework

This is the default setup of the Functional Testing Framework that you would need to cover your Adobe Commerce or Magento Open Source project with functional tests.
It installs the framework using an existing Composer dependency such as `magento/magento2-functional-testing-framework`.
If you want to set up the Functional Testing Framework as a standalone tool, refer to [Set up a standalone MFTF][].

Install MFTF.

```bash
composer install
```

### Step 1. Build the project

In the Adobe Commerce or Magento Open Source project root, run:

```bash
vendor/bin/mftf build:project
```

If you use PhpStorm, generate a URN catalog:

```bash
vendor/bin/mftf generate:urn-catalog .idea/misc.xml
```

If the file does not exist, add the `--force` option to create it:

```bash
vendor/bin/mftf generate:urn-catalog --force .idea/misc.xml
```

See [`generate:urn-catalog`][] for more details.

<InlineAlert variant="success" slots="text" />

You can simplify command entry by adding the  absolute  path to the `vendor/bin` directory path to your PATH environment variable.
After adding the path, you can run `mftf` without having to include `vendor/bin`.

### Step 2. Edit environmental settings

In the `magento2/dev/tests/acceptance/` directory, edit the `.env` file to match your system.

```bash
vim dev/tests/acceptance/.env
```

Specify the following parameters, which are required to launch tests:

-  `MAGENTO_BASE_URL` must contain a domain name of the Adobe Commerce or Magento Open Source instance that will be tested.
  Example: `MAGENTO_BASE_URL=http://magento.test`

-  `MAGENTO_BACKEND_NAME` must contain the relative path for the Admin area.
  Example: `MAGENTO_BACKEND_NAME=admin`

-  `MAGENTO_ADMIN_USERNAME` must contain the username required for authorization in the Admin area.
  Example: `MAGENTO_ADMIN_USERNAME=admin`

-  `MAGENTO_ADMIN_PASSWORD` must now be set up in the credentials file. See [Credentials Page][] for details.

<InlineAlert variant="info" slots="text" />

If the `MAGENTO_BASE_URL` contains a subdirectory like `http://magento.test/magento2ce`, specify `MAGENTO_CLI_COMMAND_PATH`.

Learn more about environmental settings in [Configuration][].

### Step 3. Enable the CLI commands

In the Adobe Commerce or Magento Open Source project root, run the following command to enable the Functional Testing Framework to send Adobe Commerce or Magento Open Source CLI commands to your Adobe Commerce or Magento Open Source instance.

 ```bash
cp dev/tests/acceptance/.htaccess.sample dev/tests/acceptance/.htaccess
```

### Step 4. Generate and run tests

To run tests, you need a running Selenium server and [`mftf`][] commands.

#### Run the Selenium server

Run the Selenium server in the terminal.
For example, the following commands download and run the Selenium server for Google Chrome:

```bash
curl -O http://selenium-release.storage.googleapis.com/3.14/selenium-server-standalone-3.14.0.jar
```

```bash
java -Dwebdriver.chrome.driver=chromedriver -jar selenium-server-standalone-3.14.0.jar
```

#### Generate and run all tests

```bash
vendor/bin/mftf generate:tests
```

```bash
vendor/bin/codecept run functional -c dev/tests/acceptance/codeception.yml
```

See more commands in [`codecept`][].

#### Run a simple test

To clean up the previously generated tests, and then generate and run a single test `AdminLoginSuccessfulTest`, run:

```bash
vendor/bin/mftf run:test AdminLoginSuccessfulTest --remove
```

See more commands in [`mftf`][].

### Step 5. Generate reports

During testing, the Functional Testing Framework generates test reports in CLI. You can generate visual representations of the report data using the [Allure Framework][]. To view the reports in a GUI:

-  [Install Allure][]
-  Run the tool to serve the artifacts in `dev/tests/acceptance/tests/_output/allure-results/`:

```bash
allure serve dev/tests/acceptance/tests/_output/allure-results/
```

Learn more about Allure in the [official documentation][allure docs].

## Set up a standalone MFTF

The Functional Testing Framework is a root level Adobe Commerce or Magento Open Source dependency, but it is also available for use as a standalone application. You may want to use a standalone application when you develop for or contribute to MFTF, which facilitates debugging and tracking changes. These guidelines demonstrate how to set up and run Adobe Commerce or Magento Open Source acceptance functional tests using standalone MFTF.

### Prerequisites

This installation requires a local instance of the Adobe Commerce or Magento Open Source application.
The Functional Testing Framework uses the [tests from modules][tests] as well as the `app/autoload.php` file.

### Step 1. Clone the repository

If you develop or contribute to MFTF, it makes sense to clone your fork of the Functional Testing Framework repository.
For contribution guidelines, refer to the [Contribution Guidelines for the Functional Testing Framework][contributing].

### Step 2. Install the MFTF

```bash
cd magento2-functional-testing-framework
```

```bash
composer install
```

### Step 3. Build the project

```bash
bin/mftf build:project
```

### Step 4. Edit environment settings

In the `dev/.env` file, define the [basic configuration][] and [`MAGENTO_BP`][] parameters.

### Step 5. Enable the CLI commands

Copy the `etc/config/command.php` file into your Adobe Commerce or Magento Open Source installation at `<magento root directory>/dev/tests/acceptance/utils/`.
Create the `utils/` directory, if you didn't find it.

### Step 6. Remove the framework package dependency

The Functional Testing Framework uses the Adobe Commerce or Magento Open Source `app/autoload.php` file to read modules.
The Functional Testing Framework dependency in Adobe Commerce or Magento Open Source supersedes the standalone registered namespaces unless it is removed at a Composer level.

```bash
composer remove magento/magento2-functional-testing-framework --dev -d <path to the Adobe Commerce or Magento Open Source root directory>
```

### Step 7. Run a simple test

Generate and run a single test that will check your logging to the Admin functionality:

```bash
bin/mftf run:test AdminLoginSuccessfulTest
```

You can find the generated test at `dev/tests/functional/tests/MFTF/_generated/default/`.

### Step 8. Generate Allure reports

The standalone Functional Testing Framework generates Allure reports at `dev/tests/acceptance/tests/_output/allure-results/`.
Run the Allure server pointing to this directory:

```bash
allure serve dev/tests/acceptance/tests/_output/allure-results/
```

\<!-- Link definitions --\>

[`codecept`]: commands/codeception.md
[`generate:urn-catalog`]: commands/mftf.md#generateurn-catalog
[`MAGENTO_BP`]: configuration.md#magento_bp
[`mftf`]: commands/mftf.md
[allure docs]: https://docs.qameta.io/allure/
[Allure Framework]: https://github.com/allure-framework
[basic configuration]: configuration.md#basic-configuration
[chrome driver]: https://sites.google.com/chromium.org/driver/downloads
[Codeception Test execution]: https://blog.jetbrains.com/phpstorm/2017/03/codeception-support-comes-to-phpstorm-2017-1/
[composer]: https://getcomposer.org/download/
[Configuration]: configuration.md
[contributing]: https://github.com/magento/magento2-functional-testing-framework/blob/develop/.github/CONTRIBUTING.md
[install Allure]: https://github.com/allure-framework/allure2#download
[java]: https://www.oracle.com/java/technologies/downloads/
[tests]: index.md#tests
[php]: https://experienceleague.adobe.com/en/docs/commerce-operations/installation-guide/system-requirements
[PhpStorm]: https://www.jetbrains.com/phpstorm/
[selenium server]: https://www.seleniumhq.org/download/
[Set up a standalone MFTF]: #set-up-a-standalone-mftf
[test suite]: suite.md
[Find your version]: index.md#find-your-framework-version
[Installation Guide docroot]: https://experienceleague.adobe.com/en/docs/commerce-operations/installation-guide/tutorials/docroot
[two-factor authentication (2FA) extension]: https://developer.adobe.com/commerce/testing/functional-testing-framework/two-factor-authentication/
[Credentials Page]: credentials.md
