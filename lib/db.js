const {Pool} = require('pg');
var db = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'metaverse',
    password: 'password',
    port: 5432 //postgres의 기본 포트인듯?
  })
db.connect();
module.exports = db;