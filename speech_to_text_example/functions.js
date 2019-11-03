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

  //will hold JSON with all sentences by the time stop button pressed
  var myJsonRequest = createInitialJson();

  //will hold a string with all speech recognized by the time stop button is pressed
  var myFinalText = "";


  stopButton.addEventListener("click", function(){
    if(recognizer==undefined){

      phraseDiv.innerHTML += "no recognizer";
    } else {
      var wordCounts = sentenceToHash(myFinalText);
      console.log(wordCounts);
      //displays word most frequent
      console.log(sortedWordCount(wordCounts)[0][0]);
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
        myJsonRequest = addSentenceToJson(e.result.text,myJsonRequest);
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
  var testingJson = createInitialJson();
  testingJson = addSentenceToJson("I am having a great time.",testingJson);
  testingJson = addSentenceToJson("I am having a horrible time.", testingJson);
  postToSentiment(testingJson);
}

//sends JSON to sentiment analyzer. JSON can be created with createInitialJson and addSentenceToJson
function postToSentiment(myJson){
  var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance
  var theUrl = "https://cors-anywhere.herokuapp.com/"+"https://poncyduckstextanalyzer.azurewebsites.net/api/HttpTrigger?code=ITA5bKwNaUKggjsmeaoCNzxsCr11tahKUmx9afV/XDNsCj/tIERNWQ==";
  xmlhttp.open("POST", theUrl);
  xmlhttp.setRequestHeader("Content-Type", "application/json");
  xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            myResponse = JSON.parse(this.responseText);
            console.log(myResponse)
        }
  };
  xmlhttp.send(JSON.stringify(myJson));
  //xmlhttp.send(JSON.stringify({"data":{"documents":[{"language":"en", "id":"1", "text":"I had the best day of my life."}]}}));
}

//sorts unsorted object based on word count
function sortedWordCount(unsortedObject){
  var sortable = [];
  for (var word in unsortedObject){
    sortable.push([word,unsortedObject[word]]);
  }
  sortable.sort(function(a,b){
    return b[1]-a[1];
  })
  return sortable;
}

//returns a JSON with empty documents data
//call this and pass returned JSON into addSentenceToJson
function createInitialJson(){
  var myText = '{"data":{"documents":[]}}';
  return JSON.parse(myText);
}

//returns a JSON with a sentence added to documents data in the given JSON
//given JSON should be initially created by createInitialJson
function addSentenceToJson(singleSentence, givenJson){
  var myId = givenJson.data.documents.length + 1;
  myId = myId.toString(10);
  givenJson.data.documents.push({"language":"en","id":myId,"text":singleSentence})
  return givenJson;
}

//an object with words mapped to count of word number when long text passed in.
function sentenceToHash(mySentence){
  return wordArrayToHash(sentenceToWordArray(mySentence));
}

//returns an array of words when a long string is passed in. Array will have some empty String.
function sentenceToWordArray(mySentence){
  var myWordArray = mySentence.split("?").join(" ").split(".").join(" ").split(",").join(" ").split(" ");
  return myWordArray;
}

//returns an object with words mapped to count of word number when array of words passed in.
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
  /*for(const stuff in object){
    console.log(stuff + object[stuff]);
  }*/
  return object;
}
