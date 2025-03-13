const rpgleDS = require('./index');

function assert(name, expression, expect) {
  if (expression === expect) {
    console.log(`${name}: pass - ${expression}`);
  } else {
    console.error(`${name}: fail - ${expression} !== ${expect}`);
    process.exit(1);
  }
}

let definition;
let buffer;
let result;

definition = new rpgleDS(
  [{
      "name": "name",
      "length": 10
    },
    {
      "name": "number",
      "length": 5,
      "decimals": 2
    },
    {
      "name": "abool",
      "length": 1
    }
  ]
);

buffer = definition.toBuffer({
  name: 'helloworld',
  number: 12.34,
  abool: true
});

assert(`simple buffer`, buffer, `helloworld012341`);

result = definition.fromBuffer(buffer);

assert(`simple buffer deconstruct (1)`, result.name, `helloworld`);
assert(`simple buffer deconstruct (2)`, result.number, 12.34);
assert(`simple buffer deconstruct (3)`, result.abool, true);

definition = new rpgleDS(
  [{
      "name": "name",
      "length": 10
    },
    {
      "name": "number",
      "length": 5,
      "decimals": 2
    },
    {
      "name": "abool",
      "length": 1
    },
    {
      "name": "subf",
      "type": [
        {
          "name": "subfA",
          "length": 1
        },
        {
          "name": "subfB",
          "length": 4
        },
        {
          "name": "subfC",
          "length": 5,
          "decimals": 2
        },
      ]
    }
  ]
);

buffer = definition.toBuffer({
  name: 'helloworld',
  abool: false,
  subf: {
    subfA: true,
    subfC: 3.12,
  }
});

assert(`subf buffer with blank fields`, buffer, `helloworld0000001    00312`);

result = definition.fromBuffer(buffer);

assert(`subf check`, result.abool, false);
assert(`blank subf check`, result.subf.subfA, true);
assert(`blank subf check`, result.subf.subfB, ``);

buffer = definition.toBuffer({
  name: 'helloworld',
  number: 12.34,
  abool: false,
  subf: {
    subfA: true,
    subfB: 'abcd',
    subfC: 3.12
  }
});

assert(`subf buffer`, buffer, `helloworld0123401abcd00312`);

definition = new rpgleDS(
  [{
      "name": "name",
      "length": 10
    },
    {
      "name": "number",
      "length": 5,
      "decimals": 2
    },
    {
      "name": "abool",
      "length": 1
    },
    {
      "name": "subf",
      "dim": 4,
      "type": [{
          "name": "subfA",
          "length": 4
        },
        {
          "name": "subfB",
          "length": 5,
          "decimals": 2
        },
        {
          "name": "subfC",
          "length": 1
        }
      ]
    }
  ]
);

buffer = definition.toBuffer({
  name: 'helloworld',
  number: 12.34,
  abool: false,
  subf: [
    {
      subfA: 'abcd',
      subfB: 3.12,
      subfC: false
    },
    {
      subfA: 'efgh',
      subfB: 4.99,
      subfC: true
    },
  ]
});

assert(`subf array buffer`, buffer, `helloworld012340abcd003120efgh004991    00000     00000 `);

result = definition.fromBuffer(buffer);

//Since it doesn't include array items where the first prop is blank
assert('subf array length', result.subf.length, 2);

assert('subf array prop', result.subf[1].subfA, `efgh`);