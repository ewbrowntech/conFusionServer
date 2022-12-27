const express = require('express');
const bodyParser = require('body-parser');

const promoRouter = express.Router();
promoRouter.use(bodyParser.json());
promoRouter.route('/')
    .all((request, response, next) => {
        response.statusCode = 200;
        response.setHeader('Content-Type', 'text/plain');
        next();
    })
    .get((request, response,next) => {
        console.log("test")
        response.end("Will send all the promotions to you!")
    })
    .post((request, response, next) => {
        response.end('Will add the promotion: ' + request.body.name +
            ' with details: ' + request.body.description);
    })
    .put((request, response, next) => {
        response.statusCode = 403;
        response.end('PUT operation not supported on /promotions');
    })
    .delete((request, response, next) => {
        response.end('Deleting all of the promotions!');
    });

// /promotions/:promoID
promoRouter.get('/:promoID', (request, response, next) => {
    response.end("Will send details of the promotion: " + request.params.promoID);
});
promoRouter.post('/:promoID', (request, response, next) => {
    response.statusCode = 403;
    response.end("POST operation not supported on /promotions/" + request.params.promoID);
});
promoRouter.put('/:promoID', (request, response, next) => {
    response.write("Updating the promotion: " + request.params.promoID + "\n");
    response.end("Will update the promotion: " + request.body.name
        + " with details: " + request.body.description);
});
promoRouter.delete('/:promoID', (request, response, next) => {
    response.end("Deleting promotion: " + request.params.promoID);
});
module.exports = promoRouter;