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

      const sql = `call ${procedure.procedureLibrary}.${procedure.procedureName} (?, ?)`;

      const result = await this.config.executor(sql, [inBuff, '']);

      if (result) {
        const outObject = ILEBuffer.fromBuffer(output, result);

        return outObject;
      } else {
        throw new Error(`Procedure ${procedure.procedureName} failed to execute.`);
      }
    }

    return caller;
  }
}