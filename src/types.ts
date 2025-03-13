
export interface ProcedureCallInfo {
  programName: string;
  programLibrary: string;
  bufferIn: ILEPrimitive[];
  bufferOut: ILEPrimitive[];
  procedureName: string;
  procedureLibrary: string;
}

export type PrimitiveStruct = ILEPrimitive[];

export type ILEPrimitive = ILEStructBase|ILECharacter|ILEZoned|ILEStruct;

export interface ILEStructBase {
  name: string;
}

export interface ILECharacter extends ILEStructBase {
  length: number
}

export interface ILEZoned extends ILECharacter {
  decimals: number
}

export interface ILEStruct extends ILEStructBase {
  like: ILEPrimitive[];
  dim?: number;
}

export interface LGFile {
  generateIn?: string;
  callers?: ProcedureCallInfo[];
  generateCaller?: boolean;
  generateTypes?: boolean;
  generateSql?: boolean;
  generateRpgle?: boolean;
}