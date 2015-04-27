var express = require('express');
var router = express.Router();
var path = require('path');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'ChatApp' });
});

router.get('/javascripts/moment.js',function(req,res) {
	res.sendFile(path.join(__dirname,'../node_modules','moment','moment.js'));
});

module.exports = router;
