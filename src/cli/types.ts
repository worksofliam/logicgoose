import { ILEPrimitive, PrimitiveStruct, ProcedureCallInfo } from "../types";

export function generateTypesForCaller(caller: ProcedureCallInfo) {
  let lines: string[] = [];

  const name = caller.procedureName.toLowerCase();

  lines.push(...generateTypesFor(`${name}In`, caller.bufferIn));
  lines.push(...generateTypesFor(`${name}Out`, caller.bufferOut));

  return lines.join(`\n`);
}

export function generateTypesFor(name: string, items: PrimitiveStruct) {
  let preLines: string[] = [];
  let lines: string[] = [];

  lines.push(`export interface ${name} {`);

  for (const item of items) {
    const type = getPrimitiveType(item);
    lines.push(`  ${item.name}: ${type};`);

    if ('like' in item) {
      const subType = generateTypesFor(item.name, item.like);
      preLines.push(...subType);
    }
  }

  lines.push(`}`, ``);

  return [...preLines, ...lines];
}

function getPrimitiveType(prim: ILEPrimitive) {
  if ('like' in prim) {
    if ('dim' in prim) {
      return `${prim.name}[]`;
    } else {
      return `${prim.name};`;
    }
  } else if ('length' in prim) {
    if ('decimals' in prim) {
      return `number`;
    } else {
      return `string`;
    }
  }

  return `never`;
}