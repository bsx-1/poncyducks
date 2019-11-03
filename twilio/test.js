var request = require('request');

var options = {
    url: 'https://api.twilio.com/2010-04-01/Accounts/ACddcd82ecc6d62d171bd12406726c043f/Transcriptions.json',
    auth: {
        'user': 'ACddcd82ecc6d62d171bd12406726c043f',
        'pass': '[AuthToken]'
    }
};

function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
        console.log(body);
    }
}

request(options, callback);