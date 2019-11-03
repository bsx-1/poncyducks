var express = require('express');
var router = express.Router();

router.get('/message', function(req, res, next) {
  res.json('Tyler is a chungo');
});

module.exports = router;
