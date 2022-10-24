const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('Hello World!'));
//(req, res) => res.send()

//var app = http.createServer(function(request,response)
//response.end()

//이 둘을 합친 기능이라고 생각하면 되는거 같다

app.listen(3000, () => console.log('Example app listening on port 3000!'));
