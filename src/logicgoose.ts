import { ILEBuffer } from "./ileBuffer";
import { CallInfo, ProcedureCallInfo } from "./types";

export type StatementExecutor = (sql: string, parameters: string[], paramsOnly: boolean) => Promise<unknown[]|undefined>;
type CallerResult = (inputObject: any) => Promise<any>;

export interface LGSettings {
  schema: string;
  executor: StatementExecutor;
}

export class LogicGoose {
  constructor(private config: LGSettings) {}

  getCaller(callTo: CallInfo): CallerResult {
    const input = callTo.bufferIn;
    const isProgram = `rowOut` in callTo;

    // Use StrictInputType instead of InputType
    const caller: CallerResult = async (inputObject: any): Promise<any> => {
      const inBuff = ILEBuffer.toBuffer(input, inputObject);
      
      // TODO: call procedure

      let sql: string;
      let result: any[]|undefined;

      if (isProgram) {
        sql = `call ${this.config.schema}.${callTo.programName.toUpperCase()}('${inBuff}')`;
        result = await this.config.executor(sql, [], false);
      } else {
        sql = `call ${this.config.schema}.${callTo.niceName}(?, ?)`;
        result = await this.config.executor(sql, [inBuff, ''], true);
      }

      if (result) {
        if (isProgram && callTo.rowOut) {
          const fixedRows: any[] = [];

          // Because the columns always come back as uppercase, let's fix them
          for (const row of result) {
            const newRow = {};

            for (const column of callTo.rowOut) {
              newRow[column.name] = row[column.name.toUpperCase()];
            }

            fixedRows.push(newRow);
          }

          return fixedRows;

        } else if (`bufferOut` in callTo) {
          if (result.length === 2 && typeof result[1] === 'string') {
            const outObject = ILEBuffer.fromBuffer(callTo.bufferOut, result[1] as string);

            return outObject;
          } else {
            throw new Error(`Procedure ${callTo.niceName} returned unexpected result. Expected two string columns in the result set, got length of ${result.length} and type ${typeof result[1]} for second parameter.`);
          }
        }

      } else {
        throw new Error(`Procedure ${callTo.niceName} failed to execute.`);
      }
    }

    return caller;
  }
}