module.exports = class rpgleDS {
  /**
   * 
   * @param {{name: string, length: number, decimals?: number, type?: rpgleDS|object, dim?: number}[]} subfields 
   */
  constructor(subfields) {
    this.subfields = [...subfields] || [];

    //We need to look for objects which are subfields and convert this to this class
    for (let index in this.subfields) {
      this.subfields[index] = {...this.subfields[index]}; //Make a clone
      if (this.subfields[index].type)
        if (typeof this.subfields[index].type === "object")
          this.subfields[index].type = new rpgleDS(this.subfields[index].type);
    }
  }

  /**
   * Define a subfield in your struct
   * @param {String} name The name of the subfield, which would match an object property
   * @param {Number} length The length of the subfield in bytes
   * @param {Number} decimals The decimal count of the field. Only used for fromBuffering to an object
   */
  addSubfield(name, length, decimals) {
    this.subfields.push({name, length, decimals});
  }

  getSize() {
    var totalSize = 0;
    var subSize;

    for (const subfield of this.subfields) {
      if (subfield.type === undefined) {
        totalSize += subfield.length;
      } else {
        subSize = subfield.type.getSize();
        if (subfield.dim) {
          subSize = subSize * subfield.dim;
        }

        totalSize += subSize;
      }
    }

    return totalSize;
  }

  toBufferArray(array, amount = 0) {
    if (array.length > amount) array = array.slice(0, amount);
    for (var i = array.length; i < amount; i++) array.push({});

    return array.map(obj => this.toBuffer(obj)).join('');
  }

  toBuffer(object) {
    var outString = ``;
    var currentValue;

    for (const subfield of this.subfields) {
      currentValue = object[subfield.name];

      switch (typeof currentValue) {
        case 'object':
          if (subfield.dim === undefined) {
            outString += subfield.type.toBuffer(currentValue);
          } else {
            outString += subfield.type.toBufferArray(currentValue, subfield.dim);
          }
          break;

        case 'undefined':
          if (subfield.type)
            if (subfield.dim)
              currentValue = subfield.type.toBufferArray([], subfield.dim);
            else
              currentValue = subfield.type.toBuffer({});

          else if (subfield.decimals == undefined)
            currentValue = ''.padEnd(subfield.length, ' ');
          else
            currentValue = ''.padEnd(subfield.length, '0');
          
          outString += currentValue;
          break;

        case 'boolean':
          outString += (currentValue === true ? '1' : '0');
          break;

        case 'string':
          if (currentValue.length > subfield.length)
            currentValue = currentValue.substr(0, subfield.length);
          else
            currentValue = currentValue.padEnd(subfield.length, ' ');

          outString += currentValue;
          break;

        case 'number':
          if (currentValue < 0) {
            //console.error('No support for negative numbers in rpgleDS: ' + subfield.name);
            currentValue = currentValue.toFixed(subfield.decimals);
            currentValue = currentValue.substr(1); //Remove the -
            currentValue = currentValue.replace(".", "");

            if (currentValue.length <= subfield.length) {
              currentValue = currentValue.padStart(subfield.length, '0');

              if (currentValue[currentValue.length-1] === '0') {
                //0 for some reason is totally off the chart?;
                outString += currentValue.substr(0, currentValue.length-1) + String.fromCharCode(125);
              } else {
                //Otherwise.. 1-9 is simply + 25
                outString += currentValue.substr(0, currentValue.length-1) + String.fromCharCode(currentValue.charCodeAt(currentValue.length-1)+25);
              }
            } else {
              throw new Error(`Number ${currentValue} too big for subfield: ${subfield.name}`);
            }

          } else {
            currentValue = currentValue.toFixed(subfield.decimals);
            currentValue = currentValue.replace(".", "");
            if (currentValue.length <= subfield.length) {
              currentValue = currentValue.padStart(subfield.length, '0');
              outString += currentValue;
            } else {
              throw new Error(`Number ${currentValue} too big for subfield: ${subfield.name}`);
            }
          }
          break;
      }

    }

    return outString;
  }

  fromBuffer(string) {
    var outObject = {};
    var index = 0;
    var size;

    /** @type {String} */
    var currentString;

    for (const subfield of this.subfields) {

      if (subfield.type === undefined) {
        currentString = string.substr(index, subfield.length);

        if (subfield.decimals === undefined) {
          //Is a string
          outObject[subfield.name] = currentString.trim();
          
          //Oh.. it might be an indicator??
          if (subfield.length === 1) {
            switch (outObject[subfield.name]) {
              case '1': outObject[subfield.name] = true; break;
              case '0': outObject[subfield.name] = false; break;
            }
          }
        } else {

          //This snippet of code determines whether the number is negative or not.
          var isNegative = false;
          //The last byte in the buffer determines if it is negative or not.
          const charNum = currentString.charCodeAt(currentString.length-1);
          //If it's in this character range, it's a negative number.
          if (charNum >= 74 && charNum <= 83) {
            //All we have to do is subtract 25 from the character code to get the true number..
            currentString = currentString.substr(0, currentString.length-1) + String.fromCharCode(charNum-25);
            //..then we tell the program it's a negative number.
            isNegative = true;

          } else if (charNum === 125) {
            //Is 0 but negative

            currentString = currentString.substr(0, currentString.length-1) + "0";
            //..then we tell the program it's a negative number.
            isNegative = true;
          }

          const start = currentString.substr(0, subfield.length-subfield.decimals);
          const end = currentString.substr(subfield.length-subfield.decimals);

          //Is a number
          currentString = (isNegative ? '-' : '') + start + '.' + end;

          outObject[subfield.name] = Number(currentString);
        }

        if (index === 0) {
          //If it's the first item and it's blank, then return nothing

          switch (true) {
            case outObject[subfield.name] === '':
            case subfield.decimals !== undefined && isNaN(outObject[subfield.name]):
              return undefined;
          }

        }
        
        index += subfield.length;
      } else {
        size = subfield.type.getSize() * (subfield.dim || 1);
        currentString = string.substr(index, size);

        if (subfield.dim) {
          outObject[subfield.name] = subfield.type.fromBufferArray(currentString, subfield.dim);
        } else {
          outObject[subfield.name] = subfield.type.fromBuffer(currentString);
        }

        index += size;
      }
    }

    return outObject;
  }

  fromBufferArray(string, amount = 1) {
    var currentItem;
    var outputArray = [];

    const size = this.getSize();
    const totalSize = (size * amount);
    var index = 0;

    //Padding here because was an issue on Windows with it not
    //returning the fullsize of the field (was trimming whitespace)
    string = string.padEnd(totalSize, ' ');

    if (string.length % totalSize === 0) {
      while (index < totalSize) {
        currentItem = this.fromBuffer(string.substr(index, size));
        if (currentItem) {
          outputArray.push(currentItem);
          index += size;
        } else {
          break;
        }
      }
    } else {
      console.error(`Buffer size not correct! DS size: ${size}*${amount}=${totalSize}, Buffer length: ${string.length}`);
    }

    return outputArray;
  }
}
