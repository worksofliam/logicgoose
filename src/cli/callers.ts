import { CallInfo } from "../types";

export function generateCallersFor(callers: CallInfo[]) {
  const lines: string[] = [
    `// This file is generated by logicgoose. Do not edit manually.`,
    `// Generated at ${new Date().toISOString()}`,
    `// Source: logicgoose.json`,
  ];

  lines.push(`import * as Types from "./types";`);
  lines.push(`import { LogicGoose } from "logicgoose";`, ``);

  for (const caller of callers) {
    const name = caller.niceName;
    const isProgram = `rowOut` in caller;

    if (isProgram) {
      lines.push(`export type ${caller.niceName}Call = (input: Types.${name}In) => Promise<Types.${name}Out[]>;`);
    } else {
      lines.push(`export type ${caller.niceName}Call = (input: Types.${name}In) => Promise<Types.${name}Out>;`);
    }
  }
  
  lines.push(``, `export interface SystemCalls {`);
  for (const caller of callers) {
    const name = caller.niceName;
    lines.push(`  ${name}: ${name}Call,`);
  }
  lines.push(`}`, ``);

  lines.push(
    `export function setupLgCallers(lg: LogicGoose): SystemCalls {`,
    `  return {`,
  );
  for (const caller of callers) {
    lines.push(`    ${caller.niceName}: lg.getCaller(${JSON.stringify(caller)}),`);
  }
  lines.push(`  } as SystemCalls;`, ``);

  lines.push(`}`);

  return lines.join(`\n`);
}