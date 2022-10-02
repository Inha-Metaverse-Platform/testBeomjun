var http = require('http');
var fs = require('fs');
var app = http.createServer(function(request,response){
    var url = request.url;
    response.writeHead(200);
    response.end("<h1>pracitce</h1>");

});
app.listen(3000);
