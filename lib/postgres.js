const {Pool} = require('pg');
var cookie = require('cookie');
const bodyParser = require('body-parser')
var pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'metaverse',
  password: 'password',
  port: 5432 //postgres의 기본 포트인듯?
})


const getUsers = (request, response) => {
  
  pool.query('SELECT email, password, nickname, plan, design, development, marketting FROM users LEFT JOIN interests ON users.id = interests.id;', (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows);
  })
}

const getUserById = (request, response) => {
  const id = parseInt(request.params.id)

  pool.query('SELECT email, password, nickname, plan, design, development, marketting FROM users LEFT JOIN interests ON users.id = interests.id WHERE users.id=$1;', [id], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}


const createUser = (request, response) => {
  const { email, password, nickname} = request.body

  var interests			= [];// to storage clients

  if(request.body.check_plan)interests.push(true)
  else interests.push(false)

  if(request.body.check_design)interests.push(true);
  else interests.push(false)

  if(request.body.check_development)interests.push(true);
  else interests.push(false)

  if(request.body.check_marketting)interests.push(true);
  else interests.push(false)


  pool.query('INSERT INTO users (email, password, nickname) VALUES ($1, $2, $3);', 
  [email, password, nickname], (error, results) => {
    if (error) {
      throw error
    }
    pool.query('INSERT INTO interests (plan, design, development, marketting) VALUES ($1, $2, $3, $4);',
    [interests[0], interests[1], interests[2], interests[3]], (error2, results2) => {
      if(error2) {
        throw error2
      }
      response.status(302).redirect(`/`)
    }
    )
  })
}

const updateUser = (request, response) => {
  const id = parseInt(request.params.id)
  const { name, email } = request.body

  pool.query(
    'UPDATE users SET name = $1, email = $2 WHERE id = $3',
    [name, email, id],
    (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).send(`User modified with ID: ${id}`)
    }
  )
}

const deleteUser = (request, response) => {
  const id = parseInt(request.params.id)

  pool.query('DELETE FROM users WHERE id = $1', [id], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).send(`User deleted with ID: ${id}`)
  })
}

const checkSignin = (request, response) => {
  
  var post = request.body
  var email = post.email
  var password = post.password

  pool.query('SELECT * FROM users WHERE email = $1 AND password = $2', [email, password], function(error, results){
    if(error) {
      throw error
    }
    if(results.rows.length > 0) {
      response.cookie('email', `${email}`);
      response.cookie('password', `${password}`);
      response.status(302).redirect(`/`)
    } else {
      response.send(
        `<script>
          alert('Login Failed');
          location.href='/signin';
        </script>`
      );
    }
  });
}

const checkCookie = (req) => {
  if(req.headers.cookie === undefined){
    console.log("There is no cookie!"); 
  }
  else {
      var cookies = cookie.parse(req.headers.cookie);
      console.log(cookies);
      return true;
  }
}

const showHome = (req, res) => {
	res.render('home', {isSignedIn: db.checkCookie(req)});
}

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  checkSignin,
  checkCookie
}