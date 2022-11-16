# _⚠️ MOVED TO [OpenFn/adaptors](https://github.com/OpenFn/adaptors)! ⚠️_

**N.B.: New versions are available at:
https://github.com/OpenFn/adaptors/tree/main/packages/Vtiger**

# Language Vtiger (Archived)
=============

Language Pack for building expressions and operations to make calls to the Vtiger API.

Documentation
-------------

#### sample configuration

```json
{
  "hostUrl": "https://openfunction.od2.vtiger.com",
  "username": "taylor@openfn.org",
  "accessToken": "blahBlahBlah"
}
```

#### sample listTypes expression
```js
listTypes();
```

#### sample postElement expression
```js
postElement({
  operation: "create"
  elementType: "leads",
  element: {
    "name": dataValue("name")(state),
    "surname": dataValue("surname")(state),
    "email": dataValue("email")(state)
  }
});

```

[Docs](docs/index)


Development
-----------

Clone the repo, run `npm install`.

Run tests using `npm run test` or `npm run test:watch`

Build the project using `make`.
