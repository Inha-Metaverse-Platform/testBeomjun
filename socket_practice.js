// var express = require('express'); //express 불러옴
// const app = express();

var app = require("express")();
var http = require('http').createServer(app); //http 통신을 위한 모듈
var io = require('socket.io')(http); //socket 객체

app.get('/', (req, res) => res.send('Hello World!'));

http.listen(3000, function(){ //3000 포트에서 socket 연결을 기다립니다
  console.log("listening on *:3000");
})

//Client와의 연결 이벤트인 'connection'을 이벤트를 받는 on 함수로 받고
io.on('connection', function (socekt) {
  //연결되면 콘솔에 출력
  console.log(socket.id, 'Connected');
  //socket.emit 함수는 data와 함께
  socket.emit('msg', `${socket.id} 연결 되었습니다.`);
  socket.on('msg', function(data) {
    console.log(socket.id, data);

    socket.emit('msg', `Server : "${data}"받았습니다.`);
  })
})
