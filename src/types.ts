
export type CallInfo = ProgramCallInfo|ProcedureCallInfo;

export interface ProgramCallInfo {
  niceName: string;
  programName: string;
  bufferIn: ILEPrimitive[];
  rowOut?: ILEPrimitive[];
}

export interface ProcedureCallInfo extends ProgramCallInfo {
  bufferIn: ILEPrimitive[];
  bufferOut: ILEPrimitive[];
  rowOut?: never;
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
  callers?: CallInfo[];
  generateCaller?: boolean;
  generateTypes?: boolean;
  generateSql?: boolean;
  generateRpgle?: boolean;
}