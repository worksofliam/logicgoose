interface ILEParameter {
  /** Type of parameter. Use value from `Types` object. */
  type: string;
  size?: number;
  precision?: number;
  value: any;
}