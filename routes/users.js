let express = require('express');
const bodyParser = require('body-parser');
let User = require('../models/user');
let router = express.Router();
router.use(bodyParser.json())

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/signup', function(request, response, next) {
  User.findOne({ username: request.body.username}).then((user) => {
    if (user != null) {
      let err = new Error('User ' + request.body.username + ' already exists!');
      err.status = 403;
      next(err);
    } else {
      return User.create({username: request.body.username, password: request.body.password});
    }
  }).then((user) => {
    response.statusCode = 200;
    response.setHeader('Content-Type', 'application/json');
    response.json({ status: 'Registration successful!', user: user });
  }, (err) => next(err)).catch((err) => next(err));
});

router.post('/login', (request, response, next) => {
  if (!request.session.user) {
    let authHeader = request.headers.authorization;

    if (!authHeader) {
      console.log("No auth header")
      let err = new Error('You are not authenticated!');
      response.setHeader('WWW-Authenticate', 'Basic');
      err.status = 401;
      return next(err);
    }
    let auth = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    let username = auth[0];
    let password = auth[1];

    console.log("Login attempt")
    User.findOne({username: username}).then((user) => {
      console.log(user)
      if (user === null) {
        let err = new Error('User ' + username + ' does not exist!');
        err.status = 403;
        return next(err);
      }
      else if (user.password !== password) {
        let err = new Error('Incorrect password!');
        err.status = 403;
        return next(err);
      }
      else if (user.username === username && user.password === password) {
        request.session.user = 'authenticated';
        response.statusCode = 200;
        response.setHeader('Content-Type', 'text/plain');
        response.end('You are authenticated!');
        console.log("Login successful");
      }
    }).catch((err) => next(err));
  }
  else {
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/plain');
    response.end('You are already authenticated!');
  }
});

router.get('/logout', (request, response, next) => {
  if (request.session) {
    console.log(request.session);
    request.session.destroy();
    response.clearCookie('session-id');
    response.setHeader('Content-Type', 'text/plain');
    response.end('See you later!');
  } else {
    let err = new Error('You are not logged in!');
    err.status = 403;
    next(err);
  }
});

module.exports = router;
