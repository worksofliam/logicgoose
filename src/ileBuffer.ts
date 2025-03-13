import { ILEPrimitive, PrimitiveStruct } from "./types";

export class ILEBuffer {
  static determineSize(subfields: PrimitiveStruct) {
    var totalSize = 0;

    for (const subfield of subfields) {
      if ('length' in subfield) {
        totalSize += subfield.length;
      } else if ('dim' in subfield) {
        let subsize = this.determineSize(subfield.like);
        totalSize += subsize * (subfield.dim || 1);
      }
    }

    return totalSize;
  }

  static toBufferArray(subfields: PrimitiveStruct, array: any[], amount = 0) {
    if (array.length > amount) array = array.slice(0, amount);
    for (var i = array.length; i < amount; i++) array.push({});

    return array.map(obj => this.toBuffer(subfields, obj)).join('');
  }

  static toBuffer(subfields: PrimitiveStruct, object: any) {
    var outString = ``;
    var currentValue: any;

    for (const subfield of subfields) {
      currentValue = object[subfield.name];

      switch (typeof currentValue) {
        case 'object':
          if ('like' in subfield) {
            if ('dim' in subfield) {
              outString += this.toBufferArray(subfield.like, currentValue, subfield.dim);
            } else {
              outString += this.toBuffer(subfield.like, currentValue);
            }
          } else {
            throw new Error(`Subfield ${subfield.name} is not defined in the object.`);
          }
          break;

        case 'undefined':
          if ('like' in subfield)
            if (subfield.dim)
              currentValue = this.toBufferArray(subfield.like, [], subfield.dim);
            else
              currentValue = this.toBuffer(subfield.like, {});

          else if ('decimals' in subfield)
            currentValue = ''.padEnd(subfield.length, '0');
          else if ('length' in subfield)
            currentValue = ''.padEnd(subfield.length, ' ');
          
          outString += currentValue;
          break;

        case 'boolean':
          outString += (currentValue === true ? '1' : '0');
          break;

        case 'string':
          if ('length' in subfield) {
            if (currentValue.length > subfield.length)
              currentValue = currentValue.substr(0, subfield.length);
            else
              currentValue = currentValue.padEnd(subfield.length, ' ');

            outString += currentValue;
          } else {
            throw new Error(`Subfield ${subfield.name} is not defined as a string.`);
          }
          break;

        case 'number':
          if ('decimals' in subfield) {
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
          }
          break;
      }

    }

    return outString;
  }

  static fromBuffer(subfields: PrimitiveStruct, buffStr: string) {
    var outObject = {};
    var index = 0;
    var size;

    var currentString: string;

    for (const subfield of subfields) {

      if ('like' in subfield) {
        size = ILEBuffer.determineSize(subfield.like) * (subfield.dim || 1);
        currentString = buffStr.substr(index, size);

        if (subfield.dim) {
          outObject[subfield.name] = this.fromBufferArray(subfield.like, currentString, subfield.dim);
        } else {
          outObject[subfield.name] = this.fromBuffer(subfield.like, currentString);
        }

        index += size;
      } else if ('length' in subfield) {
        currentString = buffStr.substr(index, subfield.length);

        if ('decimals' in subfield) {
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
        } else {
          //Is a string
          outObject[subfield.name] = currentString.trim();
          
          //Oh.. it might be an indicator??
          if (subfield.length === 1) {
            switch (outObject[subfield.name]) {
              case '1': outObject[subfield.name] = true; break;
              case '0': outObject[subfield.name] = false; break;
            }
          }
        }

        if (index === 0) {
          //If it's the first item and it's blank, then return nothing

          switch (true) {
            case outObject[subfield.name] === '':
            case ('decimals' in subfield) && isNaN(outObject[subfield.name]):
              return undefined;
          }

        }
        
        index += subfield.length;
      }
    }

    return outObject;
  }

  static fromBufferArray(subfields: ILEPrimitive[], string: string, amount = 1) {
    var currentItem;
    var outputArray: string[] = [];

    const size = ILEBuffer.determineSize(subfields);
    const totalSize = (size * amount);
    var index = 0;

    //Padding here because was an issue on Windows with it not
    //returning the fullsize of the field (was trimming whitespace)
    string = string.padEnd(totalSize, ' ');

    if (string.length % totalSize === 0) {
      while (index < totalSize) {
        currentItem = this.fromBuffer(subfields, string.substr(index, size));
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
