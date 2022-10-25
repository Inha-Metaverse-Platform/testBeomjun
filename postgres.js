const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('Hello World!'));

const {Pool} = require('pg');
const pg = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'accounts',
  password: 'password',
  port: 5432 //postgres의 기본 포트인듯?
})

pg.connect(err => {
  if(err) console.log(err);
  else{
    console.log("database connected");
  }
})

//(req, res) => res.send()

//var app = http.createServer(function(request,response)
//response.end()

//이 둘을 합친 기능이라고 생각하면 되는거 같다

app.listen(3000, () => console.log('Example app listening on port 3000!'));
