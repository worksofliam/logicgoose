# logicgoose

A simple class that will construct and deconstruct buffers (which is actually just a single) to be passed into an ILE program. This is particularly useful when it comes to working with data structures.

Don't fancy writing all this code manually? [Check out this nifty tool to do it for you](https://node-rpgle-api.herokuapp.com/)!

## Example

```js
const inputDS = new rpgleDS(...);
const responseDS = new rpgleDS(...);

static async getHistoryHeader(header) {
  console.log(inputDS.getSize());
  console.log(responseDS.getSize());

  const inBuffer = inputDS.toBuffer(header);

  const results = await db2.callProcedure(SCHEMA, 'PROGRAM', [inBuffer, undefined]);

  return responseDS.fromBuffer(results.parameters[1]);
}
```

## JS Types and ILE Types

| JS Type | ILE Type |
|-|-|
| String | Char |
| Number | Zoned |
| Boolean | Char(1) / Ind |

### Simple types example

```json
{
  "name": "25",
  "number": 25
}
```

```js
const base = new rpgleDS(
[
    {
        "name": "name",
        "length": 25
    },
    {
        "name": "number",
        "length": 11,
        "decimals": 2
    }
]
);
```

```rpgle
Dcl-Ds base Qualified Template;
  name Char(25);
  number Zoned(11:2);
End-Ds;
```

## Many dimentions

The class can easily handle many levels of structs (`likeds(x) qualified`).

```json
{
  "name": "25",
  "number": 25,
  "substructA": {
    "a": "10",
    "b": 10
  }
}
```

```js
const substructA = new rpgleDS(
[
    {
        "name": "a",
        "length": 10
    },
    {
        "name": "b",
        "length": 11,
        "decimals": 2
    }
]
);

const base = new rpgleDS(
[
    {
        "name": "name",
        "length": 25
    },
    {
        "name": "number",
        "length": 11,
        "decimals": 2
    },
    {
        "name": "substructA",
        "like": substructA
    }
]
);
```

```rpgle
Dcl-Ds substructA Qualified Template;
  a Char(10);
  b Zoned(11:2);
End-Ds;

Dcl-Ds base Qualified Template;
  name Char(25);
  number Zoned(11:2);
  substructA LikeDS(substructA);
End-Ds;
```

## Struct arrays

We also support substructs that are arrays.

```json
{
  "name": "25",
  "number": 25,
  "substructA": [{
    "a": "10",
    "b": 10
  }]
}
```

```js
const substructA = new rpgleDS(
[
    {
        "name": "a",
        "length": 10
    },
    {
        "name": "b",
        "length": 11,
        "decimals": 2
    }
]
);

const base = new rpgleDS(
[
    {
        "name": "name",
        "length": 25
    },
    {
        "name": "number",
        "length": 11,
        "decimals": 2
    },
    {
        "name": "substructA",
        "like": substructA,
        "dim": 5
    }
]
);
```

```rpgle
Dcl-Ds substructA Qualified Template;
  a Char(10);
  b Zoned(11:2);
End-Ds;

Dcl-Ds base Qualified Template;
  name Char(25);
  number Zoned(11:2);
  substructA LikeDS(substructA) Dim(5);
End-Ds;
```