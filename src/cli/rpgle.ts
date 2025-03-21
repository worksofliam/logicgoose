import { CallInfo, ILEPrimitive, PrimitiveStruct, ProcedureCallInfo } from "../types";

export function generateRpgleFor(caller: CallInfo) {
  const lines: string[] = [
    `**free`,
    ``,
    `// This file is generated by logicgoose.`,
    `// Generated at ${new Date().toISOString()}`,
    `// Source: logicgoose.json`,
    ``,
  ];

  const hasResultSet = `rowOut` in caller && caller.rowOut;

  const inputStructName = `inputDs`;
  const outputStructName = `outputDs`;
  const resultSetName = `resultSet`;

  const inputDsLines = generateStructsFor(inputStructName, caller.bufferIn);
  lines.push(...inputDsLines);

  if (!hasResultSet && `bufferOut` in caller) {
    const outputDsLines = generateStructsFor(outputStructName, caller.bufferOut);
    lines.push(...outputDsLines);
  }

  lines.push(``);

  lines.push(`dcl-pi ${caller.programName};`);
  lines.push(`  input likeds(${inputStructName});`);

  if (!hasResultSet) {
    lines.push(`  output likeds(${outputStructName});`);
  }

  lines.push(`end-pi;`, ``);

  if (hasResultSet && caller.rowOut) {
    const resultSetLines = generateStructsFor(resultSetName, caller.rowOut, true);
    lines.push(
      ...resultSetLines,
      `dcl-s resultCount int(10) inz(0);`, 
      ``
    );
  }

  lines.push(`// Your logic goes here.`, ``);

  if (hasResultSet) {
    lines.push(`exec sql set result sets array :${resultSetName} for :resultCount rows;`, ``);
  }

  lines.push(`return;`);

  return lines.join(`\n`);
}

export function generateStructsFor(name: string, items: PrimitiveStruct, isProgram?: boolean) {
  let preLines: string[] = [];
  let lines: string[] = [];

  if (isProgram) {
    lines.push(`dcl-ds ${name} qualified dim(50);`);
  } else {
    lines.push(`dcl-ds ${name} qualified template;`);
  }

  for (const item of items) {
    const type = getRpgleType(item);
    lines.push(`  ${item.name} ${type};`);

    if ('like' in item) {
      const subType = generateStructsFor(item.name, item.like);
      preLines.push(...subType);
    }
  }

  lines.push(`end-ds;`, ``);

  return [...preLines, ...lines];
}

function getRpgleType(prim: ILEPrimitive) {
  if ('like' in prim) {
    if ('dim' in prim) {
      return `likeds(${prim.name}) dim(${prim.dim})`;
    } else {
      return `likeds(${prim.name})`;
    }
  } else if ('length' in prim) {
    if ('decimals' in prim) {
      return `zoned(${prim.length}:${prim.decimals})`;
    } else {
      if (prim.length === 1) {
        return `ind`
      } else {
        return `char(${prim.length})`;
      }
    }
  }

  return `never`;
}