import { CallInfo, ILEPrimitive, PrimitiveStruct, ProcedureCallInfo } from "../types";

export function generateTypesForCaller(caller: CallInfo) {
  let lines: string[] = [];

  const name = caller.niceName;

  lines.push(...generateTypesFor(`${name}In`, caller.bufferIn));

  if (`bufferOut` in caller) {
    lines.push(...generateTypesFor(`${name}Out`, caller.bufferOut));
  }

  if (`rowOut` in caller && caller.rowOut) {
    lines.push(...generateTypesFor(`${name}Out`, caller.rowOut));
  }

  return lines.join(`\n`);
}

export function generateTypesFor(name: string, items: PrimitiveStruct) {
  let preLines: string[] = [];
  let lines: string[] = [];

  lines.push(`export interface ${name} {`);

  for (const item of items) {
    const type = getPrimitiveType(item);

    if ('like' in item) {
      let subTypeName = `${name}_${item.name}`;
      const subType = generateTypesFor(subTypeName, item.like);
      preLines.push(...subType);
      lines.push(`  ${item.name}: ${subTypeName};`);
      
    } else {
      lines.push(`  ${item.name}: ${type};`);
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
      return `${prim.name}`;
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