---
title: Working with Data Fixtures | Commerce Testing
description: A comprehensive guide to understanding and using data fixtures in Adobe Commerce and Magento Open Source integration tests.
keywords:
  - Integration
  - Tools
---

# Working with data fixtures

## What are data fixtures?

Data fixtures are reusable components that set up test data in your database before running integration tests. They help you create a consistent, predictable test environment by populating the database with entities like products, customers, orders, categories, and more.

Think of data fixtures as the "arrange" phase of your test--they prepare the data your test needs to verify specific functionality.

## Modern vs Legacy approaches

Adobe Commerce and Magento Open Source support multiple ways to work with data fixtures, but not all are equally recommended.

<InlineAlert variant="warning" slots="text" />

**Legacy fixtures** (file-based fixtures like `Magento/Catalog/_files/product_simple.php`) are **deprecated**. New legacy fixtures **cannot be created**. Use **parameterized data fixtures** instead for better maintainability, reusability, and type safety.

<InlineAlert variant="success" slots="text" />

**Parameterized data fixtures are the recommended approach.** They require PHP attributes (`#[DataFixture()]`), which offer superior type safety, better IDE support, improved readability, and powerful parameterization capabilities. DocBlock annotations (`@magentoDataFixture`) only work with legacy file-based fixtures.

### Comparison

| Approach | Status | Can Parametrize | Syntax Example |
|----------|--------|-----------------|--------|
| **Legacy fixtures** (file-based) | Deprecated | ❌ No | `@magentoDataFixture Magento/Catalog/_files/product.php` |
| **Parametrized data fixtures** (with PHP Attributes) | ✅ Recommended | ✅ Yes | `#[DataFixture(ProductFixture::class, ['price' => 10], 'product')]` |

<InlineAlert variant="warning" slots="text" />

Parameterized data fixtures **cannot** be used with DocBlock annotations (`@magentoDataFixture`). They require PHP Attributes (`#[DataFixture()]`).

### Why avoid legacy fixtures?

1. **No parameterization** - Each variation requires a separate file
2. **Hard to maintain** - Changes require modifying PHP scripts scattered across the codebase
3. **Poor discoverability** - Difficult to find what data a fixture creates
4. **No type safety** - Parameters and return values are not typed
5. **Coupling** - Tests become tightly coupled to specific fixture files

## Types of data fixtures

### Legacy fixtures (Deprecated)

Legacy fixtures are file-based PHP scripts (stored in `_files/` directories) that directly execute database operations. They **cannot be parametrized** and are now deprecated.

<InlineAlert variant="warning" slots="text" />

New legacy fixtures **cannot be created**. Existing legacy fixtures should be migrated to parametrized data fixtures.

**Example with DocBlock annotation:**

```php
/**
 * @magentoDataFixture Magento/Catalog/_files/product_simple.php
 */
public function testProductExists(): void
{
    // Test logic here - but you're stuck with whatever data the file creates
}
```

**Example of a legacy fixture file:** `Magento/Catalog/_files/product_simple.php`

```php
<?php
use Magento\Catalog\Api\ProductRepositoryInterface;
use Magento\Catalog\Model\Product;
use Magento\TestFramework\Helper\Bootstrap;

$product = Bootstrap::getObjectManager()->create(Product::class);
$product->setTypeId('simple')
    ->setAttributeSetId(4)
    ->setName('Simple Product')
    ->setSku('simple')  // Fixed SKU - can't customize
    ->setPrice(10)      // Fixed price - can't customize
    ->setVisibility(4)
    ->setStatus(1);

Bootstrap::getObjectManager()
    ->get(ProductRepositoryInterface::class)
    ->save($product);
```

**Problems:** To create a product with a different SKU or price, you need to create an entirely new fixture file!

### Parameterized data fixtures (Recommended)

These are PHP classes that implement `DataFixtureInterface` or `RevertibleDataFixtureInterface`. They support **powerful parametrization** and **require PHP Attributes** (`#[DataFixture()]`).

<InlineAlert variant="warning" slots="text" />

Parametrized data fixtures **cannot** be used with DocBlock annotations. Only PHP Attributes support parametrization.

The power of modern parametrized data fixtures lies in their ability to be customized as you can configure the data they create without writing new fixture classes.

For detailed information on basic parametrization, aliases, store scope, and the `count` parameter, see [DataFixture Attribute](attributes/data-fixture.md).

**Basic example:**

```php
// Only override values that matter for your test. SKU is auto-generated with a unique value
#[
    DataFixture(ProductFixture::class, ['price' => 10.00], 'product')
]
public function testProductExists(): void
{
    $fixtures = DataFixtureStorageManager::getStorage();
    $product = $fixtures->get('product');
}
```

**Fixture references - building complex scenarios:**

You can reference data from one fixture in another using the `$alias.property$` syntax. This allows you to build complex, interconnected test data scenarios:

```php
#[
    DataFixture(CustomerFixture::class, as: 'customer'),
    DataFixture(User::class, as: 'user'),
    DataFixture(
        Company::class,
        ['sales_representative_id' => '$user.id$', 'super_user_id' => '$customer.id$'],
        'company'
    )
]
```

## Migration guide: Legacy to Modern

If you have tests using legacy fixtures, you should migrate them to parametrized data fixtures with PHP Attributes. New legacy fixtures **cannot be created**.

### Before (Legacy fixtures)

```php
/**
 * @magentoDataFixture Magento/Catalog/_files/product_simple.php
 */
public function testProductPrice(): void
{
    $product = $this->productRepository->get('simple'); // Fixed SKU
    $this->assertEquals(10, $product->getPrice()); // Fixed price
}
```

### After (Parametrized data fixtures with PHP Attributes)

```php
#[
    DataFixture(ProductFixture::class, ['price' => 10], 'product')
]
public function testProductPrice(): void
{
    $fixtures = DataFixtureStorageManager::getStorage();
    $product = $fixtures->get('product');
    $this->assertEquals(10, $product->getPrice());
}
```

## Working with fixture data

### Retrieving fixture data

Always use `DataFixtureStorageManager` to retrieve fixture data created by fixtures:

```php
use Magento\TestFramework\Fixture\DataFixtureStorageManager;

#[
    DataFixture(ProductFixture::class, ['price' => 25.00], 'test_product')
]
public function testProduct(): void
{
    $product = DataFixtureStorageManager::getStorage()->get('test_product');
    $this->assertEquals(25.00, $product->getPrice());
}
```

## Complex example: Inventory with multiple sources

Example showing fixture composition and references:

```php
use Magento\TestFramework\Fixture\DataFixtureStorageManager;

#[
    DataFixture(SourceFixture::class, ['source_code' => 'test_source'], 'source'),
    DataFixture(StockFixture::class, as: 'stock'),
    DataFixture(
        StockSourceLinksFixture::class,
        [['stock_id' => '$stock.stock_id$', 'source_code' => '$source.source_code$']]
    ),
    DataFixture(
        StockSalesChannelsFixture::class,
        ['stock_id' => '$stock.stock_id$', 'sales_channels' => ['base']]
    ),
    DataFixture(ProductFixture::class, as: 'p1'),
    DataFixture(ProductFixture::class, as: 'p2'),
    DataFixture(
        SourceItemsFixture::class,
        [
            ['sku' => '$p1.sku$', 'source_code' => '$source.source_code$', 'quantity' => 10, 'status' => 1],
            ['sku' => '$p2.sku$', 'source_code' => '$source.source_code$', 'quantity' => 20, 'status' => 1],
        ]
    ),
    DataFixture(Indexer::class, as: 'indexer')
]
public function testInventoryConfiguration(): void
{
    $stock = DataFixtureStorageManager::getStorage()->get('stock');
    $product1 = DataFixtureStorageManager::getStorage()->get('p1');
    // Test inventory logic
}
```

This example demonstrates:

- Creating related fixtures (source, stock, products)
- Linking fixtures together using `$alias.property$` references
- Passing arrays of data with references
- Building complex test scenarios with multiple dependencies

## Best practices

### 1. Do not create legacy fixtures

<InlineAlert variant="warning" slots="text" />

**New legacy fixtures cannot be created.** Do not create new tests using legacy fixtures (e.g., `Magento/Catalog/_files/product_simple.php`). Always use parametrized data fixtures instead. Existing legacy fixtures should be migrated.

**Bad - Cannot create new:**

```php
/**
 * @magentoDataFixture Magento/Catalog/_files/product_simple.php
 */
```

**Good - Use parametrized data fixtures with PHP Attributes:**

```php
#[DataFixture(ProductFixture::class, ['price' => 10])]
```

<InlineAlert variant="info" slots="text" />

Only override fixture values that are necessary for your test. Unique fields like SKU are dynamically generated and should not be overridden unless specifically required by the test scenario.

### 2. Use PHP Attributes for parametrized data fixtures

Parametrized data fixtures require PHP Attributes.

### 3. Keep fixtures focused

Each fixture should do one thing. Use multiple fixtures and compose them rather than creating complex all-in-one fixtures.

### 4. Use fixture aliases for references

Always use the `as` parameter when you need to reference fixture data in other fixtures:

```php
#[
    DataFixture(CategoryFixture::class, as: 'category'),
    DataFixture(ProductFixture::class, ['category_ids' => ['$category.id$']])
]
```

### 5. Leverage fixture defaults

Most fixtures have sensible defaults with dynamic unique values. Only override values that matter for your specific test scenario.

**Don't override unique fields unnecessarily:**

```php
// Bad - overriding SKU when not needed
#[DataFixture(ProductFixture::class, ['sku' => 'my-sku', 'price' => 100], 'product')]

// Good - let SKU be auto-generated and reference it when needed
#[
    DataFixture(ProductFixture::class, ['price' => 100], 'product'),
    DataFixture(
        CatalogRuleFixture::class,
        [
            'is_active' => false,
            'conditions' => [['attribute' => 'sku', 'value' => '$product.sku$']]
        ],
        'rule'
    )
]
public function testCatalogRule(): void
{
    $product = DataFixtureStorageManager::getStorage()->get('product');
    $rule = DataFixtureStorageManager::getStorage()->get('rule');
    // Access auto-generated SKU
    $sku = $product->getSku();
}
```

You can reference auto-generated values using `$alias.property$` syntax without overriding them.

### 6. Understand isolation behavior

<InlineAlert variant="info" slots="text" />

Database isolation is enabled by default when using data fixtures. Application isolation has significant performance implications and should only be used when necessary (e.g., when modifying application state like sessions). See [AppIsolation](attributes/app-isolation.md) and [DbIsolation](attributes/db-isolation.md) for details.

### 7. Fixture cleanup is automatic

Fixtures that implement `RevertibleDataFixtureInterface` are automatically cleaned up. This is critical to prevent test pollution where data from one test affects another test.

<InlineAlert variant="warning" slots="text" />

Proper data cleanup is essential. Tests run in groups (test suites), and leftover data from one test can cause unexpected failures in subsequent tests. Always ensure your fixtures properly implement the `revert()` method.

### 8. Rely only on explicitly configured fixtures

Your tests should depend on fixtures created before the test runs. However, only rely on things you've explicitly configured in your test's fixture declarations, not on implicit side effects or fixtures from other tests.

## Finding available fixtures

Most Commerce modules include test fixtures in their `Test/Fixture` directory:

- `Magento/Catalog/Test/Fixture/Product.php`
- `Magento/Customer/Test/Fixture/Customer.php`
- `Magento/Sales/Test/Fixture/Order.php`
- `Magento/Cms/Test/Fixture/Page.php`

Check these directories in the Adobe Commerce or Magento Open Source codebase to discover available fixtures and their parameters.

## Creating custom fixtures

If you need custom fixtures, create a class that implements `DataFixtureInterface` or `RevertibleDataFixtureInterface`.

<InlineAlert variant="info" slots="text" />

For detailed guidance on creating custom data fixtures, see the official Magento DevBlog article: [How to Create Data Fixtures (Part 2/2)](https://community.magento.com/t5/Magento-DevBlog/How-to-Use-and-Create-Data-Fixture-in-Integration-and-API/ba-p/500927).

### Basic structure

```php
<?php
namespace Vendor\Module\Test\Fixture;

use Magento\TestFramework\Fixture\DataFixtureInterface;
use Magento\TestFramework\Fixture\RevertibleDataFixtureInterface;

class CustomFixture implements RevertibleDataFixtureInterface
{
    public function __construct(
        private YourDependency $dependency
    ) {}

    public function apply(array $data = []): ?DataFixtureStorageInterface
    {
        // Create your entity
        $entity = $this->dependency->create($data);
        
        return new DataFixtureStorage($entity);
    }
    
    public function revert(DataFixtureInterface $dataFixture): void
    {
        // Clean up the entity
        $entity = $dataFixture->get();
        $this->dependency->delete($entity);
    }
}
```

### When to use RevertibleDataFixtureInterface

Use `RevertibleDataFixtureInterface` when the data fixture creates data that needs to be manually removed after the test. Examples:

- Product data
- Category data
- Customer data
- Any persistent entity

Use `DataFixtureInterface` when the data is automatically removed with related data. Examples:

- Adding a shipping address to a cart (removed when cart is deleted)
- Assigning a product to a category (removed when product is deleted)

## Learn more

### Official Documentation

- [DocBlock Annotations](annotations/index.md) - Complete annotation reference
- [PHP Attributes](attributes/index.md) - Complete attributes reference
- [DataFixture Attribute](attributes/data-fixture.md) - Detailed DataFixture documentation
- [@magentoDataFixture Annotation](annotations/magento-data-fixture.md) - Legacy annotation documentation

### DevBlog Articles

- [How to Use and Create Data Fixture in Integration and API Functional Tests (Part 1/2)](https://community.magento.com/t5/Magento-DevBlog/How-to-Use-and-Create-Data-Fixture-in-Integration-and-API/ba-p/500568) - Official guide on using data fixtures with real examples
- [How to Use and Create Data Fixture in Integration and API Functional Tests (Part 2/2)](https://community.magento.com/t5/Magento-DevBlog/How-to-Use-and-Create-Data-Fixture-in-Integration-and-API/ba-p/500927) - Official guide on creating custom data fixtures
