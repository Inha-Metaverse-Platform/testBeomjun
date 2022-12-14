var express   = require('express');
var app       = express(); //서버 열었음
var http      = require('http').Server(app);
var io        = require('socket.io')(http);
var shortId   = require('shoreid');

app.use("/public/TemplateData", express.static(__dirname + "/public/TemplateData"));
app.use("/public/Build", express.static(__dirname + "/public/Build"));

var clients       = []; //to storage
var clientLookup  = {}; //clients search engine
var sockets       = {}; //to storage sockets

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


http.listen(process.env.PORT ||3000, function(){
        console.log('listening on *:3000');
});
console.log("------- server is running -------");
