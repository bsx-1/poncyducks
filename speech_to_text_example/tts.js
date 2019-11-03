//if this is first time running, may need to run: npm install request request-promise xmlbuilder readline-sync play-sound
//run with "node tts.js" in terminal

//https://code-maven.com/javascript-module-to-run-in-browser-and-in-node
//http://dreamerslab.com/blog/en/node-js-basics/
// voices https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/language-support#text-to-speech

// Requires request and request-promise for HTTP requests
// e.g. npm install request request-promise
const rp = require('request-promise');
// Requires fs to write synthesized speech to a file
const fs = require('fs');
// Requires readline-sync to read command line inputs
const readline = require('readline-sync');
// Requires xmlbuilder to build the SSML body
const xmlbuilder = require('xmlbuilder');

// Gets an access token.
function getAccessToken(subscriptionKey) {
    let options = {
        method: 'POST',
        uri: 'https://westus.api.cognitive.microsoft.com/sts/v1.0/issueToken',
        headers: {
            'Ocp-Apim-Subscription-Key': subscriptionKey
        }
    }
    return rp(options);
}

// Make sure to update User-Agent with the name of your resource.
// You can also change the voice and output formats. See:
// https://docs.microsoft.com/azure/cognitive-services/speech-service/language-support#text-to-speech
function textToSpeech(accessToken, text) {
    // Create the SSML request.
    let xml_body = xmlbuilder.create('speak')
        .att('version', '1.0')
        .att('xml:lang', 'en-us')
        .ele('voice')
        .att('xml:lang', 'en-us')
        .att('name', 'Microsoft Server Speech Text to Speech Voice (en-US, BenjaminRUS)')
        .txt(text)
        .end();
    // Convert the XML into a string to send in the TTS request.
    let body = xml_body.toString();

    let options = {
        method: 'POST',
        baseUrl: 'https://westus.tts.speech.microsoft.com/',
        url: 'cognitiveservices/v1',
        headers: {
            'Authorization': 'Bearer ' + accessToken,
            'cache-control': 'no-cache',
            'User-Agent': 'YOUR_RESOURCE_NAME',
            'X-Microsoft-OutputFormat': 'riff-24khz-16bit-mono-pcm',
            'Content-Type': 'application/ssml+xml'
        },
        body: body
    }

    let request = rp(options)
        .on('response', (response) => {
            if (response.statusCode === 200) {
                request.pipe(fs.createWriteStream('TTSOutput.wav'));
            }
        });
    return request;
}

// Use async and await to get the token before attempting
// to convert text to speech.
async function main() {
    // Reads subscription key from env variable.
    // You can replace this with a string containing your subscription key. If
    // you prefer not to read from an env variable.
    const subscriptionKey = "f05deb49d4f943ec8fbe53adcf5bdfd9";
    //const subscriptionKey = process.env.SPEECH_SERVICE_KEY;
    if (!subscriptionKey) {
        throw new Error('Environment variable for your subscription key is not set.')
    };
    var run = "true";
    while(run=="true"){
      // Prompts the user to input text.
      const text = readline.question('\nWhat would you like to convert to speech? ');
      if(text=="quit"){
        run = "quit";
      }
      try {
          const accessToken = await getAccessToken(subscriptionKey);
          await textToSpeech(accessToken, text);
          var player = require('play-sound')(opts = {})
          player.play('TTSOutput.wav', function(err){
            if (err) throw err
          })
      } catch (err) {
          console.log(`Something went wrong: ${err}`);
      }
    }
}

main()
