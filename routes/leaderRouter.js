const express = require('express');
const bodyParser = require('body-parser');
const Leaders = require('../models/leaders');
const authenticate = require('../authenticate');

const leaderRouter = express.Router();
leaderRouter.use(bodyParser.json());
leaderRouter.route('/')
    .get((request, response,next) => {
        Leaders.find({}).then((leaders) => {
            response.statusCode = 200;
            response.setHeader('Content-Type', 'application/json');
            response.json(leaders);
        }, (err) => next(err)).catch((err) => next(err));
    })
    .post(authenticate.verifyUser, (request, response, next) => {
        Leaders.create(request.body).then((leader) => {
            console.log("Leader created ", leader)
            response.statusCode = 200;
            response.setHeader('Content-Type', 'application/json');
            response.json(leader);
        }, (err) => next(err)).catch((err) => next(err));
    })
    .put(authenticate.verifyUser, (request, response, next) => {
        response.statusCode = 403;
        response.end('PUT operation not supported on /leaders');
    })
    .delete(authenticate.verifyUser, (request, response, next) => {
        Leaders.remove({}).then((resp) => {
            response.statusCode = 200;
            response.setHeader('Content-Type', 'application/json');
            response.json(resp);
        }, (err) => next(err)).catch((err) => next(err));
    });

// /leaders/:leaderID
leaderRouter.route('/:leaderId')
.get((request, response, next) => {
    Leaders.findById(request.params.leaderId).then((leader) => {
        response.statusCode = 200;
        response.setHeader('Content-Type', 'application/json')
        response.json(leader);
    }, (err) => next(err)).catch((err) => next(err));
})
.post(authenticate.verifyUser, (request, response, next) => {
    response.statusCode = 403;
    response.end("POST operation not supported on /leaders/" + request.params.leaderId);
})
.put(authenticate.verifyUser, (request, response, next) => {
    Leaders.findByIdAndUpdate(request.params.leaderId, {
        $set: request.body
    }, { new: true }).then((leader) => {
        response.statusCode = 200;
        response.setHeader('Content-Type', 'application/json');
        response.json(leader);
    }, (err) => next(err)).catch((err) => next(err));
})
.delete(authenticate.verifyUser, (request, response, next) => {
    Leaders.findByIdAndRemove(request.params.leaderId).then((resp) => {
        response.statusCode = 200;
        response.setHeader('Content-Type', 'application/json');
        response.json(resp);
    }, (err) => next(err)).catch((err) => next(err));
});

module.exports = leaderRouter;