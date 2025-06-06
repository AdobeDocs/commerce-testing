---
title: Functional test metadata | Commerce Testing
description: Use data handling actions for your Adobe Commerce and Magento Open Source tests using the Functional Testing Framework.
keywords:
  - Tools
---

# Metadata

In this topic we talk about handling entities that you need in your tests (such as categories, products, wish lists, and similar) using MFTF.
Using data handling actions like [`createData`], [`deleteData`], [`updateData`], and [`getData`], you are able to create, delete, update, and read entities for your tests.
The framework enables you to send HTTP requests with these statically defined data entities:

-  [Sending a REST API request](#sending-a-rest-api-request)
-  [Handling a REST API response](#handling-a-rest-api-response)
-  [Sending an HTML form encoded in URL](#handling-entities-using-html-forms)

You have probably noticed that some modules in acceptance functional tests contain a directory, which is called `Metadata`.

Example of a module with _Metadata_:

```tree
Wishlist
├── Data
├── Metadata
├── Page
├── Section
└── Test
```

This directory contains XML files with metadata required to create a valid request to handle an entity defined in `dataType`.
A metadata file contains a list of operations with different types (defined in `type`).
Each [operation](#operation) includes:

-  The set of adjustments for processing a request in [attributes](#operations), and in some cases, a response  (see `successRegex`, `returnRegex` and `returnIndex` in [reference details](#operations)).
-  The type of body content encoding in [contentType](#contenttype).
-  The body of the request represented as a tree of objects, arrays, and fields.

When a test step requires handling the specified data entity, the Functional Testing Framework performs the following steps:

-  Reads input data (`<data/>`) and the type (the `type` attribute) of the specified [entity].
-  Searches the metadata operation for the `dataType` that matches the entity's `type`. For example, `<entity type="product">` matches `<operation dataType="product"`.
-  Forms a request of the operation and the input data of the entity according to matching metadata.
-  Stores a response and provides access to its data using the Functional Testing Framework variables syntax in XML.

The following diagram demonstrates the XML structure of a metadata file:
![Structure of metadata](../_images/functional-testing/metadata-dia.svg)

## Format

```xml
<?xml version="1.0" encoding="UTF-8"?>
<operations xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:noNamespaceSchemaLocation="urn:magento:mftf:DataGenerator/etc/dataOperation.xsd">
    <operation name=""
               dataType=""
               type=""
               auth=""
               url=""
               method="">
        <contentType></contentType>
        <object key="" dataType="">
            <field key="">integer</field>
            <field key="">string</field>
            <field key="">boolean</field>
            <array key="">
                <value>string</value>
            </array>
        </object>
    </operation>
</operations>
```

## Principles

1. A `dataType` value must match the `type` value of the corresponding entity.
2. A filename should be PascalCase and end with `Meta.xml`.
   Example: `ProductAttributeMeta.xml`.
3. A metadata file may contain different types of operations (`type`) with the same data entity (`dataType`).

Example:

  ```xml
  <operations>
      <operation type="create" dataType="category">
          ...
      </operation>
      <operation type="update" dataType="category">
          ...
      </operation>
      <operation type="delete" dataType="category">
          ...
      </operation>
      <operation type="get" dataType="category">
          ...
      </operation>
  </operations>
  ```

## Handling entities using REST API

### Sending a REST API request

The Functional Testing Framework allows you to handle basic CRUD operations with an object using [REST API][api reference] requests.
To convert a request to the Functional Testing Framework format, wrap the corresponding REST API request into XML tags according to the [Reference documentation](#reference).

-  GET is used for retrieving data from objects.
-  POST is used for creating new objects.
-  PUT is used for updating objects.
-  DELETE is used for deleting objects.

#### Category Example

This is an example of how to handle a category using REST API operations provided by the `catalogCategoryRepositoryV1` service.

![REST API operations provided by catalogCategoryRepositoryV1][catalogCategoryRepositoryV1 image]

The above screenshot from the [REST API Reference][api reference] demonstrates a list of available operations to:

-  Delete a category by its identifier (`method="DELETE"`)
-  Get information about a category by its ID (`method="GET"`)
-  [Create a new category](#create-an-object-in-admin) (`method="POST"`)
-  Update category data by its ID (`method="PUT"`)

We assume that our `.env` file sets `MAGENTO_BASE_URL=https://example.com/` and `MAGENTO_BACKEND_NAME=admin`.

##### Create a simple category

Let's see what happens when you create a category:

```xml
<createData entity="_defaultCategory" stepKey="createPreReqCategory"/>
```

The Functional Testing Framework searches in the _Data_ directory an entity with `<entity name="_defaultCategory">` and reads `type` of the entity.
If there are more than one entity with the same name, all of the entities are merged.

_Catalog/Data/CategoryData.xml_:

```xml
<entity name="_defaultCategory" type="category">
    <data key="name" unique="suffix">simpleCategory</data>
    <data key="name_lwr" unique="suffix">simplecategory</data>
    <data key="is_active">true</data>
</entity>
```

Here, `type` is equal to `"category"`, which instructs the Functional Testing Framework to search an operation with `dataType="category"`.
Since the action is __to create__ a category, the Functional Testing Framework will also search for operation with `type="create"` in _Metadata_ for `dataType="category"`.

_Catalog/Metadata/CategoryMeta.xml_:

```xml
<operation name="CreateCategory" dataType="category" type="create" auth="adminOauth" url="/V1/categories" method="POST">
    <contentType>application/json</contentType>
    <object key="category" dataType="category">
        <field key="parent_id">integer</field>
        <field key="name">string</field>
        <field key="is_active">boolean</field>
        <field key="position">integer</field>
        <field key="level">integer</field>
        <field key="children">string</field>
        <field key="created_at">string</field>
        <field key="updated_at">string</field>
        <field key="path">string</field>
        <field key="include_in_menu">boolean</field>
        <array key="available_sort_by">
            <value>string</value>
        </array>
        <field key="extension_attributes">empty_extension_attribute</field>
        <array key="custom_attributes">
            <value>custom_attribute</value>
        </array>
    </object>
</operation>
```

(The corresponding operation is provided by _catalogCategoryRepositoryV1_ in [REST API][api reference].)

The following is encoded in `<operation>`:

-  `name="CreateCategory"` defines a descriptive name of the operation, which is used for merging if needed.
-  `dataType="category"` defines a relation with data entities with input data for a Category (`<entity type="category">`).
-  `auth="adminOauth"` defines OAuth authorization, which is required for the Admin area.
-  `url="/V1/categories"` defines a routing URL to the corresponding service class.
  (The request will be sent to `https://example.com/rest/V1/categories` if `MAGENTO_BASE_URL=https://example.com/` and `MAGENTO_BACKEND_NAME=admin` are set in the _acceptance/.env_ configuration file.)
-  `method="POST"` defines a POST method of the HTTP request.

`<contentType>application/json</contentType>` defines a content type of the REST API request, which is set as `application/json` here.

The parameter that declares a body of the request is _catalogCategoryRepositoryV1SavePostBody_.
Using the [Reference](#reference), we can trace how the JSON request was converted into XML representation.

<InlineAlert variant="info" slots="text" />

Comments in the example below are used to demonstrate relation between JSON request and Functional Testing Framework metadata in XML.
JSON does not support comments.

Model schema for _catalogCategoryRepositoryV1SavePostBody_ with XML representation of _Catalog/Metadata/CategoryMeta.xml_ in comments:

```json
{                                           // XML representation in the Functional Testing Framework metadata format (see 'Catalog/Metadata/CategoryMeta.xml')
  "category": {                             // <object key="category" dataType="category">
    "id": 0,                                // Skipped, because Category ID is not available on UI when you create a new category.
    "parent_id": 0,                         // <field key="parent_id">integer</field>
    "name": "string",                       // <field key="name">string</field>
    "is_active": true,                      // <field key="is_active">boolean</field>
    "position": 0,                          // <field key="position">integer</field>
    "level": 0,                             // <field key="level">integer</field>
    "children": "string",                   // <field key="children">string</field>
    "created_at": "string",                 // <field key="created_at">string</field>
    "updated_at": "string",                 // <field key="updated_at">string</field>
    "path": "string",                       // <field key="path">string</field>
    "available_sort_by": [                  // <array key="available_sort_by">
      "string"                              // <value>string</value>
    ],                                      // </array>
    "include_in_menu": true,                // <field key="include_in_menu">boolean</field>
    "extension_attributes": {},             // <field key="extension_attributes">empty_extension_attribute</field>, where 'empty_extension_attribute' is a reference to operation with 'dataType="empty_extension_attribute"' (see 'Catalog/Metadata/EmptyExtensionAttributeMeta.xml')
    "custom_attributes": [                  // <array key="custom_attributes">
      {                                     // <value>custom_attribute</value>, where 'custom_attribute' is a reference to operation with 'dataType="custom_attribute"' (see 'Catalog/Metadata/CustomAttributeMeta.xml')
        "attribute_code": "string",
        "value": "string"
      }
    ]                                       // </array>
  }                                         // </object>
}
```

So, the body of a REST API request that creates a simple category is the following:

```json
{                                             // XML representation of input data used to create a simple category ("Catalog/Data/CategoryData.xml")
  "category": {                               // <entity name="_defaultCategory" type="category">
    "name": "simpleCategory_0986576456",      // <data key="name" unique="suffix">simpleCategory</data>
    "is_active": true                         // <data key="is_active">true</data>
  }                                           // </entity>
}
```

#### Guest Cart Example

This is an example of how to handle a guest cart using REST API operations.

##### Create an object as a guest

The corresponding test step is:

```xml
<createData entity="guestCart" stepKey="createGuestCart"/>
```

The Functional Testing Framework searches in the _Data_ directory an entity with `<entity name="GuestCart">` and reads `type`.

_Quote/Data/GuestCartData.xml_:

```xml
<entity name="GuestCart" type="GuestCart">
</entity>
```

`type="guestCart"` points to the operation with `dataType=GuestCart"` and `type="create"` in the _Metadata_ directory.

_Quote/Metadata/GuestCartMeta.xml_:

```xml
<operation name="CreateGuestCart" dataType="GuestCart" type="create" auth="anonymous" url="/V1/guest-carts" method="POST">
    <contentType>application/json</contentType>
</operation>
```

As a result, the Functional Testing Framework sends an unauthorized POST request with an empty body to the `https://example.com/rest/V1/guest-carts` and stores the single string response that the endpoint returns.

#### Company Relation Example

This example creates XML data files in the _Data_ and _Metadata_ directories that allow the Functional Testing Framework to process the REST API operations for creating and deleting a company relation. This functionality is available only to Adobe Commerce B2B customers.

REST API endpoints:

- POST: `/V1/company/:parentId/relations`
- DELETE: `/V1/company/:parentId/relations/:companyId`

##### Create a company relation

The corresponding test step is:

First create two different companies of different types before creating the company relation.

```xml
<createData entity="Simple_US_Customer" stepKey="companyAdmin1"/>
<createData entity="ParentCompany" stepKey="parentCompany">
    <requiredEntity createDataKey="companyAdmin1"/>
</createData>

<createData entity="Simple_US_CA_Customer" stepKey="companyAdmin2"/>
<createData entity="ChildCompany" stepKey="childCompany">
    <requiredEntity createDataKey="companyAdmin2"/>
</createData>

<createData entity="OneCompanyRelation" stepKey="createCompanyRelation">
    <requiredEntity createDataKey="parentCompany"/>
    <requiredEntity createDataKey="childCompany"/>
</createData>
```

The Functional Testing Framework searches in the _Data_ directory for the entities with `<entity name="ParentCompany">`, `<entity name="ChildCompany">`, and `<entity name="OneCompanyRelation">` and reads the `type`.

_CompanyRelation/Data/CompanyData.xml_:

```xml
<!-- Data Type "company" -->
<entity name="ParentCompany" type="company" extends="Default_Company">
    <data key="company_name" unique="suffix">Parent Company </data>
</entity>
<!-- Data Type "company2" -->
<entity name="ChildCompany" type="company2">
    <data key="status">1</data>
    <data key="company_name" unique="suffix">Child Company </data>
    <array key="street">
        <item>7700 W Parmer Ln</item>
        <item>Bld D</item>
    </array>
    <data key="city">Culver City</data>
    <data key="country_id">US</data>
    <data key="region_id">57</data>
    <data key="postcode">90230</data>
    <data key="telephone">555-555-5555</data>
    <data key="customer_group_id">1</data>
    <data key="sales_representative_id">1</data>
    <var key="super_user_id" entityType="customer" entityKey="id"/>
    <var key="company_email" entityType="customer" entityKey="email"/>
</entity>
```

Notice that the two company entities have two different types `type="company"` and `type="company2"`.  These types are used later in _Data_ fields and _Metadata_ URLs for company relations.

_CompanyRelation/Data/CompanyRelationData.xml_:

```xml
<entity name="OneCompanyRelation" type="company_relation">
    <requiredEntity type="company_id">CompanyId</requiredEntity>
</entity>
```

- `type="company_relation"` points to the operation with `dataType=company_relation"` and `type="create"` in the _Metadata_ directory.
- `<requiredEntity type="company_id">CompanyId</requiredEntity>` points to the data entity with `name="CompanyId"` and `type="company_id"`.

_CompanyRelations/Data/CompanyIdData.xml_:

```xml
<entity name="CompanyId" type="company_id">
    <var key="company_id" entityType="company2" entityKey="id"/>
</entity>
```

- `type="company_id"` points to the operation with `dataType=company_id"` and `type="create"` in the _Metadata_ directory.
- The `company_id` retrieves only  the `id` from the company with `type="company2"`

_CompanyRelation/Metadata/CompanyIdMeta.xml_:

```xml
<operation name="CreateCompanyId" dataType="company_id" type="create">
    <field key="company_id">integer</field>
</operation>
```

`<field key="company_id">integer</field>` creates an object with a key `company_id` with a value of type integer.

```json
{
  "company_id": 1
}
```

_CompanyRelation/Metadata/CompanyRelationMeta.xml_:

```xml
<operation name="CreateCompanyRelation" dataType="company_relation" type="create" auth="adminOauth" url="/V1/company/{company.id}/relations" method="POST">
    <contentType>application/json</contentType>
    <array key="relations">
        <value>company_id</value>
    </array>
</operation>
```

As a result, the Functional Testing Framework sends a POST request with an array of `company_ids` in the body to `https://example.com/rest/V1/company/{company.id}/relations`. Currently, the Functional Testing Framework supports sending only one company as a child company for a parent.

- `{company.id}` in the URL comes from the test `<requiredEntity createDataKey="parentCompany"/>` in OneCompanyRelation that has `type="company"`
- `<array key="relations">` creates an array with the key relations
- `<value>company_id</value>` retrieves the data from the operation with `dataType="company_id"`

```json
{
  "relations": [
    {
      "company_id":  1
    }
  ]
}
```

##### Delete a company relation

The corresponding test step is:

```xml
<deleteData createDataKey="createCompanyRelation" stepKey="deleteCompanyRelation"/>
```

`createDataKey="createCompanyRelation"` is the same as the `createData` entity with `stepKey="createCompanyRelation"` in the test. This step calls the delete operation that has the same `dataType="company_relation"` value as the `createData` entity.

_CompanyRelation/Metadata/CompanyRelationMeta.xml_:

```xml
<operation name="DeleteCompanyRelation" dataType="company_relation" type="delete" auth="adminOauth" url="/V1/company/{company.id}/relations/{company2.id}" method="DELETE">
    <contentType>application/json</contentType>
</operation>
```

As a result, the Functional Testing Framework sends a DELETE request to `https://example.com/rest/V1/company/{company.id}/relations/{company2.id}`.

- `{company.id}` in the URL comes from the test `<requiredEntity createDataKey="parentCompany"/>` in the `OneCompanyRelation` entity that has `type="company"`
- `{company2.id}` in the URL comes from the test `<requiredEntity createDataKey="childCompany"/>` in the `OneCompanyRelation` entity that has `type="company2"`

### Handling a REST API response

There are cases when you need to reuse the data that Adobe Commerce or Magento Open source returned in response to your POST request.

Let's see how to handle data after you created a category with custom attributes:

```xml
<createData entity="customizedCategory" stepKey="createPreReqCategory"/>
```

The Functional Testing Framework receives the corresponding JSON response and enables you to reference its data using a variable of format:

__$__ _stepKey_ __.__ _JsonKey_ __$__

Example:

```xml
$createPreReqCategory.id$
```

And for a custom attribute:

__$__ _stepKey_  __.custom_attributes[ _attribute key_ ]__ __$__

Example:

```xml
$createPreReqCategory.custom_attributes[is_anchor]$
```

The following example of response in JSON demonstrates how to reference data on the root level and as data in custom attributes:

```json
{
    "id": 7,                                          //$createPreReqCategory.id$
    "parent_id": 2,                                   //$createPreReqCategory.parent_id$
    "name": "simpleCategory_0986576456",              //$createPreReqCategory.is_active$
    "is_active": true,
    "position": 5,
    "level": 2,
    "children": "",
    "created_at": "2018-05-08 14:27:18",
    "updated_at": "2018-05-08 14:27:18",
    "path": "1/2/7",
    "available_sort_by": [],
    "include_in_menu": true,
    "custom_attributes": [
        {
            "attribute_code": "is_anchor",
            "value": "1"                              //$createPreReqCategory.custom_attributes[is_anchor]$
        },
        {
            "attribute_code": "path",
            "value": "1/2/7"                          //$createPreReqCategory.custom_attributes[path]$
        },
        {
            "attribute_code": "children_count",
            "value": "0"
        },
        {
            "attribute_code": "url_key",
            "value": "simplecategory5af1b41cd58fb4"   //$createPreReqCategory.custom_attributes[url_key]$
        },
        {
            "attribute_code": "url_path",
            "value": "simplecategory5af1b41cd58fb4"
        }
    ],
}
}
```

## Handling entities using HTML forms

For cases when REST API is not applicable, you may use [HTML forms] (when all object parameters are encoded in a URL as `key=name` attributes).
There are two different attributes to split access to different areas:

-  `auth="adminFormKey"` is used for objects in an Admin area.
-  `auth="customerFormKey"` is used for objects in a storefront.

You are able to create assurances with `successRegex`, and, optionally, return values with `returnRegex`. You can also use `returnIndex` when `returnRegex` matches multiple values.

### Create an object in Admin

The `CreateStoreGroup` operation is used to persist a store group:

Source file is _Store/Metadata/StoreGroupMeta.xml_:

```xml
<operation name="CreateStoreGroup" dataType="group" type="create" auth="adminFormKey" url="/admin/system_store/save" method="POST" successRegex="/messages-message-success/" >
    <contentType>application/x-www-form-urlencoded</contentType>
    <object dataType="group" key="group">
        <field key="group_id">string</field>
        <field key="name">string</field>
        <field key="code">string</field>
        <field key="root_category_id">integer</field>
        <field key="website_id">integer</field>
    </object>
    <field key="store_action">string</field>
    <field key="store_type">string</field>
</operation>
```

The operation is called when `<createData>` (`type="create"`) points to a data entity of type `"group"` (`dataType="group"`).
It sends a POST request (`method="POST"`) to `http://example.com/admin/system_store/save` (`url="/admin/system_store/save"`) that is authorized for the Admin area (`auth="adminFormKey"`).
The request contains HTML form data encoded in the [application/x-www-form-urlencoded] content type (`<contentType>application/x-www-form-urlencoded</contentType>`).
If the returned HTML code contains the `messages-message-success` string, it is resolved as successful.

The operation enables you to assign the following form fields:

-  `group/group_id`
-  `group/name`
-  `group/code`
-  `group/root_category_id`
-  `group/website_id`
-  `store_action`
-  `store_type`

### Create an object in storefront

The Functional Testing Framework uses the `CreateWishlist` operation to create a wish list on storefront:

Source file is _Wishlist/Metadata/WishlistMeta.xml_

```xml
<operation name="CreateWishlist" dataType="wishlist" type="create" auth="customerFormKey" url="/wishlist/index/add/" method="POST" successRegex="" returnRegex="~\/wishlist_id\/(\d*?)\/~" >
    <contentType>application/x-www-form-urlencoded</contentType>
    <field key="product">integer</field>
    <field key="customer_email">string</field>
    <field key="customer_password">string</field>
</operation>
```

The operation is used when `<createData>` (`type="create"`) points to a data entity of type `"wishlist"` (`dataType="wishlist"`).
It sends a POST request (`method="POST"`) to `http://example.com/wishlist/index/add/` (`url="wishlist/index/add/"`) as a customer (`auth="customerFormKey"`).
The request contains HTML form data encoded in the [application/x-www-form-urlencoded] content type (`<contentType>application/x-www-form-urlencoded</contentType>`).
If the returned HTML code contains a string that matches the regular expression `~\/wishlist_id\/(\d*?)\/~`, it returns the matching value.

The operation assigns three form fields:

-  `product`
-  `customer_email`
-  `customer_password`

## Reference

### operations

Root element that points to the corresponding XML Schema.

### operation

| Attribute       | Type                                                                         | Use      | Description                                                                                                                                  |
|-----------------|------------------------------------------------------------------------------|----------|----------------------------------------------------------------------------------------------------------------------------------------------|
| `name`          | string                                                                       | optional | Name of the operation.                                                                                                                       |
| `dataType`      | string                                                                       | required | Data type of the operation. It refers to a `type` attribute of data entity that will be used as a source of input data.                      |
| `type`          | Possible values: `create`, `delete`, `update`, `get`.                        | required | Type of operation.                                                                                                                           |
| \*`url`         | string                                                                       | optional | A routing URL of the operation. Example value: `"/V1/categories"`.                                                                           |
| \*\*`auth`      | Possible values: `adminOath`, `adminFormKey`, `customerFormKey`, `anonymous` | optional | Type of authorization of the operation.                                                                                                      |
| `method`        | string                                                                       | optional | HTTP method of the operation. Possible values: `POST`, `DELETE`, `PUT`, `GET`.                                                               |
| `successRegex`  | string                                                                       | optional | Determines if the operation was successful. Parses the HTML body in response and asserts if the value assigned to the `successRegex` exists. |
| `returnRegex`   | string                                                                       | optional | Determines if the response contains the matching value to return.                                                                            |
| `returnIndex`   | string                                                                       | optional | Specifies index at which the value will be returned when `returnRegex` matches multiple values                                                                          |
| `removeBackend` | boolean                                                                      | optional | Removes backend name from requested URL. Applicable when `auth="adminFormKey"`.                                                              |
| `filename`      | string                                                                       | optional |                                                                                                                                              |
|`deprecated`|string|optional|Used to warn about the future deprecation of the test. String will appear in Allure reports and console output at runtime.|

-  \*`url` - full URL is a concatenation of _ENV.baseUrl_ + `/rest/` + _URL_.
  To reuse data of a required entity or returned response use a field key wrapped in curly braces such as `{sku}`.
  When the data to reuse is of a different type, declare also the type of data such as `{product.sku}`.
  Example: `"/V1/products/{product.sku}/media/{id}"`.

-  \*\*`auth` - available values:

   -  `adminOath` is used for REST API persistence in the Admin area with [OAuth-based authentication][oauth].
   -  `adminFormKey` is used for HTML form persistence in the Admin area.
   -  `customerFormKey` is used for HTML form persistence in the Customer area.
   -  `anonymous` is used for REST API persistence without authorization.

### contentType

Sets one of the following operation types:

-  `application/json` is used for REST API operations.
-  `application/x-www-form-urlencoded` is used for HTML form operations.

### object

Representation of a complex entity that may contain fields, arrays, and objects.
An object must match the [entity] of the same `type`.

| Attribute  | Type    | Use      | Description                                                                                    |
| ---------- | ------- | -------- | ---------------------------------------------------------------------------------------------- |
| `key`      | string  | optional | Name of the object.                                                                            |
| `dataType` | string  | required | Type of the related [entity].                                                                  |
| `required` | boolean | optional | Determines if the object is required or not. It must match the REST API specification. |

### field

Representation of HTML form or REST API fields.

| Attribute  | Type    | Use      | Description                                                                                   |
| ---------- | ------- | -------- | --------------------------------------------------------------------------------------------- |
| `key`      | string  | required | Name of the field. It must match the field name of the related [entity].                      |
| `type`     | string  | optional | Type of the value. It may contain a primitive type or the type of another operation.          |
| `required` | boolean | optional | Determines if the field is required or not. It must match the REST API specification. |

### array

Representation of an array.

| Attribute | Type   | Use      | Description        |
| --------- | ------ | -------- | ------------------ |
| `key`     | string | required | Name of the array. |

It contains one or more `value` elements.

### value

Declares a data type for items within `<array>`.

#### Example of an array with value of a primitive data type

Metadata declaration of the operation schema:

```xml
<array key="tax_rate_ids">
    <value>integer</value>
</array>
```

The value can contain one or more items.

Data entity with the corresponding assignment:

```xml
<array key="tax_rate_ids">
    <item>1</item>
    <item>2</item>
</array>
```

-  Resulted JSON request:

```json
"tax_rate_ids":
    [
        "item": 1,
        "item": 2
    ]
```

#### Example of an array containing data entities

```xml
<array key="product_options">
    <value>product_option</value>
</array>
```

The value declares the `product_options` array that contains one or more entities of the `product_option` data type.

#### Example of an array containing a particular data field

```xml
<array key="tax_rate_ids">
    <value>tax_rate.id</value>
</array>
```

The value declares the `tax_rate_ids` array that contains one or more `id` fields of the `tax_rate` data type entity.

### header

An additional parameter in REST API request.

| Attribute | Type   | Use      | Description                  |
| --------- | ------ | -------- | ---------------------------- |
| `param`   | string | required | A REST API header parameter. |

```xml
<header param="status">available</header>
```

### param

An additional parameter in URL.

| Attribute | Type   | Use      | Description                |
| --------- | ------ | -------- | -------------------------- |
| `key`     | string | required | Name of the URL parameter. |

Example:

```xml
<param key="status">someValue</param>
```

<!-- LINK DEFINITIONS -->

[actions]: test/actions.md
[api reference]: https://developer.adobe.com/commerce/webapi/get-started/
[application/x-www-form-urlencoded]: https://www.w3.org/TR/html401/interact/forms.html#h-17.13.4.1
[catalogCategoryRepositoryV1 image]: ../_images/functional-testing/catalogCategoryRepository-operations.png
[createData]: test/actions.md#createdata
[deleteData]: test/actions.md#deletedata
[entity]: data.md#entity
[getData]: test/actions.md#getdata
[HTML forms]: https://www.w3.org/TR/html401/interact/forms.html
[oauth]: https://developer.adobe.com/commerce/webapi/get-started/authentication/gs-authentication-oauth/
[updateData]: test/actions.md#updatedata
