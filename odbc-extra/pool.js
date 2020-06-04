
const odbc = require('odbc'); // require pull in odbc module 

module.exports = class Pool {
  constructor(connectionstring) {
    this.connectionString = connectionstring;

    this.incrementSize = 2;
    this.size = 10;
    this.pool = [];
  }

  async connect() {
    await this.addConnections(this.size);
    
    setInterval(function(pool) {
      for (var connection of pool) connection.connected; //This single line runs a call to the DB
      
    }, 1200000, this.pool); //every 20 minutes
  }

  async addConnections(amount) {
    for (var i = 0; i < amount; i++) await this.addConnection();
  }

  async addConnection() {
    this.pool.push(await odbc.connect(this.connectionString));
  }

  async getConnection() {

    var gotOne = false, toAdd = 0;
    var connection;

    while (!gotOne) {
      if (this.pool.length > 0) {
        connection = this.pool.pop();

        gotOne = connection.connected;
        if (!gotOne)
          toAdd += 1;

      } else {
        await this.addConnection();
        connection = this.pool.pop();

        toAdd = this.size;
        gotOne = true;
      }
    }

    //We don't need to wait since we have a connection
    if (toAdd > 0) this.addConnections(toAdd);

    return connection;
  }

  reAdd(connection) {
    this.pool.push(connection);
  }
}