'use strict';

var model = require('../models/index');
var auth = require('../helpers/auth');
var stripe = require('../../config/stripe');
var express = require('express');
var router = express.Router();

// create stripe customer from card token
router.put('/customer', function(req, res){
  stripe.customers.create({
    source: req.body.token,
    email: req.user.email,
    description: req.body.updateIp
  }).then(function(customer) {
    req.body.customerId = customer.id
    req.body.cardId = customer.sources.data[0].id
    model.User.findOne({
      where:{id:req.user.id}
    }).then(function(user){
      user.update(req.body).then(function(user){
        req.user = user.dataValues; delete req.user.password;
        auth.update(req.user, null, req.body).then(function(resp){
          res.status(200).send(resp);
        }).catch(function(err){console.log(err)});
      }).catch(function(err){console.log(err)});
    }).catch(function(err){console.log(err)});
  }).catch(function(err){
    console.log(err)
    res.status(400).send('couldn\'t create/update customer');
  })
})

// add/change card
router.put('/card', function(req, res){
  model.User.findOne({
    where:{id:req.user.id}
  }).then(function(user){
    if(req.user.cardId){
      // if a card id exists, then update its attributes
      stripe.customers.updateCard(
        req.user.customerId,
        req.user.cardId,
        req.body,
        function(err, card) {
          if(!err){
            req.body.cardId = card.id;
            req.body.exp = pad(card.exp_month)+'/'+card.exp_year;
            user.update(req.body).then(function(user){
              req.user = user.dataValues; delete req.user.password; req.body.type = 'card';
              auth.update(req.user, null, req.body).then(function(resp){
                res.status(200).send(resp);
              }).catch(function(err){console.log(err)});
            }).catch(function(err){console.log(err)});
          } else {console.log(err)}
        }
      );
    } else {
      // if no card exists, create a new one
      stripe.customers.createSource(
        req.user.customerId,
        {source: req.body.token},
        function(err, card) {
          if(!err){
            req.body.last4 = card.last4;
            req.body.zip = card.address_zip;
            req.body.exp = pad(card.exp_month)+'/'+card.exp_year;
            stripe.customers.update(req.user.customerId, {
              default_source: card.id
            }, function(err, customer) {
              if(!err){
                req.body.type = 'card';
                req.body.cardId = customer.default_source;
                user.update(req.body).then(function(user){
                  req.user = user.dataValues; delete req.user.password;
                  auth.update(req.user, null, req.body).then(function(resp){
                    res.status(200).send(resp);
                  }).catch(function(err){console.log(err)});
                }).catch(function(err){console.log(err)});
              } else {console.log(err)}
            });
          } else {console.log(err)}
        }
      );
    }
  }).catch(function(err){console.log(err)});
})

// delete credit card from database
router.delete('/card', function(req, res){
  model.User.findOne({
    where:{id:req.user.id}
  }).then(function(user){
    user.update({
      cardId:null,
      last4:null,
      card:null,
      exp:null
    }).then(function(user){
      req.body.type = 'card';
      req.user = user.dataValues; delete req.user.password;
      auth.update(req.user, null, req.body).then(function(resp){
        res.status(200).send(resp);
      }).catch(function(err){console.log(err)});
    })
  }).catch(function(err){console.log(err)})
})

// single zero padding for months
function pad(n) {
  return (n < 10) ? ("0" + n) : n;
}

module.exports = router;
