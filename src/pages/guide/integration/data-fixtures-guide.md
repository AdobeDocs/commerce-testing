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

**Legacy fixtures** (file-based fixtures like `Magento/Catalog/_files/product_simple.php`) are **deprecated**. New legacy fixtures **cannot be created**. Use **parametrized data fixtures** instead for better maintainability, reusability, and type safety.

<InlineAlert variant="success" slots="text" />

**Parametrized data fixtures** are the recommended approach and can be used with **both DocBlock annotations and PHP Attributes**. PHP Attributes offer the best developer experience with superior IDE support and type safety.

### Comparison

| Approach | Status | Can Parametrize | Syntax Example |
|----------|--------|-----------------|--------|
| **Legacy fixtures** (file-based) | Deprecated | ❌ No | `@magentoDataFixture Magento/Catalog/_files/product.php` |
| **Parametrized data with Annotations** | ✅ Recommended | ✅ Yes | `@magentoDataFixture \Vendor\Module\Test\Fixture\Product with:{"sku": "test"} as:product` |
| **Parametrized data with Attributes** | ✅ Recommended | ✅ Yes | `#[DataFixture(ProductFixture::class, ['sku' => 'test'], 'product')]` |

### Why avoid legacy fixtures?

1. **No parametrization** - Each variation requires a separate file
2. **Hard to maintain** - Changes require modifying PHP scripts scattered across the codebase
3. **Poor discoverability** - Difficult to find what data a fixture creates
4. **No type safety** - Parameters and return values are not typed
5. **Coupling** - Tests become tightly coupled to specific fixture files

## Types of data fixtures

### 1. Legacy fixtures (Deprecated)

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

### 2. Parametrized data fixtures (Recommended)

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

#### With DocBlock Annotations (Parametrized syntax)

DocBlock annotations support parametrized data fixtures using the `with:` and `as:` syntax:

```php
/**
 * @magentoDataFixture \Magento\Catalog\Test\Fixture\Product with:{"sku": "simple-product", "price": 10} as:product
 */
public function testProductExists(): void
{
    $fixtures = DataFixtureStorageManager::getStorage();
    $product = $fixtures->get('product');
    // Test with customized product data
}
```

**Syntax:**
- `with:{"key": "value"}` - Pass parameters as JSON object
- `as:alias` - Assign an alias to reference the fixture data

## Parameterized data fixtures

The power of modern parametrized data fixtures lies in their ability to be customized - you can configure the data they create without writing new fixture classes.

<InlineAlert variant="success" slots="text" />

Parametrized data fixtures work with **both** DocBlock annotations (using `with:` and `as:` syntax) and PHP Attributes. PHP Attributes offer better IDE support and type safety.

### With PHP Attributes

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

### With DocBlock Annotations

DocBlock annotations support both parametrized data fixtures and legacy fixtures.

#### Using parametrized data fixtures

**Syntax:** `@magentoDataFixture \Fully\Qualified\ClassName with:{"param": "value"} as:alias`

- **`\Fully\Qualified\ClassName`** - Full class name of the fixture
- **`with:{"param": "value"}`** (optional) - Parameters as JSON object
- **`as:alias`** (optional) - Alias to reference fixture data
- **`$alias$`** - Reference another fixture's data

**Basic example:**

```php
/**
 * @magentoDataFixture \Magento\Catalog\Test\Fixture\Product with:{"sku": "simple1", "price": 5.0} as:product1
 * @magentoDataFixture \Magento\Catalog\Test\Fixture\Product with:{"sku": "simple2", "price": 10.0} as:product2
 */
public function testTwoProducts(): void
{
    $fixtures = DataFixtureStorageManager::getStorage();
    $product1 = $fixtures->get('product1');
    $product2 = $fixtures->get('product2');
}
```

**With fixture references:**

```php
/**
 * @magentoDataFixture \Magento\Catalog\Test\Fixture\Product with:{"sku": "simple1", "price": 5.0} as:product1
 * @magentoDataFixture \Magento\Catalog\Test\Fixture\Product with:{"sku": "simple2", "price": 10.0} as:product2
 * @magentoDataFixture \Magento\Quote\Test\Fixture\GuestCart as:cart
 * @magentoDataFixture \Magento\Quote\Test\Fixture\AddProductToCart with:{"cart": "$cart$", "product": "$product1$", "qty": 2}
 * @magentoDataFixture \Magento\Quote\Test\Fixture\AddProductToCart with:{"cart": "$cart$", "product": "$product2$", "qty": 1}
 */
public function testCartWithProducts(): void
{
    $fixtures = DataFixtureStorageManager::getStorage();
    $cart = $fixtures->get('cart');
    // Cart now has 2 units of product1 and 1 unit of product2
}
```

**Without parameters (uses defaults):**

```php
/**
 * @magentoDataFixture \Magento\Catalog\Test\Fixture\Product as:product
 */
public function testProductWithDefaults(): void
{
    $fixtures = DataFixtureStorageManager::getStorage();
    $product = $fixtures->get('product');
    // Product created with default values (auto-generated unique SKU, etc.)
}
```

#### Using legacy file-based fixtures (Deprecated)

```php
/**
 * @magentoDataFixture Magento/Catalog/_files/product_simple.php
 * @magentoDataFixture Magento/Customer/_files/customer.php
 */
public function testWithLegacyFixtures(): void
{
    // DEPRECATED - New legacy fixtures cannot be created
    // Use parametrized data fixtures instead
}
```

## Migration guide: Legacy to Modern

If you have tests using legacy fixtures (file-based with `@magentoDataFixture`), you should migrate them to parametrized data fixtures. New legacy fixtures **cannot be created**.

### Before (Legacy fixtures with DocBlock annotations)

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

### After (Option 1: Parametrized data with Annotations)

```php
/**
 * @magentoDataFixture \Magento\Catalog\Test\Fixture\Product with:{"sku": "test-product", "price": 10} as:product
 */
public function testProductPrice(): void
{
    $fixtures = DataFixtureStorageManager::getStorage();
    $product = $fixtures->get('product');
    $this->assertEquals(10, $product->getPrice());
}
```

### After (Option 2: Parametrized data with PHP Attributes)

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

### 1. Do not create legacy fixtures

<InlineAlert variant="warning" slots="text" />

**New legacy fixtures cannot be created.** Do not create new tests using legacy fixtures (e.g., `Magento/Catalog/_files/product_simple.php`). Always use parametrized data fixtures instead. Existing legacy fixtures should be migrated.

**Bad - Cannot create new:**
```php
/**
 * @magentoDataFixture Magento/Catalog/_files/product_simple.php
 */
```

**Good - Use parametrized data fixtures:**

With PHP Attributes:
```php
#[DataFixture(ProductFixture::class, ['sku' => 'test-product'])]
```

Or with DocBlock annotations:
```php
/**
 * @magentoDataFixture \Magento\Catalog\Test\Fixture\Product with:{"sku": "test-product"} as:product
 */
```

### 2. Prefer PHP Attributes for new tests

PHP Attributes provide better type safety, IDE support, and are easier to read than the DocBlock annotation `with:` and `as:` syntax.

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


