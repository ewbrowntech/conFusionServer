const express = require('express');
const bodyParser = require('body-parser');
const Promotions = require('../models/promotions');
const authenticate = require('../authenticate');
const cors = require('./cors');

const promoRouter = express.Router();
promoRouter.use(bodyParser.json());
promoRouter.route('/')
    .options(cors.corsWithOptions, (request, response) => {response.sendStatus(200);})
    .get(cors.cors, (request, response,next) => {
        Promotions.find({}).then((promotions) => {
            response.statusCode = 200;
            response.setHeader('Content-Type', 'application/json');
            response.json(promotions);
        }, (err) => next(err)).catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (request, response, next) => {
        Promotions.create(request.body).then((promotion) => {
            console.log("Promotion created ", promotion)
            response.statusCode = 200;
            response.setHeader('Content-Type', 'application/json');
            response.json(promotion);
        }, (err) => next(err)).catch((err) => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (request, response, next) => {
        response.statusCode = 403;
        response.end('PUT operation not supported on /promotions');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (request, response, next) => {
        Promotions.remove({}).then((resp) => {
            response.statusCode = 200;
            response.setHeader('Content-Type', 'application/json');
            response.json(resp);
        }, (err) => next(err)).catch((err) => next(err));
    });

// /promotions/:promoID
promoRouter.route('/:promoId')
    .options(cors.corsWithOptions, (request, response) => {response.sendStatus(200);})
    .get(cors.cors, (request, response, next) => {
        Promotions.findById(request.params.promoId).then((promotion) => {
            response.statusCode = 200;
            response.setHeader('Content-Type', 'application/json')
            response.json(promotion);
        }, (err) => next(err)).catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (request, response, next) => {
        response.statusCode = 403;
        response.end("POST operation not supported on /promotions/" + request.params.promoId);
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (request, response, next) => {
        Promotions.findByIdAndUpdate(request.params.promoId, {
            $set: request.body
        }, { new: true }).then((promotion) => {
            response.statusCode = 200;
            response.setHeader('Content-Type', 'application/json');
            response.json(promotion);
        }, (err) => next(err)).catch((err) => next(err));
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (request, response, next) => {
        Promotions.findByIdAndRemove(request.params.promoId).then((resp) => {
            response.statusCode = 200;
            response.setHeader('Content-Type', 'application/json');
            response.json(resp);
        }, (err) => next(err)).catch((err) => next(err));
    });

module.exports = promoRouter;