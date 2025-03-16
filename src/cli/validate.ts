//TODO: replace with json schema

import { CallInfo, ILEPrimitive, LGFile, ProcedureCallInfo, ProgramCallInfo } from "../types";

export function validateLGFile(obj: Partial<LGFile>) {
  if (typeof obj !== 'object' || obj === null) {
    throw new Error(`Invalid input: Expected an object, but received ${typeof obj}`);
  }

  if (obj.generateIn && typeof obj.generateIn !== 'string') {
    throw new Error(`Invalid input: 'generateIn' should be a string`);
  }

  if (!Array.isArray(obj.callers)) {
    throw new Error(`Invalid input: 'callers' should be an array`);
  }

  for (const caller of obj.callers) {
    validateCallInfo(caller);
  }

  const optionalBooleans = ['generateCaller', 'generateTypes', 'generateSql', 'generateRpgle'];

  for (const key of optionalBooleans) {
    if (key in obj && typeof obj[key] !== 'boolean') {
      throw new Error(`Invalid input: '${key}' should be a boolean`);
    }
  }

  return true;
}


const baseRequirements: (keyof ProgramCallInfo)[] = ['niceName', 'programName', 'bufferIn'];
const requiredProcedureFields: (keyof ProcedureCallInfo)[] = [`bufferOut`];
const requiredProgramFields: (keyof ProgramCallInfo)[] = ['rowOut'];

function validateCallInfo(obj: Partial<CallInfo>) {
  if (typeof obj !== 'object' || obj === null) {
    throw new Error(`Invalid input: Expected an object, but received ${typeof obj}`);
  }

  const isProgram = ('rowOut' in obj);

  const requiredFields = isProgram ? [...baseRequirements, ...requiredProgramFields] : [...baseRequirements, ...requiredProcedureFields];
  const bannedFields = isProgram ? requiredProcedureFields : requiredProgramFields;

  for (const field of requiredFields) {
    if (!(field in obj)) {
      throw new Error(`Missing required field: '${field}'`);
    }
  }

  for (const field of bannedFields) {
    if (field in obj) {
      throw new Error(`Invalid input: '${field}' should not be present. This is a ${isProgram ? 'program' : 'procedure'} call.`);
    }
  }

  if (!Array.isArray(obj.bufferIn)) {
    throw new Error(`Invalid input: 'bufferIn' should be an array`);
  }

  for (const item of obj.bufferIn) {
    validateIlePrimitive(`${obj.programName}.${item.name}`, item)
  }


  if (isProgram && `rowOut` in obj) {
    if (!Array.isArray(obj.rowOut)) {
      throw new Error(`Invalid input: 'rowOut' should be an array`);
    }

    for (const item of obj.rowOut) {
      if (`like` in item) {
        throw new Error(`Invalid input: 'like' should not be present in 'rowOut' for ${obj.programName}. Rows can only have primitive types.`);  
      }

      validateIlePrimitive(`${obj.programName}.${item.name}`, item)
    }

  } else if ('bufferOut' in obj ) {
    if (!Array.isArray(obj.bufferOut)) {
      throw new Error(`Invalid input: 'bufferOut' should be an array`);
    }

    for (const item of obj.bufferOut) {
      validateIlePrimitive(`${obj.programName}.${item.name}`, item)
    }
  }

  return true;
}

function validateIlePrimitive(refName: string, typedef: Partial<ILEPrimitive>) {
  if (typeof typedef !== 'object' || typedef === null) {
    throw new Error(`Invalid input: Expected an object, but received ${typeof typedef} for ${refName}`);
  }

  if (!('name' in typedef)) {
    throw new Error(`${refName}: missing required field: 'name'`);
  }

  const hasLike = 'like' in typedef;

  if (hasLike) {
    if (!Array.isArray(typedef.like)) {
      throw new Error(`${refName}: 'like' should be an array`);
    }
    for (const item of typedef.like) {
      validateIlePrimitive(`${refName}.${typedef.name}`, item);
    }

    if (typeof typedef.dim !== 'undefined' && typeof typedef.dim !== 'number') {
      throw new Error(`${refName}: 'dim' should be a number`);
    }

    if ('length' in typedef) {
      throw new Error(`${refName}: 'length' is not valid with 'like' field`);
    }

    if ('decimals' in typedef) {
      throw new Error(`${refName}: 'decimals' is not valid with 'like' field`);
    }

  } else {
    if (!('length' in typedef)) {
      throw new Error(`${refName}: missing required field: 'length'`);
    }

    if (typeof typedef.length !== 'number') {
      throw new Error(`${refName}: 'length' should be a number`);
    }

    if ('decimals' in typedef && typeof typedef.decimals !== 'number') {
      throw new Error(`${refName}: 'decimals' should be a number`);
    }

    if ('like' in typedef) {
      throw new Error(`${refName}: 'like' is not valid with 'length' field or 'decimals' field`);
    }

    if ('dim' in typedef) {
      throw new Error(`${refName}: 'dim' is not valid without 'like' field`);
    }
  }
}