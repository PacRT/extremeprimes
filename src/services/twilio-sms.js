//require the Twilio module and create a REST client
var client = require('twilio')('ACb5649514def2a4c5c42b0cbfb353768e', '70680016cc25f247acdb7c48bd4e2253');

var pino = require('pino')()


exports.sendSMS = (messagebody) => {
//Send an SMS text message
  client.sendMessage({
    to: '+14083939606', // Any number Twilio can deliver to
    from: '+16697210055',
    body: messagebody // body of the SMS message

  }, function (err, responseData) { //this function is executed when a response is received from Twilio

    if (!err) { // "err" is an error received during the request, if any

      // "responseData" is a JavaScript object containing data received from Twilio.
      // A sample response from sending an SMS message is here (click "JSON" to see how the data appears in JavaScript):
      // http://www.twilio.com/docs/api/rest/sending-sms#example-1

      pino.info(responseData.from); // outputs "+14506667788"
      pino.info(responseData.body); // outputs "word to your mother."

    } else {
      pino.info('Problem: ', err);
    }
  });
}

