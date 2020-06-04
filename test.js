const connection = require('./odbc-extra/connection');
const {options, Program, Types} = require('./index.js');

work();

async function work() {
  const connectionString = [
    `Driver=IBM i Access ODBC Driver`,
    `System=${process.env.DB2_SYSTEM}`,
    `UID=${process.env.DB2_UID}`,
    `Password=${process.env.DB2_PASSWORD}`,
    `DBQ=,SAMPLE`,
    `Naming=1`
  ];

  await connection.connect(connectionString.join(";"),);
  options.executeStatement = connection.executeStatement;

  const myProgram = new Program("barry", "depts_web");
  console.log(await myProgram.call());
  console.log(await myProgram.call());
  
  const sumProgram = new Program("barry", "sum");

  sumProgram.addParameter({
    type: Types.Int,
    size: 10,
    value: 4
  });
  sumProgram.addParameter({
    type: Types.Int,
    size: 10,
    value: 5
  });

  console.log(await sumProgram.call());
}