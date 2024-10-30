'use strict'
//index.js
const config = require('./config');
const app = require('./app');
const db = require('./db');

const port = config.getPort();

db.connect(config.getDB(), function (err) {
    if (err) {
        return console.log(err)
    } else {
        console.log("conexión exitosa");
        app.listen(port, function () {
            console.log("Servidor rest corriendo en: " + port)
        })
    }
});