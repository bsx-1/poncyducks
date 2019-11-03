module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');
    const accountSid = 'ACddcd82ecc6d62d171bd12406726c043f';
    const authToken = 'your_auth_token';
    const client = require('twilio')(accountSid, authToken);
    var myBody = "";
    await client.transcriptions.list({limit: 20})
        .then(transcriptions => transcriptions.forEach(myBody = myBody + t));
    if (req.query.name || (req.body && req.body.name)) {
        context.res = {
            // status: 200, /* Defaults to 200 */
            body: "Hello " + (req.query.name || req.body.name)
        };
    }
    else {
        context.res = {
            status: 400,
            body: "Please pass a name on the query string or in the request body"
        };
    }
};