const express = require('express');
const bodyParser = require('body-parser');

const dishRouter = express.Router();
dishRouter.use(bodyParser.json());
dishRouter.route('/')
.all((request, response, next) => {
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/plain');
    next();
})
.get((request, response,next) => {
    console.log("test")
    response.end("Will send all the dishes to you!")
})
.post((request, response, next) => {
    response.end('Will add the dish: ' + request.body.name +
        ' with details: ' + request.body.description);
})
.put((request, response, next) => {
    response.statusCode = 403;
    response.end('PUT operation not supported on /dishes');
})
.delete((request, response, next) => {
    response.end('Deleting all of the dishes!');
});

// /dishes/:dishID
dishRouter.get('/:dishID', (request, response, next) => {
    response.end("Will send details of the dish: " + request.params.dishID);
});
dishRouter.post('/:dishID', (request, response, next) => {
    response.statusCode = 403;
    response.end("POST operation not supported on /dishes/" + request.params.dishID);
});
dishRouter.put('/:dishID', (request, response, next) => {
    response.write("Updating the dish: " + request.params.dishID + "\n");
    response.end("Will update the dish: " + request.body.name
        + " with details: " + request.body.description);
});
dishRouter.delete('/:dishID', (request, response, next) => {
    response.end("Deleting dish: " + request.params.dishID);
});
module.exports = dishRouter;