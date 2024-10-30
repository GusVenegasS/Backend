'use strict'
//app.js
const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const routes = require('./routes/route');

app.use(cors());
app.options('*', cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'PATCH, POST, GET, PUT, DELETE, OPTIONS');
    res.header('Allow', 'PATCH, POST, GET, PUT, DELETE, OPTIONS');
    next();
});

app.use('', routes);

module.exports = app;
