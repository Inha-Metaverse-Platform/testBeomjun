var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var mysql = require('mysql');

var template = require('./lib/template.js');


//설치된 mysql DB와 통신하기 위한 코드
var db = mysql.createConnection({ //conection을 생성한다
  host     : 'localhost', //node.js 서버와 mysql 서버가 같은 곳에 있음
  user     : 'root',
  password : 'password', //mysql에서 사용중인 패스워드
  database : 'testsql' //사용할 데이터베이스
});
db.connect();

var app = http.createServer(function(request, response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query; //query data 자리에서, ? 뒤에 뭐가 왔는지. 아무것도 없으면 undefined
    var pathname = url.parse(_url, true).pathname; //path, 어떤 파일에 접근할건지 알려줌.

    if(pathname === '/'){ //어떤 파일에도 접근하고 있지 않음
      if(queryData.id === undefined){ //queryData에도 아무것도 없음 ->홈화면
        db.query(`SELECT * FROM account`, function(err, accounts){ //MySQL에서 SELECT * FROM topic을 실행한 결과를 반환
          //object들로 구성된 배열이 리턴됨
          var title = 'INHA METAVERSE';
          var description = 'Welcome to Inha Metaverse';
          var accountlist = template.list(accounts);
          var html = template.HTML(title, accountlist,
                `<h2>${title}</h2>${description}`,
                `<a href="/create">회원가입</a>`
              )
          response.writeHead(200);
          response.end(html);
        });
      } else {
        fs.readdir('./data', function(error, filelist){
          fs.readFile(`data/${queryData.id}`, 'utf8', function(err, description){
            var title = queryData.id;
            var list = template.list(filelist);
            var template = template.html(title, list,
              `<h2>${title}</h2>${description}`,

              `<a href="/create">새 글 작성</a>
               <a href="/update?id=${title}">글 수정</a>
               <form action="delete_process" method="post">
                 <input type="hidden" name="id" value="${title}">
                 <input type="submit" value="delete">
               </form>
               `
            );
            response.writeHead(200);
            response.end(template);
          });
        });
      }
    } else if(pathname === '/create'){
      fs.readdir('./data', function(error, filelist){
        var title = 'CRUD 게시판 - 새 글 작성';
        var list = template.list(filelist);
        var template = template.html(title, list, `
          <form action="/create_process" method="post">
            <p><input type="text" name="title" placeholder="글 제목"></p>
            <p>
              <textarea name="description" rows="4" cols="50" placeholder="본문 내용"></textarea>
            </p>
            <p>
              <input type="submit" placeholder="작성완료">
            </p>
          </form>
        `, '');
        response.writeHead(200);
        response.end(template);
      });
    } else if(pathname === '/update') {
      fs.readdir('./data', function(error, filelist){
        fs.readFile(`data/${queryData.id}`, 'utf8', function(err, description){
          var title = queryData.id;
          var list = template.list(filelist);
          var template = template.html(title, list,
            `
            <form action="/update_process" method="post">
              <input type="hidden" name="id" value="${title}">
              <p><input type="text" name="title" placeholder="글 제목" value="${title}"></p>
              <p>
                <textarea name="description" rows="4" cols="50" placeholder="본문 내용">${description}</textarea>
              </p>
              <p>
                <input type="submit" placeholder="작성완료">
              </p>
            </form>
            `,
            `<a href="/create">새 글 작성</a>
             <a href="/update?id=${title}">글 수정</a>`
          );
          response.writeHead(200);
          response.end(template);
        });
      });
    } else if(pathname === '/update_process'){
      var body = '';
      request.on('data', function(data){
          body += data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
          var id = post.id;
          var title = post.title;
          var description = post.description;
          fs.rename(`data/${id}`, `data/${title}`, function(err){
            fs.writeFile(`data/${title}`, description, 'utf8', function(err){
              response.writeHead(302, {Location: `/?id=${title}`});
              response.end();
          })
        });
      });
    } else if(pathname === '/create_process'){
      var body = '';
      request.on('data', function(data){
          body += data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
          var title = post.title;
          var description = post.description;
          fs.writeFile(`data/${title}`, description, 'utf8', function(err){
            response.writeHead(302, {Location: `/?id=${title}`});
            response.end();
          })
      });
    } else if(pathname === '/delete_process'){
      var body = '';
      request.on('data', function(data){
          body += data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
          var id = post.id;
          fs.unlink(`data/${id}`, function(err){
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
