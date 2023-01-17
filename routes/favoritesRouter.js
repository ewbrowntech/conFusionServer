const express = require('express');
const bodyParser = require('body-parser');
const Favorites = require('../models/favorite');
const authenticate = require('../authenticate');
const cors = require('./cors');
const Dishes = require("../models/dishes");

const favoritesRouter = express.Router();
favoritesRouter.use(bodyParser.json());

favoritesRouter.route('/')
    .options(cors.corsWithOptions, (request, response) => {response.sendStatus(200);})
    .get(cors.cors, authenticate.verifyUser, (request, response, next) => {
        Favorites.findOne({ 'user': request.user })
        .populate('user').populate('dishes')
        .then((list) => {
            if (list != null) {
                response.statusCode = 200;
                response.setHeader('Content-Type', 'application/json');
                response.json(list);
            } else {
                let err = new Error('List belonging to ' + request.user.username + ' not found.');
                err.status = 404;
                return next(err);
            }
        }, (err) => next(err)).catch((err) => next(err));
    })
    .post(cors.cors, authenticate.verifyUser, (request, response, next) => {
        Favorites.findOne({ 'user': request.user })
            .populate('user').populate('dishes')
            .then((list) => {
                if (list != null) {
                    Favorites.findByIdAndUpdate(list._id, { $push: { dishes: { $each: request.body } } }, {new: true}, (err, list) => {
                        if (err) return next(err);
                        list.save().then((list) => {
                            Favorites.findById(list._id).populate('user').populate('dishes').then((list) => {
                                console.log(list);
                                response.statusCode = 200;
                                response.setHeader('Content-Type', 'application/json');
                                response.json(list);
                            });
                        }, (err) => next(err));
                    });
                } else {
                    Favorites.create({'user': request.user}).then((list) => {
                        Favorites.findOneAndUpdate({'user': request.user}, { $push: { dishes: { $each: request.body } } }, {new: true}, (err, list) => {
                            if (err) return next(err);
                            list.save().then((list) => {
                                Favorites.findById(list._id).populate('user').populate('dishes').then((list) => {
                                    console.log(list);
                                    response.statusCode = 200;
                                    response.setHeader('Content-Type', 'application/json');
                                    response.json(list);
                                });
                            }, (err) => next(err));
                        });
                    });
                }
            }, (err) => next(err)).catch((err) => next(err));
    })
    .put(cors.cors, authenticate.verifyUser, (request, response, next) => {
        response.statusCode = 403;
        response.end("PUT operation not supported on /favorites");
    })
    .delete(cors.cors, authenticate.verifyUser, (request, response, next) => {
        Favorites.findOneAndDelete({ 'user': request.user }).then((resp) => {
            response.statusCode = 200;
            response.setHeader('Content-Type', 'application/json');
            response.json(resp);
        }, (err) => next(err)).catch((err) => next(err));
    });

favoritesRouter.route('/:dishId')
    .options(cors.corsWithOptions, (request, response) => {response.sendStatus(200);})
    .all((request, response, next) => {
        Dishes.findById(request.params.dishId).then((dish) => {
            if (dish == null) {
                let err = new Error('Dish ' + request.params.dishId + ' not found.');
                err.status = 404;
                return next(err);
                }
            }, (err) => next(err)).catch((err) => next(err));
        next();
    })
    .get(cors.cors, authenticate.verifyUser, (request, response, next) => {
        response.statusCode = 403;
        response.end("GET operation not supported on /favorites");
    })
    .post(cors.cors, authenticate.verifyUser, (request, response, next) => {
        Favorites.findOne({'user': request.user}).then((list) => {
            if (list != null) {
                list.dishes.push(request.params.dishId);
                list.save().then((list) => {
                    Favorites.findById(list._id).populate('user').populate('dishes').then((list) => {
                        response.statusCode = 200;
                        response.setHeader('Content-Type', 'application/json');
                        response.json(list);
                    })
                }, (err) => next(err))
            } else {
                let err = new Error('List belonging to ' + request.user.username + ' not found.');
                err.status = 404;
                return next(err);
            }
        }, (err) => next(err)).catch((err) => next(err));
    })
    .put(cors.cors, authenticate.verifyUser, (request, response, next) => {
        response.statusCode = 403;
        response.end("PUT operation not supported on /favorites");
    })
    .delete(cors.cors, authenticate.verifyUser, (request, response, next) => {
        Favorites.findOne({'user': request.user}).then((list) => {
            if (list != null) {
                Favorites.updateOne({'_id': list._id}, { $pull: { dishes: request.params.dishId } }, (err, list) => {
                    Favorites.findOne({'user': request.user}).then((list) => {
                        response.statusCode = 200;
                        response.setHeader('Content-Type', 'application/json');
                        response.json(list);
                    })
                });
            } else {
                let err = new Error('List belonging to ' + request.user.username + ' not found.');
                err.status = 404;
                return next(err);
            }
        }, (err) => next(err)).catch((err) => next(err));
    });


module.exports = favoritesRouter;