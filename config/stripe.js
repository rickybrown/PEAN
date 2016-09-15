var stripe = require("stripe")(process.env.stripe_sk);

module.exports = stripe;
