var express = require("express");
var server = express(); //express 모듈 불러옴, express로 server를 열었음

var fs = require('fs'); //파일 읽어오는 모듈
var path = require('path'); //현재 url 읽는 모듈?
var qs = require('querystring'); //query string 읽어오는 모듈

server.use(express.static(__dirname + "/public")); //public을 쓰겠다..? 무슨 코드인지 잘 모르겠음


//home화면
server.get("/", (req, res) => {
  res.sendFile(__dirname + "/home.html");
});

server.get("/page", (req, res) => {

})

server.get("/unity", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

server.use((req, res) => {
  res.sendFile(__dirname + "/404.html");
});

server.listen(3000, (err) => {
  if (err) return console.log(err);
  console.log("The server is listening on port 3000");
});
