var options = {
  executeStatement: async function(statement, parameters) {},
}

class Program {
  constructor(library, name) {
    /** @type string Library which the program resides. */
    this.library = library;
    /** @type string Name of the program. */
    this.name = name;

    /** @type ILEParameter[] List of parameters for the program */
    this.parameters = [];
  }

  /**
   * @param {ILEParameter} parameter 
   */
  addParameter(parameter) {

    switch (parameter.type) {
      case Types.Int:
        parameter.type = IntSizes[parameter.size || -1] || 'integer';
        parameter.size = undefined;
        break;
    }

    this.parameters.push({
      type: parameter.type,
      size: parameter.size || undefined,
      precision: parameter.precision || undefined,
      value: parameter.value
    });
  }

  /**
   * @returns Promise<any> An array of objects (rows returned)
   */
  call() {
    var currentParameter;
    var sqlParameters = [];
    var bindings = [];

    for (const parameter of this.parameters) {
      currentParameter = `cast(? as ${parameter.type}`;

      if (parameter.size) {
        currentParameter += `(${parameter.size}`

        if (parameter.precision) {
          currentParameter += `, ${parameter.precision}`
        }
      }
      currentParameter += ')';

      sqlParameters.push(currentParameter);
      bindings.push(parameter.value);
    }

    const statement = `CALL ${this.library}.${this.name}(${sqlParameters.join()})`;

    return options.executeStatement(statement, bindings);
  }
}

const Types = {
  Zoned: 'numeric',
  Packed: 'decimal',
  Int: 'integer',
  Float: 'float',
  Char: 'char',
  Varchar: 'varchar',
}

const IntSizes = {
  5: 'smallint',
  10: 'integer',
  20: 'bigint'
}

module.exports = {options, Program, Types};