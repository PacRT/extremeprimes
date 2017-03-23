'use strict';
const booking = require('./booking');
const orderitem = require('./orderitem');
const order = require('./order');
const sku = require('./sku');
const product = require('./product');
const authentication = require('./authentication');
const user = require('./user');
const Sequelize = require('sequelize');

var pino = require('pino')()

module.exports = function () {
  const app = this;

  const sequelize = new Sequelize(app.get('postgres'), {
    dialect: 'postgres',
    logging: false
  });
  app.set('sequelize', sequelize);

  app.configure(authentication);
  app.configure(user);
  app.configure(sku);
  app.configure(product);
  app.configure(booking);
  app.configure(order);
  app.configure(orderitem);

  app.set('view engine', 'ejs');

  app.set('models', sequelize.models);

  // Setup relationships
  const models = sequelize.models;
  Object.keys(models)
    .map(name => models[name])
    .filter(model => model.associate)
    .forEach(model => model.associate(models));

  sequelize.sync({force: false});

  app.get('/content-right', function (req, res) {
    pino.info("req.query: ", req.query)
    if (req.query.mfr != null) {
      sequelize.models.skus.findAll({
        where: {
          manufacturer: req.query.mfr
        }
      }).then(function (skus) {
        if (skus.length > 0) res.render('partials/content-right', {skus: skus});
        else
          res.render('partials/content-right', {skus: []});
      })
    } else if (req.query.cat != null) {
      sequelize.models.skus.findAll({
        where: {
          category: req.query.cat
        }
      }).then(function (skus) {
        if (skus.length > 0)
          res.render('partials/content-right', {skus: skus});
        else
          res.render('partials/content-right', {skus: []});
      })
    } else {
      sequelize.models.skus.findAll().then(function (skus) {
        res.render('partials/content-right', {skus: skus});
      })
    }
  });

  app.get('/', function (req, res) {
    sequelize.models.skus.findAll().then(function (skus) {
      app.render('pages/index', {skus: skus}, function (err, data) {
        res.send(data);
      });
    });
  });

  app.get('/index', function (req, res) {
    sequelize.models.skus.findAll().then(function (skus) {
      app.render('pages/index', {skus: skus}, function (err, data) {
        res.send(data);
      });
    });
  });

  app.get('/product_details', function (req, res) {
    pino.info('req.query.sku: ', req.query.sku)
    if (req.query.sku == null) {
      // render the error page
      res.render('pages/error-page')
    } else {
      sequelize.models.skus.findByPrimary(req.query.sku).then(function (sku) {
        if(sku != null)
          res.render('pages/product_details_complete', {sku: sku});
        else
          res.render('pages/error-page')
      })
    }
  });

  app.get('/contact', (req, res) => {
    res.render('pages/contact')
  })

  function findBookings(skuid, startdate, enddate, cb) {
    pino.info('skuid: ', skuid);
    var availableproducts = {
      skuid: skuid,
      startdate: startdate,
      enddate: enddate,
      serialNos: []
    }
    sequelize.models.products.findAll({where: {skuId: skuid}}).then((products) => {
      pino.info('Products length: ', products.length);
      products.map(function (product) {
        sequelize.models.bookings.findAll({where: {productSerialno: product.serialno}}).then(function (bookings) {
          if (bookings.length == 0) { // that means no booking made for the serialNo - and is available
            return [true];
          } else {
            return bookings.map((booking) => {
              if (new Date(startdate) > dateWithOffset(booking.shippingdate, -2) && new Date(startdate) < dateWithOffset(booking.returndate, 2)) {
                return false;
              } else if (new Date(enddate) > dateWithOffset(booking.shippingdate, -2) && new Date(enddate) < dateWithOffset(booking.returndate, 2)) {
                return false;
              } else {
                return true;
              }
            });
          }
        }).then((returnedfromlast) => {
          var reducedResult = returnedfromlast.reduce((acc, el) => {return acc & el}); // result is 0 or 1
          if(reducedResult) {
            availableproducts.serialNos.push(product.serialno);
          }
          return availableproducts;
        });
      });
    });
    setTimeout(() => {cb(availableproducts)}, 1000);
  }

  function dateWithOffset(date_, offset) {
    var date = new Date(date_)
    return new Date(date.setDate(date.getDate() + offset));
  }

  app.get('/product_details_test', function (req, res) {
    pino.info('req.query.sku: ', req.query.sku)
    var sku = {
      img: 'images/omd_em1_m2.jpg',
      img_back: 'images/omd_em1_m2_back.jpg',
      id: "whatever0",
      name: 'Olympus OMD EM1 Mark II',
      orig_price: '1990.00',
      price: '1890.00',
      rating: '5'
    };
    res.render('pages/product_details_complete', {sku: sku});
  });

  app.post('/stripe-pay', function (req, res) {
    pino.info('Trying to process the ceredit card')
    pino.info('/stripe-pay request body: ', req.body)
    var stripe = require("stripe")("sk_test_WLDZYqObDG3iCDmgSGWDjmRN");
    var token = req.body.stripeToken;
    // Charge the user's card:
    var chargeObj = {
      amount: Number(req.body.charge_amount)*100, // Be careful. Stripe charges in cents
      currency: "usd",
      description: "Example charge",
      source: token,
      receipt_email: req.body.card_holders_email, // This is to send email receipt to the customer - dashboard configuration is needed
      metadata: {
        card_holders_name: req.body.card_holders_name,
        card_holders_email: req.body.card_holders_email,
        card_holders_phone: req.body.card_holders_phone
      }
    };
    if(req.body.shipping_address_checkbox == 'checked') {
      chargeObj.metadata.addressline1 = req.body.address_line1,
      chargeObj.metadata.addressline2 = req.body.address_line2,
      chargeObj.metadata.city = req.body.address_city,
      chargeObj.metadata.state = req.body.address_state,
      chargeObj.metadata.zip = req.body.address_zip
    }
    var charge = stripe.charges.create(chargeObj, function (err, charge) {
      // asynchronously called
      if (err) {
        // TODO: there is something wrong take care of it
        pino.info('Error processinfg credit card', err);
        //res.send({res: 'error', code: JSON.stringify(err)});
        res.render('pages/error-page')
      } else {
        pino.info('Success processinfg credit card');
        pino.info('charge object:', charge);
        //Now create the order
        sequelize.models.orders.create({
          name: req.body.card_holders_name,
          email: req.body.card_holders_email,
          phone: req.body.card_holders_phone,
          shipping_address: JSON.stringify(chargeObj.metadata),
          billing_address: JSON.stringify({
            addressline1: charge.source.address_line1,
            addressline2: charge.source.address_line2,
            city: charge.source.address_city,
            state: charge.source.address_state,
            zip: charge.source.address_zip
          }),
          text: JSON.stringify(charge),
        }).then((order)=> {
          //When Order is created - create orderitems
          var emailstring = "Hello " + chargeObj.metadata.card_holders_name + "!\nPlease find your order details below." +
            "\n\nOrder Id: " + order.id +
            "\n-----------------\n\n" +
            "Item\t\tDate Range\t\t\tPrice\n"
          var cart_items = req.body.cart_items;
          cart_items.map((c_item) => {
            pino.info('>>>> cart_item: ' + c_item);
            var cart_item = JSON.parse(c_item);
            emailstring = emailstring + cart_item.sku_name +
              "\t" + cart_item.date_range +
              "\t$" + cart_item.you_pay + "\n";
            sequelize.models.orderitems.create({
              orderId: order.id,
              skuId: cart_item.sku_id,
              quantity: cart_item.quantity
            }).then((item) => {
              pino.info('Order Item created: ', JSON.stringify(item));
              // Time to update the booking table
              findBookings(cart_item.sku_id, cart_item.startdate, cart_item.enddate, (available_products) => {
                sequelize.models.bookings.create({
                  productSerialno: available_products.serialNos[0],
                  shippingdate: cart_item.startdate,
                  returndate: cart_item.enddate
                }).then((booking) => {
                  pino.info('Booking created :', JSON.stringify(booking));
                });
              })
            });
          });
          //TODO: send email
          var addr_obj = (req.body.shipping_address_checkbox == 'checked') ? chargeObj.metadata : JSON.parse(order.billing_address)
          emailstring = emailstring + "\n---------------------\n" +
            "Shipping Charge: $25" +
            "\nTotal: \t" +req.body.charge_amount +
            "\n\nShipping Address: " +
            "\n" + addr_obj.addressline1 +
            "\n" + addr_obj.addressline2 +
            "\n" + addr_obj.city +
            "\n" + addr_obj.state + " " +addr_obj.zip +
            "\n\nShipping confirmation and tracking information will be sent once we ship" +
            "\n\nAlway quote the order id " + order.id + " for any future communication" +
            "\n\nThanks,\nTeam ExtremePrimes";
          pino.info("emailstring: \n", emailstring);
          require('./twilio-sms').sendSMS(emailstring);
        });
        res.render('pages/receipt');
      }
    });
  });

  app.post('/search', (req,res) => {
    var data = req.body.data;
    if(typeof(data) != 'string') {
      data = JSON.stringify(data);
    }
    //data.split(" ");
    var option = {
      where: {
        model: {
          $ilike: data
        }
      }
    }
    sequelize.models.skus.findAll(option).then(function (skus) {
      app.render('pages/index', {skus: skus}, (err, data) => {
        res.send(data);
      });
    });
  });

  app.post('/pre-order-conf', function (req, res) {
    var data = req.body.data;
    var cart_products = [];
    if(data != null && data != undefined) {
      data.map(function (el) { // this is actually the cart data - map iterates over it
        pino.info('el: ', el);
        findBookings(el.sku_id, el.startdate, el.enddate, function (availableproducts) {
          pino.info('Available products: ', availableproducts);
          cart_products.push(availableproducts);
        });
      });
    }
    setTimeout(() => {res.send(cart_products)},1000);
  });

  app.get('/cart', function (req, res) {
    res.render('pages/cart');
  });

  app.get('/datepicker', function (req, res) {
    res.render('pages/datepickerdemo');
  });
};
