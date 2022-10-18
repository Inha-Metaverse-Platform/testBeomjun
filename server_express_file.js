var express = require('express')
var app = express()
var fs = require('fs');
var path = require('path');
var qs = require('querystring');
var sanitizeHtml = require('sanitize-html'); //sanitizeHtml은 대체 무슨 기능을 하는건지 잘 모르겠음

//이상한 입력이 들어오지 않도록 차단하는 역할

var bodyParser = require('body-parser');
var compression = require('compression');
var template = require('./lib/template.js');

app.use(bodyParser.urlencoded({extended: false })); //body-parser가 만들어내는 미들웨어를 표현하는 식?
//기존에는 post 방식으로 연결했을 때, 콜백함수 내에서 body 변수를 따로 만들었다
//하지만 body-parse를 사용하면 body가 알아서 처리된다

app.use(compression()); //compression 함수를 가져온건가?

app.use(express.static(__dirname + "/public")); //public을 쓰겠다..? 무슨 코드인지 잘 모르겠음



//route, routing
//app.get('/', (req, res) => res.send('Hello World!'))
app.get('/', function(request, response) {
  fs.readdir('./data', function(error, filelist){
    var title = 'Welcome';
    var description = 'Hello, Node.js';
    var list = template.list(filelist);
    var html = template.HTML(title, list,
      `<h2>${title}</h2>${description}`,
      `<a href="/create">create</a>`
    );
    response.send(html);
  });
});

app.get('/page/:pageId', function(request, response) {
    fs.readdir('./data', function(error, filelist){
      var filteredId = path.parse(request.params.pageId).base; //request의 params에접근, 그중 pageId에 있는 값을 불러온다
      //예를 들어서 http~/page/HTML 이라는 주소에 접근했을 때 filteredId에 HTML이 들어온다는 의미
      fs.readFile(`data/${request.params.pageId}`, 'utf8', function(err, description){
        var title = filteredId;
        var sanitizedTitle = sanitizeHtml(title);
        var sanitizedDescription = sanitizeHtml(description, {
          allowedTags:['h1']
        });
        var list = template.list(filelist);
        var html = template.HTML(sanitizedTitle, list,
          `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
          ` <a href="/create">create</a>
            <a href="/update/${sanitizedTitle}">update</a>
            <form action="/delete_process" method="post">
              <input type="hidden" name="id" value="${sanitizedTitle}">
              <input type="submit" value="delete">
            </form>`
        );
        response.send(html);
      });
    });
});

app.get('/create', function(request, response){
  fs.readdir('./data', function(error, filelist){
    var title = 'WEB - create';
    var list = template.list(filelist);
    var html = template.HTML(title, list, `
      <form action="/create_process" method="post">
        <p><input type="text" name="title" placeholder="title"></p>
        <p>
          <textarea name="description" placeholder="description"></textarea>
        </p>
        <p>
          <input type="submit">
        </p>
      </form>
    `, ''); //create_process로 이동시킬 건데, method가 post임을 기억하자!
    response.send(html);
  });
});

app.post('/create_process', function(request, response){
  var post = request.body;
  var title = post.title;
  var description = post.description;
  fs.writeFile(`data/${title}`, description, 'utf8', function(err){
    response.writeHead(302, {Location: `/page/${title}`});
    response.end();
  });
});

app.get('/update/:pageId', function(request, response){
  fs.readdir('./data', function(error, filelist){
    var filteredId = path.parse(request.params.pageId).base;
    fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
      var title = request.params.pageId;
      var list = template.list(filelist);
      var html = template.HTML(title, list,
        `
        <form action="/update_process" method="post">
          <input type="hidden" name="id" value="${title}">
          <p><input type="text" name="title" placeholder="title" value="${title}"></p>
          <p>
            <textarea name="description" placeholder="description">${description}</textarea>
          </p>
          <p>
            <input type="submit">
          </p>
        </form>
        `,
        `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
      );
      response.send(html);
    });
  });
})

app.post('/update_process', function(request, response){
  var post = request.body;
  var id = post.id;
  var title = post.title;
  var description = post.description;
  fs.rename(`data/${id}`, `data/${title}`, function(error){
    fs.writeFile(`data/${title}`, description, 'utf8', function(err){
      response.redirect(`/page/${title}`);
    })
  });
});

app.post('/delete_process', function(request, response){
  var body = '';
  request.on('data', function(data){
      body = body + data;
  });
  request.on('end', function(){
      var post = qs.parse(body);
      var id = post.id;
      var filteredId = path.parse(id).base;
      fs.unlink(`data/${filteredId}`, function(error){
        response.redirect('/');
      })
  });
});

app.get("/unity", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.listen(3000, function() {
  console.log('Example app listening on port 3000!')
});
