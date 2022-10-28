var express  = require('express');//import express NodeJS framework module
var app      = express();// create an object of the express module
var http     = require('http').Server(app);// create a http web server using the http library
var io       = require('socket.io')(http);// import socketio communication module


app.use("/public/TemplateData",express.static(__dirname + "/public/TemplateData"));
app.use("/public/Build",express.static(__dirname + "/public/Build"));
app.use(express.static(__dirname+'/public'));

var clients			= [];// to storage clients
var clientLookup = {};// clients search engine
var sockets = {};//// to storage sockets


//open a connection with the specific client
io.on('connection', function(socket){
  //이거 문법이 헷갈리나? on 함수는 예전에 querydata 받아올 때도 썼던거 같다
  //맨 처음으로 넘겨주는 패러미터는 'end'나 'start' 같은거 써줬던거 같기도 하고..
  //socket 변수는 뭘까?
  //console.log(socket); //모르겠으면 출력해보자
  //한번 출력해 봤음. notion에 정리해뒀으니 필요하면 가서 읽어보도록

   //print a log in node.js command prompt
   //연결이 성공했을 때 실행되는거
  console.log('연결 준비 완료');


  //to store current client connection
  var currentUser;


	//create a callback fuction to listening EmitPing() method in NetworkMannager.cs unity script
	socket.on('PING', function (_pack)
	{
	  console.log('_pack에 담겨있는 내용: '+_pack);
	  var pack = JSON.parse(_pack);
    //pack이라는 변수를 만들어서, JSON.parse로 파싱한다
	    console.log('message from user# '+socket.id+": "+pack.msg);

		 //emit back to NetworkManager in Unity by client.js script
     console.log("이제 PONG 방식으로 socket.emit 할거에요");
		 socket.emit('PONG', socket.id,pack.msg);//패러미터는 두개에요, socket 변수의 id와, pack의 msg에요
     //socket.emit('코드', 패러미터);를 실행하면, 해당 코드에 해당하는 socket.on이 실행되는거였다!
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
        console.log("LOGIN_SUCCESS를 실행할게요!");
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


http.listen(process.env.PORT ||3000, function(){
	console.log('listening on *:3000');
});
console.log("------- server is running -------");
