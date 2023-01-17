const fs = require('fs');

module.exports = {
    'secretKey': fs.readFileSync(__dirname + '/keys/auth-secret-key', 'utf-8'),
    'mongoUrl': fs.readFileSync(__dirname + '/keys/mongo-url', 'utf-8'),
    'facebook': {
        clientID: fs.readFileSync(__dirname + '/keys/fb-client-id', 'utf-8'),
        clientSecret: fs.readFileSync(__dirname + '/keys/fb-client-secret', 'utf-8')
    }
}