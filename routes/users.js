let express = require('express');
const bodyParser = require('body-parser');
let User = require('../models/user');
var passport = require('passport');
let authenticate = require('../authenticate');

let router = express.Router();
router.use(bodyParser.json())

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/signup', function(request, response, next) {
  User.register(new User({username: request.body.username}), request.body.password, (err, user) => {
    if (err) {
      response.statusCode = 500;
      response.setHeader('Content-Type', 'application/json');
      response.json({err: err});
    } else {
      passport.authenticate('local')(request, response, () => {
        response.statusCode = 200;
        response.setHeader('Content-Type', 'application/json');
        response.json({success: true, status: 'Registration successful!'});
      });
    }
  })
});

router.post('/login', passport.authenticate('local'), (request, response) => {
  let token = authenticate.getToken({_id: request.user._id});
  response.statusCode = 200;
  response.setHeader('Content-Type', 'application/json');
  response.json({success: true, token: token, status: 'Login successful!'});
});

// router.get('/logout', (request, response, next) => {
//   if (request.session) {
//     console.log(request.session);
//     request.session.destroy();
//     response.clearCookie('session-id');
//     response.setHeader('Content-Type', 'text/plain');
//     response.end('See you later!');
//   } else {
//     let err = new Error('You are not logged in!');
//     err.status = 403;
//     next(err);
//   }
// });

module.exports = router;
