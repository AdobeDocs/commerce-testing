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

Think of data fixtures as the "arrange" phase of your test - they prepare the data your test needs to verify specific functionality.

## Modern vs Legacy approaches

Adobe Commerce and Magento Open Source support multiple ways to work with data fixtures, but not all are equally recommended.

<InlineAlert variant="warning" slots="text" />

**Legacy file-based fixtures** (like `Magento/Catalog/_files/product_simple.php`) are **discouraged** for new test development. Use **parametrized class-based fixtures** instead for better maintainability, reusability, and type safety.

<InlineAlert variant="success" slots="text" />

**Parametrized class-based fixtures** are the recommended approach and can be used with **both DocBlock annotations and PHP Attributes**. PHP Attributes offer the best developer experience with superior IDE support and type safety.

### Comparison

| Approach | Status | Can Parametrize | Syntax |
|----------|--------|-----------------|--------|
| **File-based fixtures** | ⚠️ Discouraged | ❌ No | `@magentoDataFixture Magento/Catalog/_files/product.php` |
| **Class-based with Annotations** | ✅ Recommended | ✅ Yes | `@magentoDataFixture \Magento\Catalog\Test\Fixture\Product::class` |
| **Class-based with Attributes** | ✅ Recommended | ✅ Yes | `#[DataFixture(ProductFixture::class, ['sku' => 'test'])]` |

### Why avoid legacy file-based fixtures?

1. **No parametrization** - Each variation requires a separate file
2. **Hard to maintain** - Changes require modifying PHP scripts scattered across the codebase
3. **Poor discoverability** - Difficult to find what data a fixture creates
4. **No type safety** - Parameters and return values are not typed
5. **Coupling** - Tests become tightly coupled to specific fixture files

## Types of data fixtures

### 1. File-based fixtures (Legacy - Discouraged ⚠️)

These are PHP scripts that directly execute database operations. They **cannot be parametrized** and create maintenance challenges.

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

**Example legacy fixture file:** `Magento/Catalog/_files/product_simple.php`

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

### 2. Class-based fixtures (Modern - Recommended ✅)

These are PHP classes that implement `DataFixtureInterface` or `RevertibleDataFixtureInterface`. They support **powerful parametrization** and can be used with **both DocBlock annotations and PHP Attributes**.

#### With PHP Attributes (Best option)

```php
#[
    DataFixture(ProductFixture::class, ['sku' => 'custom-sku', 'price' => 99.99], 'product')
]
public function testProductExists(): void
{
    $fixtures = DataFixtureStorageManager::getStorage();
    $product = $fixtures->get('product');
    // Test with customized product data
}
```

#### With DocBlock Annotations (Still parametrized!)

```php
/**
 * @magentoDataFixture \Magento\Catalog\Test\Fixture\Product::class
 */
public function testProductExists(): void
{
    // Uses default fixture values with auto-generated unique SKU
}
```

**Note:** While DocBlock annotations can reference class-based fixtures, they have limited parametrization compared to PHP Attributes. You typically get default values with auto-generated unique identifiers.

## Parameterized data fixtures

The power of modern class-based fixtures lies in their ability to be parametrized - you can customize the data they create without writing new fixture classes.

<InlineAlert variant="success" slots="text" />

Parametrization is available with both DocBlock annotations and PHP Attributes, but **PHP Attributes offer significantly more flexibility and control** over the fixture data.

### With PHP Attributes (Full parametrization)

PHP Attributes support powerful parametrization, allowing you to customize fixture data, create references between fixtures, generate multiple instances, and control scope.

#### Basic parametrization

```php
#[
    DataFixture(ProductFixture::class, ['sku' => 'custom-sku', 'price' => 99.99, 'name' => 'Custom Product'])
]
public function testCustomProduct(): void
{
    // Product is created with custom values
}
```

#### Using aliases and references

You can create multiple fixtures and reference data between them:

```php
#[
    DataFixture(CategoryFixture::class, ['name' => 'Electronics'], 'category'),
    DataFixture(ProductFixture::class, ['sku' => 'laptop', 'category_ids' => ['$category.id$']], 'product')
]
public function testProductInCategory(): void
{
    $fixtures = DataFixtureStorageManager::getStorage();
    $category = $fixtures->get('category');
    $product = $fixtures->get('product');
}
```

The syntax `$category.id$` references the `id` property from the `category` fixture.

#### Generating multiple instances

Use the `count` parameter to generate multiple instances:

```php
#[
    DataFixture(ProductFixture::class, ['price' => 10], count: 5)
]
public function testFiveProducts(): void
{
    // Creates 5 products with auto-generated unique SKUs
}
```

With aliases:

```php
#[
    DataFixture(ProductFixture::class, as: 'product', count: 3)
]
public function testThreeProducts(): void
{
    $fixtures = DataFixtureStorageManager::getStorage();
    $product1 = $fixtures->get('product1');
    $product2 = $fixtures->get('product2');
    $product3 = $fixtures->get('product3');
}
```

#### Store scope

Execute fixtures in specific store scopes:

```php
#[
    DataFixture(StoreFixture::class, as: 'second_store'),
    DataFixture(ProductFixture::class, ['name' => 'Store Product'], scope: 'second_store')
]
public function testProductInStore(): void
{
    // Product created in second_store scope
}
```

### With DocBlock Annotations (Limited parametrization)

DocBlock annotations can use class-based fixtures but with limited customization. They rely on the fixture's default values with auto-generated unique identifiers.

#### Using class-based fixtures

```php
/**
 * @magentoDataFixture \Magento\Catalog\Test\Fixture\Product::class
 * @magentoDataFixture \Magento\Customer\Test\Fixture\Customer::class
 */
public function testWithMultipleFixtures(): void
{
    // Products and customers created with default values + unique IDs
}
```

#### Legacy file-based fixtures (Avoid!)

```php
/**
 * @magentoDataFixture Magento/Catalog/_files/product_simple.php
 * @magentoDataFixture Magento/Customer/_files/customer.php
 */
public function testWithLegacyFixtures(): void
{
    // ⚠️ Discouraged - can't customize data, hard to maintain
}
```

## Migration guide: Legacy to Modern

If you have tests using legacy file-based fixtures, here's how to migrate:

### Before (Legacy file-based)

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

### After (Modern class-based with Attributes)

```php
#[
    DataFixture(ProductFixture::class, ['sku' => 'test-product', 'price' => 10], 'product')
]
public function testProductPrice(): void
{
    $fixtures = DataFixtureStorageManager::getStorage();
    $product = $fixtures->get('product');
    $this->assertEquals(10, $product->getPrice());
}
```

### After (Modern class-based with Annotations)

```php
/**
 * @magentoDataFixture \Magento\Catalog\Test\Fixture\Product::class
 */
public function testProductPrice(): void
{
    // Product created with auto-generated unique SKU and default price
    // Note: Less control than Attributes, but better than legacy files
}
```

## Common fixture examples

### Product fixtures

#### Simple product (Attributes)

```php
#[
    DataFixture(
        ProductFixture::class,
        [
            'sku' => 'simple-product',
            'name' => 'Simple Product',
            'price' => 10,
            'type_id' => 'simple',
            'attribute_set_id' => 4,
            'status' => 1,
            'visibility' => 4,
            'stock_data' => ['qty' => 100, 'is_in_stock' => true]
        ],
        'product'
    )
]
```

#### Configurable product with variants

```php
#[
    DataFixture(ProductFixture::class, ['sku' => 'simple1', 'price' => 10], 's1'),
    DataFixture(ProductFixture::class, ['sku' => 'simple2', 'price' => 20], 's2'),
    DataFixture(
        ConfigurableProductFixture::class,
        [
            'sku' => 'configurable',
            '_options' => ['$s1$', '$s2$']
        ]
    )
]
```

### Category fixtures

```php
#[
    DataFixture(CategoryFixture::class, ['name' => 'Parent Category', 'is_active' => true], 'parent'),
    DataFixture(CategoryFixture::class, ['name' => 'Child Category', 'parent_id' => '$parent.id$'], 'child')
]
```

### Customer fixtures

```php
#[
    DataFixture(
        CustomerFixture::class,
        [
            'email' => 'customer@example.com',
            'firstname' => 'John',
            'lastname' => 'Doe',
            'password' => 'password123'
        ],
        'customer'
    )
]
```

### Cart/Quote fixtures

```php
#[
    DataFixture(ProductFixture::class, ['price' => 10], 'product'),
    DataFixture(GuestCartFixture::class, as: 'cart'),
    DataFixture(
        AddProductToCartFixture::class,
        [
            'cart_id' => '$cart.id$',
            'product_id' => '$product.id$',
            'qty' => 2
        ]
    )
]
```

### Order fixtures

```php
#[
    DataFixture(ProductFixture::class, ['price' => 100], 'product'),
    DataFixture(CustomerFixture::class, as: 'customer'),
    DataFixture(
        OrderFixture::class,
        [
            'customer_id' => '$customer.id$',
            'items' => [
                ['product_id' => '$product.id$', 'qty' => 1]
            ]
        ],
        'order'
    )
]
```

### CMS page fixtures

```php
#[
    DataFixture(
        PageFixture::class,
        [
            'title' => 'Test Page',
            'identifier' => 'test-page',
            'content' => '<h1>Test Content</h1>',
            'is_active' => true
        ]
    )
]
```

### Store fixtures

```php
#[
    DataFixture(WebsiteFixture::class, as: 'website'),
    DataFixture(
        StoreGroupFixture::class,
        ['website_id' => '$website.id$'],
        'store_group'
    ),
    DataFixture(
        StoreFixture::class,
        [
            'code' => 'custom_store',
            'store_group_id' => '$store_group.id$'
        ],
        'store'
    )
]
```

## Complex example: Bundle product

```php
#[
    DataFixture(ProductFixture::class, ['sku' => 'simple1', 'price' => 10], 'p1'),
    DataFixture(ProductFixture::class, ['sku' => 'simple2', 'price' => 20], 'p2'),
    DataFixture(ProductFixture::class, ['sku' => 'simple3', 'price' => 30], 'p3'),
    DataFixture(BundleSelectionFixture::class, ['sku' => '$p1.sku$', 'price' => 10], 'link1'),
    DataFixture(BundleSelectionFixture::class, ['sku' => '$p2.sku$', 'price' => 20], 'link2'),
    DataFixture(BundleSelectionFixture::class, ['sku' => '$p3.sku$', 'price' => 30], 'link3'),
    DataFixture(
        BundleOptionFixture::class,
        ['product_links' => ['$link1$', '$link2$', '$link3$']],
        'option'
    ),
    DataFixture(
        BundleProductFixture::class,
        [
            'sku' => 'bundle-product',
            'price' => 50,
            '_options' => ['$option$']
        ]
    )
]
public function testBundleProduct(): void
{
    // Test bundle product logic
}
```

## Fixture scope: Class vs Method

Fixtures can be applied at the test class level or method level:

### Class-level fixtures

```php
#[
    DataFixture(ProductFixture::class, count: 10)
]
class ProductCollectionTest extends TestCase
{
    // All tests in this class will have 10 products available
    
    public function testCount(): void { }
    
    public function testFilter(): void { }
}
```

### Method-level fixtures

```php
class ProductTest extends TestCase
{
    #[DataFixture(ProductFixture::class, ['price' => 10])]
    public function testCheapProduct(): void { }
    
    #[DataFixture(ProductFixture::class, ['price' => 1000])]
    public function testExpensiveProduct(): void { }
}
```

<InlineAlert variant="warning" slots="text" />

When method-level fixtures are present, class-level fixtures are **ignored** for that method.

## Best practices

### 1. Avoid legacy file-based fixtures

<InlineAlert variant="warning" slots="text" />

Do not create new tests using legacy file-based fixtures (e.g., `Magento/Catalog/_files/product_simple.php`). Always use modern class-based fixtures instead.

**Bad:**
```php
/**
 * @magentoDataFixture Magento/Catalog/_files/product_simple.php
 */
```

**Good:**
```php
#[DataFixture(ProductFixture::class, ['sku' => 'test-product'])]
```

**Also Good (if not using PHP 8):**
```php
/**
 * @magentoDataFixture \Magento\Catalog\Test\Fixture\Product::class
 */
```

### 2. Prefer PHP Attributes for new tests

PHP Attributes provide better type safety, IDE support, full parametrization, and are easier to maintain.

### 3. Keep fixtures focused

Each fixture should do one thing. Use multiple fixtures and compose them rather than creating complex all-in-one fixtures.

### 4. Use fixture aliases

Always use the `as` parameter for fixtures you'll reference later:

```php
#[
    DataFixture(CategoryFixture::class, as: 'category'),  // Good
    DataFixture(ProductFixture::class, ['category_ids' => ['$category.id$']])
]
```

### 5. Leverage dynamic defaults

Most modern fixtures use `%uniqid%` to auto-generate unique values. You don't always need to specify every field:

```php
#[
    DataFixture(ProductFixture::class),  // Creates product with unique SKU
    DataFixture(ProductFixture::class)   // Creates another with different unique SKU
]
```

### 6. Use appropriate isolation

Combine fixtures with appropriate isolation attributes:

```php
#[
    AppIsolation(enabled: true),
    DbIsolation(enabled: true),
    DataFixture(ProductFixture::class)
]
```

### 7. Clean up is automatic

Fixtures that implement `RevertibleDataFixtureInterface` are automatically cleaned up. You don't need to manually delete test data.

### 8. Don't depend on fixture execution order

While fixtures are applied in the order specified, design your tests to not rely on side effects between fixtures.

## Finding available fixtures

Most Commerce modules include test fixtures in their `Test/Fixture` directory:

- `Magento/Catalog/Test/Fixture/Product.php`
- `Magento/Customer/Test/Fixture/Customer.php`
- `Magento/Sales/Test/Fixture/Order.php`
- `Magento/Cms/Test/Fixture/Page.php`

Check these directories in the Adobe Commerce or Magento Open Source codebase to discover available fixtures and their parameters.

## Creating custom fixtures

If you need custom fixtures, create a class that implements `DataFixtureInterface`:

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

## Learn more

- [DocBlock Annotations](annotations/index.md) - Complete annotation reference
- [PHP Attributes](attributes/index.md) - Complete attributes reference
- [DataFixture Attribute](attributes/data-fixture.md) - Detailed DataFixture documentation
- [@magentoDataFixture Annotation](annotations/magento-data-fixture.md) - Legacy annotation documentation


