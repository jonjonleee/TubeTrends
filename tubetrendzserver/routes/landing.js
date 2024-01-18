var express = require('express');
var router = express.Router();

/* GET Landing  page. */
router.get('/', function(req, res, next) {
    if (req.session.authorized) {
      return res.redirect('/trends');
    }
    else{
      return res.render('landing');
    }
  });

module.exports = router;
