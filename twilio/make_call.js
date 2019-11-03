// Download the helper library from https://www.twilio.com/docs/node/install
// Your Account Sid and Auth Token from twilio.com/console
// DANGER! This is insecure. See http://twil.io/secure
const accountSid = 'ACddcd82ecc6d62d171bd12406726c043f';
const authToken = '33aa5f58725fdac367dd2b3a789c05d8';
const client = require('twilio')(accountSid, authToken);

client.calls
      .create({
         url: 'http://demo.twilio.com/docs/voice.xml',
         to: '+18322841555',
         from: '+19384448743'
       })
      .then(call => console.log(call.sid));