const express = require('express');
const app = express();

app.set('view engine', 'jade')
app.set('views', './views')

const db = require('./queries')

app.get('/', (req, res) => {
    res.render('home', {title : 'JADE PRACTICE'});
    db.getUsers(); 
    }
);

app.listen(3000, () => console.log('Example app listening on port 3000!'));
