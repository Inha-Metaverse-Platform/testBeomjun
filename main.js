var http = require('http');
var fs = require('fs');
var url = require('url');

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var title = queryData.id;



    fs.readFile(`data/${title}`, 'utf-8', function(err, data){
      var description = data;
      var template = `
      <!doctype html>
      <html>
      <head>
        <title>${title}</title>
        <meta charset="utf-8">
      </head>
      <body>
        <h1><a href="/">HOME</a></h1>
        <ol>
          <li><a href="/?id=HTML">HTML</a></li>
          <li><a href="/?id=CSS">CSS</a></li>
          <li><a href="/?id=JavaScript">JavaScript</a></li>
        </ol>
        <h2>${title}</h2>
        <p>${description}
        </p>
      </body>
      </html>
      `;
      response.writeHead(200);
      response.end(template);
    });



});
app.listen(3000); //3000번 포트에 우리 node.js 서버를 올렸음
