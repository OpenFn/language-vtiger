Language Vtiger [![Build Status](https://travis-ci.org/OpenFn/language-vtiger.svg?branch=master)](https://travis-ci.org/OpenFn/language-vtiger)
=============

Language Pack for building expressions and operations to make calls to the Vtiger API.

Documentation
-------------

#### sample configuration
```js
{
  "configuration": {
    "hostUrl": "https://openfunction.od2.vtiger.com",
    "username": "taylor@openfn.org",
    "accessToken": "4VRSjLYUZsc4Bqvh"
  }
}
```

#### sample createEntity expression
```js
createEntity({
  entityName: "accounts",
  body: {
        "name": "Open Function",
        "creditonhold": false,
        "address1_latitude": 47.639583,
        "description": "This is the description of the sample account",
        "revenue": 5000000,
        "accountcategorycode": 1
  }
});
```

#### sample query expression
*Can be used to retrieve or query a specific Entity if an entityId is declared in the expression. Otherwise it will perform a query on all data with the defined Entity Name*
```js
query({
  entityName: "contacts",
  entityId: "51a0e5b9-88df-e311-b8e5-6c3be5a8b200",
  query: {
    fields: [
      'fullname',
      'birthdate'
    ],
   limit: 10,
    orderBy: {
      field: 'lastname',
      direction: 'asc'
    },
    filter: 'firstname eq \'Cat\''
  }
});
```

#### sample update expression
```js
updateEntity({
  entityName: "accounts",
  entityId: "f4301865-c64a-e711-80f3-e0071b6fd061",
  body: {
        "name": "wilder 2",
        "creditonhold": true,
        "address1_latitude": 47.639583,
        "description": "This is the description of the sample account",
        "revenue": 5000000,
        "accountcategorycode": 1
  }
});
```

#### sample delete expression
```js
deleteEntity({
  entityName: "accounts",
  entityId: "aeef941b-254a-e711-80f1-e0071b685921"
});
```

[Docs](docs/index)


Development
-----------

Clone the repo, run `npm install`.

Run tests using `npm run test` or `npm run test:watch`

Build the project using `make`.
