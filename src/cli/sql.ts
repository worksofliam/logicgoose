import { ILEBuffer } from "../ileBuffer";
import { ProcedureCallInfo } from "../types";

export function generateSqlCreate(callTo: ProcedureCallInfo) {
  let inSize = ILEBuffer.determineSize(callTo.bufferIn);
  let outSize = ILEBuffer.determineSize(callTo.bufferOut);
  const lines = [
    `create or replace procedure ${callTo.niceName} (`,
    `  IN inBuffer CHAR(${inSize}),`,
    `  OUT outBuffer CHAR(${outSize})`,
    `)`,
    `LANGUAGE RPGLE`, // TODO: maybe it's not RPGLE?
    `EXTERNAL NAME ${callTo.programName.toUpperCase()} GENERAL;`,
  ]

  return lines.join(`\n`);
}