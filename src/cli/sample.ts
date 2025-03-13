import { LGFile } from "../types";

export const SAMPLE_LG_FILE: LGFile = {
  generateCaller: true,
  generateTypes: true,
  generateSql: false,
  generateRpgle: false,
  callers: [
    {
      programName: `ABCD`,
      programLibrary: `LIB`,
      procedureName: `test`,
      procedureLibrary: `LIB`,
      bufferIn: [
        { name: `name`, length: 10 },
        { name: `coolness`, length: 10, decimals: 0 }
      ],
      bufferOut: [
        { name: `name`, length: 10 },
        { name: `coolness`, length: 10, decimals: 0 },
        { name: `result`, length: 10 }
      ],
    }
  ]
}