import { ILEBuffer } from "../ileBuffer";
import { ProcedureCallInfo } from "../types";

export function generateSqlCreate(callTo: ProcedureCallInfo) {
  let inSize = ILEBuffer.determineSize(callTo.bufferIn);
  let outSize = ILEBuffer.determineSize(callTo.bufferOut);
  const lines = [
    `create or replace procedure ${callTo.procedureLibrary}.${callTo.procedureName} (`,
    `  IN inBuffer CHAR(${inSize}),`,
    `  OUT outBuffer CHAR(${outSize})`,
    `)`,
    `LANGUAGE RPGLE`, // TODO: maybe it's not RPGLE?
    `EXTERNAL NAME ${callTo.programLibrary}/${callTo.procedureName} GENERAL;`,
  ]

  return lines.join(`\n`);
}