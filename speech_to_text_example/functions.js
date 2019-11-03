// status fields and start button in UI
var phraseDiv;
var startRecognizeOnceAsyncButton;

// subscription key and region for speech services.
var subscriptionKey, serviceRegion;
var authorizationToken;
var SpeechSDK;
var recognizer;

document.addEventListener("DOMContentLoaded", function () {
  startRecognizeOnceAsyncButton = document.getElementById("startRecognizeOnceAsyncButton");
  stopButton = document.getElementById("stopRecognition");
  subscriptionKey = document.getElementById("subscriptionKey");
  serviceRegion = document.getElementById("serviceRegion");
  phraseDiv = document.getElementById("phraseDiv");

  var myFinalText = "";


  stopButton.addEventListener("click", function(){
    if(recognizer==undefined){

      phraseDiv.innerHTML += "no recognizer";
    } else {
      console.log(myFinalText);
      sentenceToHash(myFinalText);
      startRecognizeOnceAsyncButton.disabled = false;
      phraseDiv.innerHTML += "stopped";
      recognizer.close();
      recognizer = undefined;
    }
  });

  startRecognizeOnceAsyncButton.addEventListener("click", function () {
    startRecognizeOnceAsyncButton.disabled = true;
    phraseDiv.innerHTML = "";

    // if we got an authorization token, use the token. Otherwise use the provided subscription key
    var speechConfig;
    if (authorizationToken) {
      speechConfig = SpeechSDK.SpeechConfig.fromAuthorizationToken(authorizationToken, serviceRegion.value);
    } else {
      if (subscriptionKey.value === "" || subscriptionKey.value === "subscription") {
        alert("Please enter your Microsoft Cognitive Services Speech subscription key!");
        return;
      }
      speechConfig = SpeechSDK.SpeechConfig.fromSubscription(subscriptionKey.value, serviceRegion.value);
    }

    speechConfig.speechRecognitionLanguage = "en-US";
    var audioConfig  = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
    recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);

    recognizer.startContinuousRecognitionAsync(
      function () {
        startRecognizeOnceAsyncButton.disabled = true;
      },
      function (err) {
        startRecognizeOnceAsyncButton.disabled = false;
        phraseDiv.innerHTML += err;
        window.console.log(err);

        recognizer.close();
        recognizer = undefined;
      });

      //  The event recognizing signals that an intermediate recognition result is received.
    recognizer.recognizing = function(s, e){
        console.log('recognizing text', e.result.text);
    };

    //  The event recognized signals that a final recognition result is received.
    recognizer.recognized = function(s, e){
        phraseDiv.innerHTML += e.result.text;
        myFinalText += e.result.text;
        console.log('recognized text', e.result.text);
    };
  });



  if (!!window.SpeechSDK) {
    SpeechSDK = window.SpeechSDK;
    startRecognizeOnceAsyncButton.disabled = false;

    document.getElementById('content').style.display = 'block';
    document.getElementById('warning').style.display = 'none';

    // in case we have a function for getting an authorization token, call it.
    if (typeof RequestAuthorizationToken === "function") {
        RequestAuthorizationToken();
    }
  }
});

function test(){
  var testTxt = document.getElementById("testpara");
  var mytest = "Hi, my name, is chungus. I want to eat Rungus. I like to hi my name i I iI I I";
  var splitWords = sentenceToHash(mytest);
  testTxt.innerHTML = mytest;

}

function sentenceToHash(mySentence){
  return wordArrayToHash(sentenceToWordArray(mySentence));
}

//returns an array of words when a long string is passed in. Array will have some empty String.
function sentenceToWordArray(mySentence){
  var myWordArray = mySentence.split("?").join(" ").split(".").join(" ").split(",").join(" ").split(" ");
  return myWordArray;
}

//returns an object with words mapped to count of word number
function wordArrayToHash(myWordArray){
  let object = {};
  for(var i=0;i<myWordArray.length;i++){
    if((myWordArray[i]==undefined) || (myWordArray[i]=="")) continue;
    var lowerCaseWord = myWordArray[i].toLowerCase();
    if(object[lowerCaseWord]==undefined){
      object[lowerCaseWord] = 1;
    } else {
      object[lowerCaseWord] += 1;
    }
  }
  for(const stuff in object){
    console.log(stuff + object[stuff]);
  }
  return object;
}
