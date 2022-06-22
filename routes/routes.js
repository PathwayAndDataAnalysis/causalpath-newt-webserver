const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
    res.render('index', {title: 'CausalPath Webserver'});
});

// Network Diagram
router.get('/graph', (req, res, next) => {
    res.render('graph', {title: "Graph Network"});
});

module.exports = router;
