import { LGFile } from "../types";

export const SAMPLE_LG_FILE: LGFile = {
  generateIn: "src",
  generateCaller: true,
  generateTypes: true,
  generateSql: true,
  generateRpgle: true,
  callers: [
    {
      programName: `ROWS`,
      niceName: `coolRows`,
      bufferIn: [
        { name: `id`, length: 10, decimals: 0 },
      ],
      rowOut: [
        { name: `id`, length: 10, decimals: 0 },
        { name: `name`, length: 10 },
        { name: `coolness`, length: 10, decimals: 0 }
      ]
    },
    {
      programName: `SIMPLE`,
      niceName: `simple`,
      bufferIn: [
        { name: `name`, length: 10 },
        { name: `coolness`, length: 10, decimals: 0 }
      ],
      bufferOut: [
        { name: `name`, length: 10 },
        { name: `coolness`, length: 10, decimals: 0 },
        { name: `result`, length: 10 }
      ],
    },
    {
      programName: `BOOLEAN`,
      niceName: `boolean`,
      bufferIn: [
        {
          name: "name",
          length: 10
        },
        {
          name: "number",
          length: 5,
          decimals: 2
        },
        {
          name: "abool",
          length: 1
        }
      ],
      bufferOut: [
        { name: `name`, length: 10 },
        { name: `coolness`, length: 10, decimals: 0 },
        { name: `resbool`, length: 1 }
      ],
    },
    {
      programName: `STRUCT`,
      niceName: `struct`,
      bufferIn: [
        {
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
          "like": [
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
      ],
      bufferOut: [
        {
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
          "like": [
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
    },
    {
      programName: `ARRAY`,
      niceName: `array`,
      bufferIn: [
        { name: `customerId`, length: 10, decimals: 0}
      ],
      bufferOut: [
        { name: `customerId`, length: 10, decimals: 0},
        {
          name: "orders",
          like: [
            { name: "id", length: 10, decimals: 0 },
            { name: "easyName", length: 50 },
          ],
          dim: 100
        }
      ]
    }
  ]
}