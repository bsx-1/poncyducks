const CognitiveServicesCredentials = require("@azure/ms-rest-js");
const TextAnalyticsAPIClient = require("@azure/cognitiveservices-textanalytics");

const key_var = 'TEXT_ANALYTICS_SUBSCRIPTION_KEY';
if (!process.env[key_var]) {
    throw new Error('please set/export the following environment variable: ' + key_var);
}
const subscription_key = process.env[key_var];

const endpoint_var = 'TEXT_ANALYTICS_ENDPOINT';
if (!process.env[endpoint_var]) {
    throw new Error('please set/export the following environment variable: ' + endpoint_var);
}
const endpoint = process.env[endpoint_var];

const creds = new CognitiveServicesCredentials.ApiKeyCredentials({ inHeader: { 'Ocp-Apim-Subscription-Key': subscription_key } });
const client = new TextAnalyticsAPIClient.TextAnalyticsClient(creds, endpoint);
/*
// 0 is negative, 1 is positive

const inputDocuments = {documents:[
    {language:"en", id:"1", text:"I had the best day of my life."}
]}

const operation = client.sentiment({multiLanguageBatchInput: inputDocuments})
operation
.then(result => {
    console.log(result.documents);
})
.catch(err => {
    throw err;
});*/

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');
    console.log(req);
    var inputDocuments = req.data;
    var status;
    var body;

    if (inputDocuments) {
        status = 200;
        client.sentiment({multiLanguageBatchInput: inputDocuments})
        .then(result => {
             console.log(result.documents);
             body = result.documents;
        })
        .catch(err => {
            throw err;
        });
    }
    else {
        status = 400;
        body = 'Please pass data in the form {documents:[{language:""en"", id:""1"", text:""I had the best day of my life.""}]}';
    }
    context.res = {
        status: status,
        body: body
    }
};