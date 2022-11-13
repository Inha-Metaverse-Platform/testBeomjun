var express = require("express");
var app = express()
var http     = require('http').Server(app);// create a http web server using the http library
var io       = require('socket.io')(http);// import socketio communication module

var path = require('path')
var mysql = require('mysql');
var bodyParser = require('body-parser');
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

var compression = require('compression');
app.use(compression());

var template = require('./lib/template.js');

// var http = require('http').Server(app);
// var io = require('socket.io')(http); //http 통신 기반으로 socket 통신도 할거다

//const db = require('./lib/postgres')
var db = mysql.createConnection({
	host:'localhost',
	user:'root',
	password:'password',
	database:'testsql'
  });
  
db.connect();


//home화면
app.get('/', function(request, response) {
  db.query(`SELECT * FROM account`, function(err, accounts){
    var title = "INHA METAVERSE";
    var description = "Welcome to Inha Metaverse";
    var accountlist = template.list(accounts);
    var html = template.HTML(title, accountlist,
      `<h2>${title}</h2>${description}`,
      `<a href="/login">로그인</a>
      <a href="/create">회원가입</a>`
    );
    response.send(html);
  })
});



app.get('/account/:accountId', function(request, response){
  var filteredId = path.parse(request.params.accountId).base;
  db.query(`SELECT * FROM account`, function(err, accounts){
    if(err) {
      throw err;
    }
    var accountlist = template.list(accounts);

    db.query(`SELECT * FROM account WHERE id=${filteredId}`, function(err2, account){
      if(err2) {
        throw err2;
      }

      var user_id = account[0].user_id;
      var user_pw = account[0].user_pw;
      var username = account[0].username;

      var html = template.HTML(username, accountlist,
      `<h2>${username}</h2>
      <p>id : ${user_id}</p>
      <p>pw : ${user_pw}</p>`,
      `<a href="/create">회원가입</a>
        <a href="/update/id=${filteredId}">회원정보 변경</a>
        <form action="/delete_process" method="post">
          <input type="hidden" name="id" value="${filteredId}">
          <input type="submit" value="탈퇴">
        </form>`
      );
      response.send(html);
    })
  })
});


app.get('/create', function(request, response){
  db.query(`SELECT * FROM account`, function(err, accounts){ //account table에 존재하는 모든 데이터 불러옴
    if(err){
      throw err;
    }

    var title = '회원가입 페이지';
    var accountlist = template.list(accounts);
    var html = template.HTML(title, accountlist,
          `<h2>회원 가입을 환영합니다</h2>
          <form action="/create_process" method="post">
          <p><input type="text" name="username" placeholder="닉네임"></p>
            <p><input type="text" name="user_id" placeholder="아이디"></p>
            <p><input type="text" name="user_pw" placeholder="비밀번호"></p>
            <p>
              <input type="submit" value="회원가입">
            </p>
          </form>`, ''
        )
    response.send(html);
  });
});


app.post('/create_process', function(request, response){
  var post = request.body;
  db.query(`
    INSERT INTO account (user_id, user_pw, username, created)
    VALUES(?, ?, ?, NOW());`,
    [post.user_id, post.user_pw, post.username],
    function(err, result) {
      if(err) {
        throw err;
      }
      response.redirect(`/`);
    })
});


app.post('/delete_process', function(request, response){
  var post = request.body;
  db.query(`DELETE FROM account WHERE id = ?;`, [post.id], function(err){
    if(err) {
      throw err;
    }
    response.redirect(`/`);
  })
});


app.get('/login', function(request, response){
  var post = request.body;
  db.query(`SELECT * FROM account`, function(err, accounts){ //account table에 존재하는 모든 데이터 불러옴
    if(err){
      throw err;
    }

    var title = '로그인 페이지';
    var accountlist = template.list(accounts);
    var html = template.HTML(title, accountlist,
          `<h2>로그인</h2>
          <form action="/login_process" method="post">
            <p><input type="text" name="user_id" placeholder="아이디"></p>
            <p><input type="text" name="user_pw" placeholder="비밀번호"></p>
            <p>
              <input type="submit" value="로그인">
            </p>
          </form>`, ''
        )
    response.send(html);
  });
});


app.post('/login_process', function(request, response){
  var post = request.body;
  var user_id = post.user_id;
  var user_pw = post.user_pw;

  if(user_id && user_pw) {
    db.query('SELECT * FROM account WHERE user_id = ? AND user_pw = ?', [user_id, user_pw], function(error, results){
      if(error) {
        throw error;
      }
      if(results.length > 0) {
        response.send(`<h1>Login succesful!</h1>
            <h3>Hello, ${results[0].username}!</h3>
            <form action="/unity" method="post">
            <input type="submit" value="Go to Metaverse">
            </form>
            `);
      } else {
        response.send('login failed');
      }
    });
  }else{
    response.send('<h1>Please Type ID and PW</h1>');
  }

});


app.post('/unity', function(request, response){
  // var filteredUserId = path.parse(request.params.userId).base;
  // console.log(filteredUserId);
  response.sendFile(__dirname + "/public/index.html");

  app.use("/public/TemplateData",express.static(__dirname + "/public/TemplateData"));
  app.use("/public/Build",express.static(__dirname + "/public/Build"));
  app.use(express.static(__dirname+'/public'));

  var clients			= [];// to storage clients
  var clientLookup = {};// clients search engine
  var sockets = {};//// to storage sockets


  //open a connection with the specific client
  io.on('connection', function(socket){

     //print a log in node.js command prompt
    console.log('A user ready for connection!');

    //to store current client connection
    var currentUser;


  	//create a callback fuction to listening EmitPing() method in NetworkMannager.cs unity script
  	socket.on('PING', function (_pack)
  	{
  	  //console.log('_pack# '+_pack);
  	  var pack = JSON.parse(_pack);

  	    console.log('message from user# '+socket.id+": "+pack.msg);

  		 //emit back to NetworkManager in Unity by client.js script
  		 socket.emit('PONG', socket.id,pack.msg);

  	});

  	//create a callback fuction to listening EmitJoin() method in NetworkMannager.cs unity script
  	socket.on('LOGIN', function (_data)
  	{

  	    console.log('[INFO] JOIN received !!! ');

  		var data = JSON.parse(_data);

           // fills out with the information emitted by the player in the unity
          currentUser = {
  			       name:data.name,

                     position:data.position,
  				   rotation:'0',
  			       id:socket.id,//alternatively we could use socket.id
  				   socketID:socket.id,//fills out with the id of the socket that was open
  				   isMute:false
  				   };//new user  in clients list

  		console.log('[INFO] player '+currentUser.name+': logged!');
  		console.log('[INFO] currentUser.position '+currentUser.position);

  		 //add currentUser in clients list
  		 clients.push(currentUser);

  		 //add client in search engine
  		 clientLookup[currentUser.id] = currentUser;

  		 sockets[currentUser.id] = socket;//add curent user socket

  		 console.log('[INFO] Total players: ' + clients.length);

  		 /*********************************************************************************************/

  		//send to the client.js script
  		socket.emit("LOGIN_SUCCESS",currentUser.id,currentUser.name,currentUser.position);

           //spawn all connected clients for currentUser client
           clients.forEach( function(i) {
  		    if(i.id!=currentUser.id)
  			{
  		      //send to the client.js script
  		      socket.emit('SPAWN_PLAYER',i.id,i.name,i.position);

  		    }//END_IF

  	     });//end_forEach

  		 // spawn currentUser client on clients in broadcast
  		socket.broadcast.emit('SPAWN_PLAYER',currentUser.id,currentUser.name,currentUser.position);


  	});//END_SOCKET_ON






  	//create a callback fuction to listening EmitMoveAndRotate() method in NetworkMannager.cs unity script
  	socket.on('MOVE_AND_ROTATE', function (_data)
  	{
  	  var data = JSON.parse(_data);

  	  if(currentUser)
  	  {

         currentUser.position = data.position;

  	   currentUser.rotation = data.rotation;

  	   // send current user position and  rotation in broadcast to all clients in game
         socket.broadcast.emit('UPDATE_MOVE_AND_ROTATE', currentUser.id,currentUser.position,currentUser.rotation);


         }
  	});//END_SOCKET_ON

  	socket.on("VOICE", function (data) {


    if(currentUser)
    {


      var newData = data.split(";");
      newData[0] = "data:audio/ogg;";
      newData = newData[0] + newData[1];


      clients.forEach(function(u) {

        if(sockets[u.id]&&u.id!= currentUser.id&&!u.isMute)
        {

          sockets[u.id].emit('UPDATE_VOICE',newData);
        }
      });



    }

  });

  socket.on("AUDIO_MUTE", function (data) {


  if(currentUser)
  {
    currentUser.isMute = !currentUser.isMute;

  }

  });


      // called when the user desconnect
  	socket.on('disconnect', function ()
  	{

  	    if(currentUser)
  		{
  		 currentUser.isDead = true;

  		 //send to the client.js script
  		 //updates the currentUser disconnection for all players in game
  		 socket.broadcast.emit('USER_DISCONNECTED', currentUser.id);


  		 for (var i = 0; i < clients.length; i++)
  		 {
  			if (clients[i].name == currentUser.name && clients[i].id == currentUser.id)
  			{

  				console.log("User "+clients[i].name+" has disconnected");
  				clients.splice(i,1);

  			};
  		};

  		}

      });//END_SOCKET_ON

  });//END_IO.ON
});

//process.env.port || 3000의 뜻은 process.env라는 객체에 port라는 설정이 있다면 그 속성을 사용하고, 없다면 3000을 사용한다는 뜻이다
http.listen(process.env.PORT ||3000, function(){
	console.log('listening on *:3000');
});

// app.listen(3000, function() {
//   console.log('Example app listening on port 3000!')
// });
