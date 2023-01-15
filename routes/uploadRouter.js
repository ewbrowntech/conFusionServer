const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (request, file, callback) => {
        callback(null, 'public/images');
    },
    filename: (request, file, callback) => {
        callback(null, file.originalname);
    }
});

const imageFileFilter = (request, file, callback) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return callback(new Error('You may only upload image files!'), null);
    }
    callback(null, true);
};

const upload = multer({storage: storage, fileFilter: imageFileFilter})

const uploadRouter = express.Router();
uploadRouter.use(bodyParser.json());

uploadRouter.route('/')
    .get((request, response,next) => {
        response.statusCode = 403;
        response.end('GET operation not supported on /imageUpload');
    })
    .post(authenticate.verifyUser, authenticate.verifyAdmin, upload.single('imageFile'), (request, response, next) => {
        response.statusCode = 200;
        response.setHeader('Content-Type', 'application/json');
        response.json(request.file);
    })
    .put(authenticate.verifyUser,  authenticate.verifyAdmin, (request, response, next) => {
        response.statusCode = 403;
        response.end('PUT operation not supported on /imageUpload');
    })
    .delete(authenticate.verifyUser, authenticate.verifyAdmin, (request, response, next) => {
        response.statusCode = 403;
        response.end('DELETE operation not supported on /imageUpload');
    });


module.exports = uploadRouter;