const express = require('express');
const bodyParser = require('body-parser');
const Dishes = require('../models/dishes');
const authenticate = require('../authenticate');

const dishRouter = express.Router();
dishRouter.use(bodyParser.json());

dishRouter.route('/')
    .get((request, response,next) => {
        Dishes.find({})
            .populate('comments.author')
            .then((dishes) => {
            response.statusCode = 200;
            response.setHeader('Content-Type', 'application/json');
            response.json(dishes);
        }, (err) => next(err)).catch((err) => next(err));
    })
    .post(authenticate.verifyUser, authenticate.verifyAdmin, (request, response, next) => {
        Dishes.create(request.body).then((dish) => {
        console.log("Dish created ", dish)
        response.statusCode = 200;
        response.setHeader('Content-Type', 'application/json');
        response.json(dish);
        }, (err) => next(err)).catch((err) => next(err));
    })
    .put(authenticate.verifyUser,  authenticate.verifyAdmin, (request, response, next) => {
        response.statusCode = 403;
        response.end('PUT operation not supported on /dishes');
    })
    .delete(authenticate.verifyUser, authenticate.verifyAdmin, (request, response, next) => {
        Dishes.remove({}).then((resp) => {
            response.statusCode = 200;
            response.setHeader('Content-Type', 'application/json');
            response.json(resp);
        }, (err) => next(err)).catch((err) => next(err));
    });

// /dishes/:dishID
dishRouter.route('/:dishId')
    .get((request, response, next) => {
        Dishes.findById(request.params.dishId)
            .populate('comments.author')
            .then((dishes) => {
            response.statusCode = 200;
            response.setHeader('Content-Type', 'application/json');
            response.json(dishes);
        }, (err) => next(err)).catch((err) => next(err));
    })
    .post(authenticate.verifyUser, authenticate.verifyAdmin, (request, response, next) => {
        response.statusCode = 403;
        response.end("POST operation not supported on /dishes/" + request.params.dishID);
    })
    .put(authenticate.verifyUser, authenticate.verifyAdmin, (request, response, next) => {
        Dishes.findByIdAndUpdate(request.params.dishId, {
            $set: request.body
        }, { new: true }).then((dish) => {
            response.statusCode = 200;
            response.setHeader('Content-Type', 'application/json');
            response.json(dish);
        }, (err) => next(err)).catch((err) => next(err));
    })
    .delete(authenticate.verifyUser, authenticate.verifyAdmin, (request, response, next) => {
        Dishes.findByIdAndRemove(request.params.dishId).then((resp) => {
            response.statusCode = 200;
            response.setHeader('Content-Type', 'application/json');
            response.json(resp);
        }, (err) => next(err)).catch((err) => next(err));
    });


// COMMENTS
dishRouter.route('/:dishId/comments')
    .get((request, response,next) => {
        Dishes.findById(request.params.dishId)
            .populate('comments.author')
            .then((dish) => {
            if (dish != null) {
                response.statusCode = 200;
                response.setHeader('Content-Type', 'application/json');
                response.json(dish.comments);
            } else {
                err = new Error('Dish ' + request.params.dishId + ' not found.');
                err.status = 404;
                return next(err);
            }
        }, (err) => next(err)).catch((err) => next(err));
    })
    .post(authenticate.verifyUser, (request, response, next) => {
        Dishes.findById(request.params.dishId).then((dish) => {
            if (dish != null) {
                request.body.author = request.user._id;
                dish.comments.push(request.body)
                dish.save().then(dish => {
                    Dishes.findById(dish._id).populate('comments.author').then((dish) => {
                        response.statusCode = 200;
                        response.setHeader('Content-Type', 'application/json');
                        response.json(dish);
                    })
                }, (err) => next(err))
            } else {
                let err = new Error('Dish ' + request.params.dishId + ' not found.');
                err.status = 404;
                return next(err);
            }
        }, (err) => next(err)).catch((err) => next(err));
    })
    .put(authenticate.verifyUser, (request, response, next) => {
        response.statusCode = 403;
        response.end('PUT operation not supported on /dishes/' + request.params.dishId + '/comments');
    })
    .delete(authenticate.verifyUser, authenticate.verifyAdmin, (request, response, next) => {
        Dishes.findById(request.params.dishId).then((dish) => {
            if (dish != null) {
                for (var i = (dish.comments.length - 1); i >= 0; i--) {
                    dish.comments.id(dish.comments[i]._id).remove();
                }
                dish.save().then((dish) => {
                    response.statusCode = 200;
                    response.setHeader('Content-Type', 'application/json');
                    response.json(dish);
                })
            } else {
                err = new Error('Dish ' + request.params.dishId + ' not found.');
                err.status = 404;
                return next(err);
            }
        }, (err) => next(err)).catch((err) => next(err));
    });

// /dishes/:dishID
dishRouter.route('/:dishId/comments/:commentId')
    .all((request, response, next) => {
        Dishes.findById(request.params.dishId)
            .then((dish) => {
            if (dish == null) {
                err = new Error('Dish ' + request.params.dishId + ' not found.');
                err.status = 404;
                return next(err);
            }
            else if (dish.comments.id(request.params.commentId) == null) {
                err = new Error('Comment ' + request.params.commentId + ' not found.');
                err.status = 404;
                console.log("Throw error")
                return next(err);
            }
        }, (err) => next(err)).catch((err) => next(err));
        next()
    })
    .get((request, response, next) => {
        Dishes.findById(request.params.dishId).then((dish) => {
            response.statusCode = 200;
            response.setHeader('Content-Type', 'application/json');
            response.json(dish.comments.id(request.params.commentId));
        }, (err) => next(err)).catch((err) => next(err));
    })
    .post(authenticate.verifyUser, (request, response, next) => {
        response.statusCode = 403;
        response.end("POST operation not supported on /dishes/" + request.params.dishId + "/commments/"
            + request.params.commentId);
    })
    .put(authenticate.verifyUser, (request, response, next) => {
        Dishes.findById(request.params.dishId)
            .populate('comments.author')
            .then((dish) => {
            if (!(request.user._id.equals(dish.comments.id(request.params.commentId).author._id))) {
                let err = new Error('You are not authorized to perform this operation!');
                err.status = 403;
                return next(err);
            }
            if (request.body.rating) {
                dish.comments.id(request.params.commentId).rating = request.body.rating;
            }
            if (request.body.comment) {
                dish.comments.id(request.params.commentId).comment = request.body.comment;
            }
            dish.save().then((dish) => {
                Dishes.findById(dish._id)
                .populate('comments.author')
                .then((dish) => {
                    response.statusCode = 200;
                    response.setHeader('Content-Type', 'application/json');
                    response.json(dish);
                });
            }, (err) => next(err))
        });
    })
    .delete(authenticate.verifyUser, (request, response, next) => {
        Dishes.findById(request.params.dishId).then((dish) => {
            if (!(request.user._id.equals(dish.comments.id(request.params.commentId).author._id))) {
                let err = new Error('You are not authorized to perform this operation!');
                err.status = 403;
                return next(err);
            }
            dish.comments.id(request.params.commentId).remove();
            dish.save().then((dish) => {
                Dishes.findById(dish._id)
                    .populate('comments.author')
                    .then((dish) => {
                        response.statusCode = 200;
                        response.setHeader('Content-Type', 'application/json');
                        response.json(dish);
                    });
            })
        }, (err) => next(err)).catch((err) => next(err));
    });

module.exports = dishRouter;

