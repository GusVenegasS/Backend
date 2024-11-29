//route.js
var express = require('express');
var admin = require('../controllers/admin');
var router = express.Router();

router.post('/crearPeriodo', admin.brigadas);
router.get('/obtenerBrigadas', admin.obtenerBrigadas);
router.get('/usuarios', admin.obtenerUsuarios);
router.get('/verTarea', admin.obtenerTarea);
router.get('/verificarPeriodo', admin.verificarPeriodo);

module.exports = router;