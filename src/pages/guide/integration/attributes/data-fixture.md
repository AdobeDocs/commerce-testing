---
title: Data fixture attribute | Commerce Testing
description: Prepare Adobe Commmerce and Magento Open Source databases for testing with this built-in PHP attribute.
keywords:
  - Tools
---

# Data fixture attribute

Data fixture attributes apply fixtures that implement `Magento\TestFramework\Fixture\DataFixtureInterface` or `Magento\TestFramework\Fixture\RevertibleDataFixtureInterface`.

It takes two more optional parameters alongside the fixture class name. The second parameter is the data that is used to customize the fixture and the third parameter is the alias (ID) of the fixture that is used to retrieve the data returned by the fixture and also as a reference in other fixture parameters.

Use data fixtures to prepare a database for tests. The Integration Testing Framework (ITF) reverts the database to its initial state automatically.
To set up a date fixture, use the `DataFixture` attribute.

## Format

```php?start_inline=1
#[
    DataFixture(string $type, array $data = [], ?string $as = null, ?string $scope = null, int $count = 1)
]
```

### Parameters

-  **type**
   -  Name of a class that implements `Magento\TestFramework\Fixture\DataFixtureInterface` or `Magento\TestFramework\Fixture\RevertibleDataFixtureInterface`.
-  **data**
   -  The optional array of data passed on to the fixture.
-  **count**
   -  The optional number of entities of the same kind and configuration that this fixture should generate.
-  **scope**
   -  The optional store view, site, or store group fixture alias from the scope of which the fixture will generate the entity.
-  **as**
   -  The fixture alias that will be used as a reference to retrieve the data returned by the fixture and also as a reference in other fixtures parameters.

## Fixture Usage

### Retrieve fixture data in the test

A test can retrieve data that was returned by a Data Fixture using `Magento\TestFramework\Fixture\DataFixtureStorageManager` and the fixture alias.

The following example shows how to retrieve data that was returned by the fixtures:

```php?start_inline=1
class ProductsList extends \PHPUnit\Framework\TestCase
{
    #[
        DataFixture(ProductFixture::class, as: 'product1'),
        DataFixture(ProductFixture::class, as: 'product2'),
        DataFixture(ProductFixture::class, as: 'product3')
    ]
    public function testGetProductsCount(): void
    {
        $fixtures = DataFixtureStorageManager::getStorage();
        $product1 = $fixtures->get('product1');
        $product2 = $fixtures->get('product2');
        $product3 = $fixtures->get('product3');
    }
}
```

### Supply data to data fixture as a variable

It is possible to supply data as a variable from one fixture to another using the fixture alias in one of the following formats:

-  `$fixtureAlias$` is a reference to the data that was returned by the fixture with alias `fixtureAlias`.
-  `$fixtureAlias.snake_case_property_name$` is a reference to the property `snake_case_property_name` in the data that was returned by the fixture with alias `fixtureAlias`.

The following example shows how a fixture can use the data of another fixture:

```php?start_inline=1
class QuoteTest extends \PHPUnit\Framework\TestCase
{
    #[
        DataFixture(GuestCartFixture::class, as: 'cart'),
        DataFixture(SetBillingAddressFixture::class, ['cart_id' => '$cart.id$']),
    ]
    public function testCollectTotals(): void
    {
    }
}
```

### Specifying the number of instances of data fixture to generate

<InlineAlert variant="info" slots="text" />

Sometimes, we need to generate several instances of a data fixture with exactly the same configuration.
For such cases, we can use the `count` parameter and set its value to the desired number of instances.

```php?start_inline=1
class ProductsList extends \PHPUnit\Framework\TestCase
{
   #[
      DataFixture(CategoryFixture::class, ['is_anchor' => 0], 'category1'),
      DataFixture(CategoryFixture::class, ['parent_id' => '$category1.id$'], 'category2'),
      DataFixture(ProductFixture::class, ['category_ids' => ['$category1.id$']])
      DataFixture(ProductFixture::class, ['category_ids' => ['$category2.id$']], count: 2)
   ]
   public function testAddCategoryFilter(): void
   {
      $fixtures = DataFixtureStorageManager::getStorage();
      $category1 = $fixtures->get('category1');
      $category2 = $fixtures->get('category2');
      $collection = $this->collectionFactory->addCategoryFilter($category2);
      $this->assertEquals(2, $collection->getSize());
      $collection = $this->collectionFactory->addCategoryFilter($category1);
      $this->assertEquals(1, $collection->getSize());
   }
}
```

Or in case where we need to specify an alias:

```php?start_inline=1
class ProductsList extends \PHPUnit\Framework\TestCase
{
   #[
      DataFixture(ProductFixture::class, as: 'product', count: 3)
   ]
   public function testGetProductsCount(): void
   {
      $fixtures = DataFixtureStorageManager::getStorage();
      $product1 = $fixtures->get('product1');
      $product2 = $fixtures->get('product2');
      $product3 = $fixtures->get('product3');
   }
}
```

The generated fixtures will be assigned aliases product1, product2, and product3 (respectively).

### Specifying the store scope for the data fixture

<InlineAlert variant="info" slots="text" />

If you need to instruct the system to execute a data fixture in the scope of a specific store view, you can set the `scope` parameter value to the valid store view, site, or store group identifier.

In the following example, we create a new store with the `store2` identifier and a product. Then, we create a guest cart under the `store2` scope and add a created product to it.

```php?start_inline=1
class QuoteTest extends \PHPUnit\Framework\TestCase
{
    #[
        DataFixture(StoreFixture::class, as: 'store2'),
        DataFixture(ProductFixture::class, as: 'p'),
        DataFixture(GuestCartFixture::class, as: 'cart', scope: 'store2'),
        DataFixture(AddProductToCartFixture::class, ['cart_id' => '$cart.id$', 'product_id' => '$p.id$', 'qty' => 2]),
    ]
    public function testCollectTotals(): void
    {
    }
}
```

### Test class and test method scopes

The `DataFixture` can be specified for a particular test case (method) or for an entire test class.
The basic rules for fixture attributes at different levels are:

-  `DataFixture` at a test class level makes the framework apply the declared fixtures to each test in the test class.
   When the final test is complete, all class-level fixtures are reverted.
-  `DataFixture` for a particular test method signals the framework to revert the fixtures declared on a test class level and applies the fixtures declared at a test method level instead.
   When the test is complete, the ITF reverts the applied fixtures. Test class level data fixtures are ignored if they are present at the test method level.

<InlineAlert variant="info" slots="text" />

The integration testing framework interacts with a database to revert the applied fixtures.

## Creating the fixture

Data Fixture is a PHP class that implements `Magento\TestFramework\Fixture\DataFixtureInterface` or  `Magento\TestFramework\Fixture\RevertibleDataFixtureInterface`. Its main purpose is to seed the database with the data needed to run a test.

### Principles

1. Data Fixture class MUST implement `Magento\TestFramework\Fixture\DataFixtureInterface` or  `Magento\TestFramework\Fixture\RevertibleDataFixtureInterface` if the data created by the fixture is revertible. For instance, a fixture that creates an entity (for example, product).
1. Data Fixture class MUST be placed in the `<ModuleName>/Test/Fixture` folder of the corresponding module with namespace: `<VendorName>\<ModuleName>\Test\Fixture` (for example, `Magento\Catalog\Test\Fixture`).
1. Data Fixture class SHOULD follow single responsibility principle.
1. Data Fixture class MUST depend only on services from modules that are declared in the `require` section of its module's composer.json file.
1. Data Fixture MUST NOT depend on another fixture.
1. Data Fixture SHOULD be implemented using service APIs.
1. Data Fixture SHOULD have dynamic default data to allow generating unique fixtures.
1. Data Fixture MUST NOT handle input validation. Such validation should be handled by the service API.

### Dynamic default data

In order to generate multiple fixtures of the same type without having to manually configure unique fields, you can use the placeholder `%uniqid%` in the default value of unique fields and `Magento\TestFramework\Fixture\Data\ProcessorInterface` to substitute the placeholder with a unique sequence.

[`Magento\Catalog\Test\Fixture\Product`][] demonstrates the usage of `%uniqid%` (`sku`: `simple-product%uniqid%`) in the fixture default data.

In the following example, a unique `sku` is automatically generated for the first fixture (for example, `simple-product61c10b2e86f991`) and the second fixture (for example, `simple-product61c10b2e86f992`). The sequence is random and therefore unpredictable.

```php?start_inline=1
class ProductsListTest extends \PHPUnit\Framework\TestCase
{
     #[
        DataFixture(ProductFixture::class),
        DataFixture(ProductFixture::class)
     ]
    public function testGetProductsCount(): void
    {
    }
}
```
### Comment block for data fixture

When creating a data fixture class, it is important to include a comprehensive comment block that provides a detailed description of the fixture’s usage and relevant use case scenarios. This documentation serves as the sole reference for other developers who will utilize the fixture and is essential for maintaining its integrity. Not only is it the responsibility of the developer who creates the fixture, but also of the code reviewer to ensure that the documentation block is clear, accurate, and well-structured.

Please make sure to include the following points in your documentation block:

-  The usage of the fixture.
- The example how to use the fixture.
- For fixtures which can be used in different ways, give example of each use case.

### Examples

Example 1:

```php?start_inline=1
 /* 
 *    Target Rule fixture
 *
 *    Usage: Using array list. (sku in (simple1,simple3))
 *
 *    #[
 *        DataFixture(
 *            RuleFixture::class,
 *            [
 *                'conditions' => [
 *                    [
 *                        'attribute' => 'sku',
 *                        'operator' => '()',
 *                        'value' => 'simple1,simple3'
 *                    ]
 *                ]
 *            ],
 *            'rule'
 *        )
 *    ]
 */
 ```
Example 2:
    
If the fixture can be used in different ways, provide a short description of each use case.
 ```php?start_inline=1
/* 
*    Product fixture
*
*    Usage-1: Using array list. (sku in (simple1,simple3))
*
*    #[
*        DataFixture(
*            ProductFixture::class,
*            [
*                'sku' => 'simple1',
*                'price' => 10
*            ],
*            'product1'
*        )
*    ]
*    
*    Usage-2: Using associative array. (sku=simple1 OR sku=simple3)
*    
*    #[
*        DataFixture(
*            RuleFixture::class,
*            [
*                'conditions' => [
*                    'aggregator' => 'any',
*                    'conditions' => [
*                        [
*                            'attribute' => 'sku',
*                            'value' => 'simple1'
*                        ],
*                        [
*                            'attribute' => 'sku',
*                            'value' => 'simple3'
*                        ]
*                    ],
*                ],
*            ],
*            'rule'
*        )
*    ]
*/
```

When we implement `apply(array $data=[])` from DataFixtureInterface for the fixture class, we should provide details what $data contains as array.

Example:

```php?start_inline=1
    /**
     * Apply fixture
     *
     * @param array $data
     * @return void
     *
     * <pre>
     *    $data = [
     *      'sku' => (int) SKU. Required
     *      'name' => (string) Product Name. Required
     *      'price' => (float) Product Price. Required
     *      'description' => (text) Product Description. Optional
     *    ]
     * </pre>
     */
    public function apply(array $data = []): void
    {
        $this->product->create($data);
    }
```

If `array $data=[]` can be used in different ways, provide a short description of each use case.

```php?start_inline=1
    /**
     * Apply fixture
     *
     * @param array $data
     * @return void
     *
     * $data['items']: can be supplied in following formats:
     *      - array of arrays [["sku":"$product1.sku$","qty":1], ["sku":"$product2.sku$","qty":1]]
     *      - array of arrays [["order_item_id":"$oItem1.sku$","qty":1], ["order_item_id":"$oItem2.sku$","qty":1]]
     *      - array of arrays [["product_id":"$product1.id$","qty":1], ["product_id":"$product2.id$","qty":1]]
     *      - array of arrays [["quote_item_id":"$qItem1.id$","qty":1], ["quote_item_id":"$qItem2.id$","qty":1]]
     *      - array of SKUs ["$product1.sku$", "$product2.sku$"]
     *      - array of order items IDs ["$oItem1.id$", "$oItem2.id$"]
     *      - array of product instances ["$product1$", "$product2$"]*
     */
    public function apply(array $data = []): void
    {
        $service = $this->serviceFactory->create(RefundOrderInterface::class, 'execute');
        $invoiceId = $service->execute($this->prepareData($data));
        return $this->creditmemoRepository->get($invoiceId);
    }
```

### Decoupling fixtures

Fixtures must be written in the way that they only use one API to generate data. For example, the fixture that creates
a product should only invoke the "Create Product" API and return the product created. This fixture should not add any extra
logic beyond the "create product" API capabilities, such logic should be implemented in a separate fixture.

### Examples

Example 1:

```php?start_inline=1
class QuoteTest extends \PHPUnit\Framework\TestCase
{

    #[
        DataFixture(ProductFixture::class, as: 'p'),
        DataFixture(GuestCartFixture::class, as: 'cart'),
        DataFixture(AddProductToCartFixture::class, ['cart_id' => '$cart.id$', 'product_id' => '$p.id$', 'qty' => 2]),
        DataFixture(SetBillingAddressFixture::class, ['cart_id' => '$cart.id$']),
        DataFixture(SetShippingAddressFixture::class, ['cart_id' => '$cart.id$']),
    ]
    public function testCollectTotals(): void
    {
    }
}
```

Example 2:

```php?start_inline=1
class PriceTest extends \PHPUnit\Framework\TestCase
{
    #[
        DataFixture(ProductFixture::class, ['sku' => 'simple1', 'price' => 10], 'p1'),
        DataFixture(ProductFixture::class, ['sku' => 'simple2', 'price' => 20], 'p2'),
        DataFixture(ProductFixture::class, ['sku' => 'simple3', 'price' => 30], 'p3'),
        DataFixture(BundleSelectionFixture::class, ['sku' => '$p1.sku$', 'price' => 10, 'price_type' => 0], 'link1'),
        DataFixture(BundleSelectionFixture::class, ['sku' => '$p2.sku$', 'price' => 25, 'price_type' => 1], 'link2'),
        DataFixture(BundleSelectionFixture::class, ['sku' => '$p3.sku$', 'price' => 25, 'price_type' => 0], 'link3'),
        DataFixture(BundleOptionFixture::class, ['product_links' => ['$link1$', '$link2$', '$link3$']], 'opt1'),
        DataFixture(
            BundleProductFixture::class,
            ['sku' => 'bundle1','price' => 50,'price_type' => 1,'_options' => ['$opt1$']],
            'bundle1'
        ),
    ]
    public function testBundleWithFixedPrice(): void
    {

    }
}
```

### Fixture rollback

A fixture that contains database transactions only are reverted automatically.
Otherwise, when a fixture creates files or performs any actions other than a database transaction, provide the corresponding rollback logic, in the `revert` method of the revertible data fixture. Rollbacks are run after reverting all the fixtures related to database transactions.

<InlineAlert variant="info" slots="text" />

See the [`Magento\Catalog\Test\Fixture\Product`][] fixture for an example.

### Restrictions

Do not rely on and do not modify an application state from within a fixture. The [application isolation attribute][magentoAppIsolation] can reset the application state at any time.

<!-- Link definitions -->

[magentoAppIsolation]: ../annotations/magento-app-isolation.md
[`Magento\Catalog\Test\Fixture\Product`]: https://github.com/magento/magento2/blob/2.4-develop/app/code/Magento/Catalog/Test/Fixture/Product.php
