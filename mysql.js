var mysql = require('mysql'); //mysql 모듈을 불러와서, 변수 mysql에 넣는다
var connection = mysql.createConnection({ //conection을 생성한다
  host     : 'localhost', //node.js 서버와 mysql 서버가 같은 곳에 있음
  user     : 'root',
  password : 'password',
  database : 'testsql' //사용할 데이터베이스
});

connection.connect();

connection.query('SHOW TABLES;', function (err, result) { //첫번째 인자는 sql 구문, 뒤는 callback 함수
    //콜백함수에서 첫번재 인자는 에러가 발생할 경우에 할당되고, 두번째 인자는 sql 구문을 실행한 결과가 들어오도록 되어있다
  if(err) console.log(failed);
  console.log(result);
});

connection.end();
