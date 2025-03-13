import { ILEBuffer } from "./ileBuffer";
import { ProcedureCallInfo } from "./types";

export type StatementExecutor = (sql: string, parameters: string[]) => Promise<string|undefined>;

export interface LGSettings {
  executor: StatementExecutor;
}

export class LogicGoose {
  constructor(private config: LGSettings) {}

  getCaller(procedure: ProcedureCallInfo) {
    const input = procedure.bufferIn;
    const output = procedure.bufferOut;

    // Use StrictInputType instead of InputType
    const caller = async (inputObject: any): Promise<any> => {
      const inBuff = ILEBuffer.toBuffer(input, inputObject);
      
      // TODO: call procedure

      const sql = `call ${procedure.procedureLibrary}.${procedure.procedureName} (${inBuff})`;

      const result = await this.config.executor(sql, [inBuff]);

      if (result) {
        const outObject = ILEBuffer.fromBuffer(output, result);

        return outObject;
      } else {
        throw new Error(`Procedure ${procedure.procedureName} failed to execute.`);
      }
    }

    return caller;
  }

  private static generateSqlCreate(callTo: ProcedureCallInfo) {
    let inSize = ILEBuffer.determineSize(callTo.bufferIn);
    let outSize = ILEBuffer.determineSize(callTo.bufferOut);
    const lines = [
      `create or replace procedure ${callTo.procedureLibrary}.${callTo.procedureName} (`,
      `  IN inBuffer CHAR(${inSize}),`,
      `  OUT outBuffer CHAR(${outSize})`,
      `)`,
      `LANGUAGE RPGLE`, // TODO: maybe it's not RPGLE?
      `EXTERNAL NAME LIB.PROGRAM GENERAL;`
    ]

    return lines.join(`\n`);
  }
}

const test: ProcedureCallInfo = {
  programName: `abc`,
  programLibrary: `lib`,
  procedureName: `test`,
  procedureLibrary: `lib`,
  bufferIn: [
    { name: `a`, length: 1 },
    { name: `b`, length: 1 },
    { name: `c`, length: 1 }
  ],
  bufferOut: [
    { name: `d`, length: 1 }
  ]
};