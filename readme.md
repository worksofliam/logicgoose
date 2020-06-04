## logicgoose

A simple library based to generate a valid SQL statement to call and return relational data from SQL ILE programs.

logicgoose will handle the data types being passed into your program. Your SQL ILE program needs to use a certain SQL statement to return data.

You are required to pass in a function that logicgoose can run SQL statements with that will also allow it to pass in binding parameters. You only need to set this once. This also means you will need to use your own database connections (like ODBC or idb-connector/pconnector)

```js
const {options} = require('./index.js');
options.executeStatement = function(statementString, parametersArray) {...}
```

### Example

In RPG:

```rpgle
Dcl-S rowCount Int(5);

Dcl-Ds outputRows Dim(50) Qualified;
  id Like(Department.DEPTNO);
  name Like(Department.DEPTNAME);
End-Ds;

LoadSubfile();

EXEC SQL SET RESULT SETS ARRAY :outputRows for :rowCounts ROWS;
```

```js
const {Program} = require('./index.js');

const myProgram = new Program("barry", "depts_web");
console.log(await myProgram.call());
```