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
        db.query(`SELECT * FROM account`, function(err, accounts){ //MySQL에서 SELECT * FROM account을 실행한 결과를 반환
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
      } else { //queryData에 뭔가 존재
        db.query(`SELECT * FROM account`, function(err, accounts){ //account table에 존재하는 모든 데이터 불러옴
          if(err) {
            throw err; //오류 발생하면 throw
          }
          db.query(`SELECT * FROM account WHERE id=${queryData.id}`,  function(err2, account){ //queryData.id를 참조해 몇번째 계정에 접속중인지 확인
            if(err2) {
              throw err2; //오류 발생하면 throw
            }

            //topic이 배열로서 들어온다는 점 주의!
            var user_id = account[0].user_id;
            var user_pw = account[0].user_pw; //데이터에서 id와 pw 불러옴
            var accountlist = template.list(accounts);
            var title = "계정 정보";

            var html = template.HTML(title, accountlist,
                  `<h2>${title}</h2>${description}`,
                  `<a href="/create">회원가입</a>
                    <a href="/update?id=${queryData.id}">회원정보 변경</a>
                    <form action="delete_process" method="post">
                      <input type="hidden" name="id" value="${queryData.id}">
                      <input type="submit" value="탈퇴">
                    </form>`
            );
            response.writeHead(200);
          response.end(html);
          })
        });

      }
    } else if(pathname === '/create'){
      db.query(`SELECT * FROM account`, function(err, accounts){ //account table에 존재하는 모든 데이터 불러옴
        if(err){
          throw err;
        }

        var title = '회원가입 페이지';
        var accountlist = template.list(accounts);
        var html = template.HTML(title, accountlist,
              `<h2>회원 가입 (id와 pw를 꼭 입력하세요)</h2>
              <form action="/create_process" method="post">
                <p><input type="text" name="user_id" placeholder="아이디"></p>
                <p><input type="text" name="user_pw" placeholder="비밀번호"></p>
                <p>
                  <input type="submit" value="회원가입">
                </p>
              </form>`, ''
            )
        response.writeHead(200);
        response.end(html);
      });
    } else if(pathname === '/update') {

    } else if(pathname === '/create_process'){
      var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);

          db.query(`
          INSERT INTO account (user_id, user_pw, created)
          VALUES(?, ?, NOW());`,
          [post.user_id, post.user_pw],
          function(err, result){
            if(err) {
              throw err;
            }

            response.writeHead(302, {Location: `/?id=${result.insertId}`});
            response.end();
          })
      });
    } else if(pathname === '/update_process'){

    } else if(pathname === '/delete_process'){

    } else {
      response.writeHead(404);
      response.end('Not found');
    }
});
app.listen(3000);
