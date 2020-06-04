
const poolInstance = require('./pool');

/** @type {poolInstance} pool */
var pool; // Group of connections within ODBC

module.exports = {
  poolSuccessful: false,

  connect: async function(connectionString) {
    pool = new poolInstance(connectionString);
    pool.size = 2;
    await pool.connect();
    
    this.poolSuccessful = true;
  },

  getPool: () => pool,

  executeStatement: async function(statement, bindings) {
    const connection = await pool.getConnection();

    const results = await connection.query(statement, bindings);

    pool.reAdd(connection);

    return results;
  },
}