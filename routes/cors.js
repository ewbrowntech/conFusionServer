const express = require('express');
const cors = require('cors');
const app = express();

const whitelist = ['http://localhost:3000', 'https://localhost:3443'];
let corsOptionsDelegate = (request, callback) => {
    let corsOptions;
    if (whitelist.indexOf(request.header('Origin')) !== -1) {
        corsOptions = { origin: true };
    } else {
        corsOptions = { origin: false };
    }
    callback(null, corsOptions)
};

exports.cors = cors();
exports.corsWithOptions = cors(corsOptionsDelegate);