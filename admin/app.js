const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const routes = require('./routes/route');

// Usa el middleware de CORS
app.use(cors());
app.options('*', cors()); // Esto es necesario para manejar las peticiones OPTIONS

// Configuración de body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rutas
app.use('', routes);

module.exports = app;
