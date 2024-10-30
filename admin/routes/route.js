//route.js
var express = require('express');
var admin = require('../controllers/admin');
var router = express.Router();

router.post('/brigadas', admin.brigadas)

module.exports = router;