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