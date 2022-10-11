var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js');
var path = require('path');
var mysql = require('mysql');

var db = mysql.createConnection({
  host:'localhost',
  user:'root',
  password:'password',
  database:'opentutorials'
});
db.connect();

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    if(pathname === '/'){ //최상위 경로라는 의미
      if(queryData.id === undefined){ //query string의 id가 없다면 (홈 화면이라면)
        db.query(`SELECT * FROM topic`, function(err, topics){ //MySQL에서 SELECT * FROM topic을 실행한 결과를 반환
          //object들로 구성된 배열이 리턴됨
          var title = 'Welcome';
          var description = 'Welcome to WEB + MySQL';
          var topiclist = template.list(topics);
          var html = template.HTML(title, topiclist,
                `<h2>${title}</h2>${description}`,
                `<a href="/create">create</a>`
              )
          response.writeHead(200);
          response.end(html);
        });
      } else { //home화면이 아니라면
        db.query(`SELECT * FROM topic`, function(err, topics){
          if(err) throw err;
          db.query(`SELECT * FROM topic WHERE id=${queryData.id}`, function(err2, topic){ //topic이 배열로서 들어온다는 점 주의!
            var title = topic[0].title;
            var description = topic[0].description;
            var topiclist = template.list(topics);

            var html = template.HTML(title, topiclist,
                  `<h2>${title}</h2>${description}`,
                  `<a href="/create">create</a>
                    <a href="/update?id=${queryData.id}">update</a>
                    <form action="delete_process" method="post">
                      <input type="hidden" name="id" value="${queryData.id}">
                      <input type="submit" value="delete">
                    </form>`
            );
            response.writeHead(200);
          response.end(html);
          })
        });
      }
    } else if(pathname === '/create'){
      db.query(`SELECT * FROM topic`, function(err, topics){ //MySQL에서 SELECT * FROM topic을 실행한 결과를 반환
        //object들로 구성된 배열이 리턴됨
        var title = 'Create';
        var topiclist = template.list(topics);
        var html = template.HTML(title, topiclist,
              `<form action="/create_process" method="post">
                <p><input type="text" name="title" placeholder="title"></p>
                <p>
                  <textarea name="description" placeholder="description"></textarea>
                </p>
                <p>
                  <input type="submit">
                </p>
              </form>`, ''
            )
        response.writeHead(200);
        response.end(html);
      });
    } else if(pathname === '/create_process'){
      var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);

          db.query(`
          INSERT INTO topic (title, description, created, author_id)
          VALUES(?, ?, NOW(), ?);`,
          [post.title, post.description, 1],
          function(err, result){
            if(err) {
              throw err;
            }

            response.writeHead(302, {Location: `/?id=${result.insertId}`});
            response.end();
          })
      });
    } else if(pathname === '/update'){

          db.query(`SELECT * FROM topic`, function(err, topics){ //MySQL에서 SELECT * FROM topic을 실행한 결과를 반환
            //object들로 구성된 배열이 리턴됨
            if(err) {
              throw err;
            }
            db.query(`SELECT * FROM topic WHERE id=?`, [queryData.id], function(err2, topic){
              var title = 'Update';
              var topiclist = template.list(topics);
              var html = template.HTML(title, topiclist,
                    `<form action="/update_process" method="post">
                      <input type="hidden" name="id" value="${topic[0].id}">
                      <p><input type="text" name="title" placeholder="title" value="${topic[0].title}"></p>
                      <p>
                        <textarea name="description" placeholder="description">${topic[0].description}</textarea>
                      </p>
                      <p>
                        <input type="submit">
                      </p>
                    </form>`, ''
                  )
              response.writeHead(200);
              response.end(html);
            })

      });
    } else if(pathname === '/update_process'){
      var body = '';
      request.on('data', function(data){
          body = body + data;
      });

      request.on('end', function(){
          var post = qs.parse(body);
          console.log(post);

          db.query(`
          UPDATE topic SET title = ?, description = ? WHERE id=?;`,
          [post.title, post.description, post.id],
          function(err, result){
            if(err) {
              throw err;
            }
            response.writeHead(302, {Location: `/?id=${post.id}`});
            response.end();
          })
      });
    } else if(pathname === '/delete_process'){
      var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
          db.query(`DELETE FROM topic WHERE id = ?;`, [post.id], function(err){
            if(err) {
              throw err;
            }
            response.writeHead(302, {Location: `/`});
            response.end();
          })
      });
    } else {
      response.writeHead(404);
      response.end('Not found');
    }
});
app.listen(3000);
