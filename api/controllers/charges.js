'use strict';

var model = require('../models/index');
var stripe = require('../../config/stripe');
var express = require('express');
var router = express.Router();

// make a payment
router.post('/pay', function(req, res){
  var stripeToken = req.body.stripeToken;
  var amount = 1000;

  stripe.charges.create({
      card: stripeToken,
      currency: 'usd',
      amount: amount
  },
  function(err, charge) {
      if (err) {
          res.send(500, err);
      } else {
          res.send(204);
      }
  });
});

// begin/change/end subscription
router.post('/subscribe', function(req, res){

});

module.exports = router;
