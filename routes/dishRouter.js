const express = require('express');
const bodyParser = require('body-parser');
const Dishes = require('../models/dishes');

const dishRouter = express.Router();
dishRouter.use(bodyParser.json());

dishRouter.route('/')
.get((request, response,next) => {
    console.log("test")
    Dishes.find({}).then((dishes) => {
        response.statusCode = 200;
        response.setHeader('Content-Type', 'application/json');
        response.json(dishes);
    }, (err) => next(err)).catch((err) => next(err));
})
.post((request, response, next) => {
    Dishes.create(request.body).then((dish) => {
        console.log("Dish created ", dish)
        response.statusCode = 200;
        response.setHeader('Content-Type', 'application/json');
        response.json(dish);
    }, (err) => next(err)).catch((err) => next(err));
})
.put((request, response, next) => {
    response.statusCode = 403;
    response.end('PUT operation not supported on /dishes');
})
.delete((request, response, next) => {
    Dishes.remove({}).then((resp) => {
        response.statusCode = 200;
        response.setHeader('Content-Type', 'application/json');
        response.json(resp);
    }, (err) => next(err)).catch((err) => next(err));
});

// /dishes/:dishID
dishRouter.route('/:dishId')
.get((request, response, next) => {
    Dishes.findById(request.params.dishId).then((dishes) => {
        response.statusCode = 200;
        response.setHeader('Content-Type', 'application/json');
        response.json(dishes);
    }, (err) => next(err)).catch((err) => next(err));
})
.post((request, response, next) => {
    response.statusCode = 403;
    response.end("POST operation not supported on /dishes/" + request.params.dishID);
})
.put((request, response, next) => {
    Dishes.findByIdAndUpdate(request.params.dishId, {
        $set: request.body
    }, { new: true }).then((dish) => {
        response.statusCode = 200;
        response.setHeader('Content-Type', 'application/json');
        response.json(dish);
    }, (err) => next(err)).catch((err) => next(err));
})
.delete((request, response, next) => {
    Dishes.findByIdAndRemove(request.params.dishId).then((resp) => {
        response.statusCode = 200;
        response.setHeader('Content-Type', 'application/json');
        response.json(resp);
    }, (err) => next(err)).catch((err) => next(err));
});

module.exports = dishRouter;