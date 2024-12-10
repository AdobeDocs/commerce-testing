---
title: Command Line | Commerce Testing
description: Learn how to run PHP unit tests on Adobe Commerce and Magento Open Source code with the command-line interface.
contributor_name: Vinai Kopp
contributor_link: https://vinaikopp.com/
keywords:
  - Tools
---

# Command line

## Run all unit tests

To run all tests, navigate to the application root directory and execute the following command:

```bash
./vendor/bin/phpunit -c dev/tests/unit/phpunit.xml.dist
```

## Run only a subset of the unit tests

To run only tests within a specific directory branch, all you have to do is to specify the directory branch after the command.

The following example tells PHPUnit to look for any file ending with `Test.php` within the directory branch `app/code/Example/Module/Test/Unit` and try to execute it.

```bash
./vendor/bin/phpunit -c dev/tests/unit/phpunit.xml.dist app/code/Example/Module/Test/Unit
```

## Explanation

The `phpunit` executable is installed by `composer` and linked into the directory `vendor/bin`.

The option `-c dev/tests/unit/phpunit.xml.dist` specifies the configuration file for PHPUnit.

If custom configuration settings are required (more on that later), the file `dev/tests/unit/phpunit.xml.dist` can be copied to `dev/tests/unit/phpunit.xml` and adjusted as needed. In that case modify the `-c` flag accordingly.

PHPUnit has many additional command line options. Please refer to the [PHPUnit documentation](https://phpunit.de/manual/4.1/en/textui.html#textui.clioptions) for more information (currently Commerce uses PHPUnit version 4.1.0, 2.2.x uses PHPUnit version 6.x).

## Solutions to common problems

### Permission Denied

One possible reason for this to happen might be if you are trying to execute PHPUnit inside a Virtual Box VM with shared folders that don't allow modifying permissions.

Whatever the reason, if you encounter the `permission denied: vendor/bin/phpunit` error, you can prefix the command with the PHP interpreter, so your system knows what binary to use to run the tests.

```bash
php -f vendor/bin/phpunit -- -c dev/tests/unit/phpunit.xml.dist
```

### Use the correct PHP interpreter

On many development systems, you might have more one PHP version installed. You must know the correct PHP interpreter to use for testing; that is, use the same version of PHP to run the unit tests you use to run Magento.

Some examples follow:

*  Ubuntu: `/usr/bin/php`
*  CentOS: `/usr/bin/php`
*  MacOS:

   *  System: `/usr/bin/php`
   *  Homebrew: `/usr/local/Cellar/php56/5.6.19/bin/php`
   *  MAMP: `/Applications/MAMP/bin/php/php5.6.19/bin/php`

You can either fix your `$PATH` (please refer to your system documentation on how to do that), or specify the full path to the PHP interpreter. For example:

```bash
/usr/local/Cellar/php56/5.6.19/bin/php -f vendor/bin/phpunit -- -c dev/tests/unit/phpunit.xml.dist
```

### Memory Limit

If you encounter an error similar to `Fatal error: Allowed memory size of 67108864 bytes exhausted`, follow these steps to resolve it.

Copy the PHPUnit configuration file `dev/tests/unit/phpunit.xml.dist` to `dev/tests/unit/phpunit.xml`

Find the following section:

```xml
<php>
    <ini name="date.timezone" value="America/Los_Angeles"/>
    <ini name="xdebug.max_nesting_level" value="200"/>
</php>
```

Add the following line in the `<php>` block to disable the PHP memory limit during test execution.

```xml
<ini name="memory_limit" value="-1"/>
```

### CLI Command run with PHPUnit 10

If you encounter an error similar to `Bootstrapping of extension Qameta\Allure\PHPUnit\AllureExtension failed: Config file allure/allure.config.php doesn't exist`, follow the steps below to resolve it and run your unit tests successfully.

#### Steps to Run Tests via CLI:

1. Navigate to the unit test directory
   From the project root, execute the following command to change into the unit test directory:
   ```bash
   cd dev/tests/unit/
   ```

2. Run PHPUnit
   Use the following command to execute PHPUnit with the appropriate configuration:
   ```bash
   ../../../vendor/bin/phpunit -c phpunit.xml.dist ../../../app/code/Example/Module/Test/Unit
   ```