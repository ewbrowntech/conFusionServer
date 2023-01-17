let express = require('express');
const bodyParser = require('body-parser');
let User = require('../models/user');
var passport = require('passport');
let authenticate = require('../authenticate');
let cors = require('./cors');

let router = express.Router();
router.use(bodyParser.json())

/* GET users listing. */
router.get('/', cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (request, response, next) => {
  User.find({})
      .then((users) => {
        response.statusCode = 200;
        response.setHeader('Content-Type', 'application/json');
        response.json(users);
      }, (err) => next(err)).catch((err) => next(err));
});

router.post('/signup', cors.corsWithOptions, function(request, response, next) {
  User.register(new User({username: request.body.username}), request.body.password, (err, user) => {
    if (err) {
      response.statusCode = 500;
      response.setHeader('Content-Type', 'application/json');
      response.json({err: err});
    } else {
      if (request.body.firstname) { user.firstname = request.body.firstname }
      if (request.body.lastname) { user.lastname = request.body.lastname }
      user.save((err, user) => {
        passport.authenticate('local')(request, response, () => {
          if (err) {
            response.statusCode = 500;
            response.setHeader('Content-Type', 'application/json');
            response.json({err: err});
            return
          }
          response.statusCode = 200;
          response.setHeader('Content-Type', 'application/json');
          response.json({success: true, status: 'Registration successful!'});
        });
      });
    }
  })
});

router.post('/login', cors.corsWithOptions, passport.authenticate('local'), (request, response) => {
  let token = authenticate.getToken({_id: request.user._id});
  response.statusCode = 200;
  response.setHeader('Content-Type', 'application/json');
  response.json({success: true, token: token, status: 'Login successful!'});
});

router.get('/facebook/token', passport.authenticate('facebook-token'), (request, response) => {
  if (request.user) {
    let token = authenticate.getToken({_id: request.user._id});
    response.statusCode = 200;
    response.setHeader('Content-Type', 'application/json');
    response.json({success: true, token: token, status: 'Login successful!'});
  }
});

module.exports = router;
