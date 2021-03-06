// status fields and start button in UI
var phraseDiv;
var startRecognizeOnceAsyncButton;

// subscription key and region for speech services.
var subscriptionKey, serviceRegion;
var authorizationToken;
var SpeechSDK;
var lastInt;
var recognizer;
var fillerWords = ["umm", "ummm", "um", "ah", "ahh", "ahhh", "uh", "uhh", "uhhh","so","like", "yeah",  "ok", "well", "right","see","hm","basically"];
var questions = ["Tell me a little about yourself.","What are your biggest weaknesses?","What are your biggest strengths?","Where do you see yourself in five years?",
"Out of all the other candidates, why should we hire you?", "Why do you want this job?","Tell me about the toughest decision you had to make in the last six months.",
"Tell me about a time you disagreed with a decision. What did you do?","What questions do you have for me?", "If you were to rank them, what are the three traits your top performers have in common?",
"Tell me about your work experience.", "What was your favorite school project and why?"]
var myJsonRequest;
var myFinalText;

document.addEventListener("DOMContentLoaded", function () {
  init();
});

function test(){
  var testTxt = document.getElementById("testpara");
  console.log(findFillerWord(sentenceToHash("Hello, so like like so so so so I am")));
}

function init(){
  lastInt = 0;
  phraseDiv = document.getElementById("phraseDiv");
  document.getElementById("questiontext").innerHTML = questions[0];
  startRecognizeOnceAsyncButton = document.getElementById("startRecognizeOnceAsyncButton");
  subscriptionKey = "f05deb49d4f943ec8fbe53adcf5bdfd9";
  serviceRegion = "westus";
  phraseDiv.innerHTML = "";
  //will hold JSON with all sentences by the time stop button pressed
  myJsonRequest = createInitialJson();

  //will hold a string with all speech recognized by the time stop button is pressed
  myFinalText = "";
  if (!!window.SpeechSDK) {
    SpeechSDK = window.SpeechSDK;
    startRecognizeOnceAsyncButton.disabled = false;

    document.getElementById('content').style.display = 'block';
    document.getElementById('warning').style.display = 'none';
  }
}

//returns overall sentiment as int
function getOverAllSentiment(myJson){
  console.log(myJson.length);
  var myAverage = 0;
  for(var index=0; index<myJson.length;index++){
    myAverage += myJson[index].score;
  }
  console.log(myAverage);
  return myAverage/myJson.length;
}

function test(){
  console.log(getRandomPrompt());
}

function getRandomPrompt(){
  var randomInt = Math.floor(Math.random() * questions.length);
  while(randomInt == lastInt){
    randomInt = Math.floor(Math.random() * questions.length);
  }
  lastInt = randomInt;
  document.getElementById("questiontext").innerHTML = questions[randomInt];
  return questions[randomInt];
}

function clearLastResponse(){
  document.getElementById("wordsused").innerHTML = "";
  document.getElementById("stopper").innerHTML = "";  
  document.getElementById("fillTitle").innerHTML = "";
  document.getElementById("choiceTitle").innerHTML = "";  
  document.getElementById("fillused").innerHTML = "";  
  document.getElementById("sentiment").innerHTML = "";
  myJsonRequest = createInitialJson();
  myFinalText = "";
}

function startSpeechToText(){
    clearLastResponse();
    phraseDiv = document.getElementById("phraseDiv");
    startRecognizeOnceAsyncButton = document.getElementById("startRecognizeOnceAsyncButton");
    subscriptionKey = "f05deb49d4f943ec8fbe53adcf5bdfd9";
    serviceRegion = "westus";

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
      speechConfig = SpeechSDK.SpeechConfig.fromSubscription(subscriptionKey, serviceRegion);
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
}

function stopSpeechToText(){
  if(recognizer==undefined){

    phraseDiv.innerHTML += "no recognizer";
  } else {
    var wordCounts = sentenceToHash(myFinalText);
    console.log(wordCounts);

    var myFrequentWords = sortedWordCount(wordCounts);
    var myFrequentFillers = findFillerWord(wordCounts);
    var displayWords = document.getElementById("choiceTitle");
    displayWords.innerHTML = "";
    displayWords.innerHTML ="Most Frequently Used Words: ";
    displayWords = document.getElementById("wordsused");
    var maxIndex = 5;
    if(myFrequentWords.length<maxIndex){
      maxIndex = myFrequentWords.length;
    }
    if(myFrequentWords.length>0){
      displayWords.innerHTML += myFrequentWords[0][0] + ": " + myFrequentWords[0][1];
    } else {
      displayWords.innerHTML += "No Content";
    }
    for(var i = 1; i<maxIndex; i++){
      displayWords.innerHTML +=  ", " + myFrequentWords[i][0] + ": " + myFrequentWords[i][1];
    }
    displayWords = document.getElementById("fillTitle");
    displayWords.innerHTML = "Most Common Filler Words Found: ";
    displayWords = document.getElementById("fillused");    
    maxIndex = 5;
    if(myFrequentFillers.length<maxIndex){
      maxIndex = myFrequentFillers.length;
    }
    if(myFrequentFillers.length>0){
      displayWords.innerHTML += myFrequentFillers[0][0] + ": " + myFrequentFillers[0][1];
    } else {
      displayWords.innerHTML += "No Filler Words Found"
    }
    for(var i = 1; i<maxIndex; i++){
      displayWords.innerHTML += ", " + myFrequentFillers[i][0] + ": " + myFrequentFillers[i][1];
    }
    postToSentiment(myJsonRequest);
    startRecognizeOnceAsyncButton.disabled = false;
    phraseDiv = document.getElementById("stopper")
    phraseDiv.innerHTML = "Recording Complete.";
    recognizer.close();
    recognizer = undefined;
  }
}

//sends JSON to sentiment analyzer.
//pass in JSON created with createInitialJson and addSentenceToJson
function postToSentiment(myJson){
  var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance
  var theUrl = "https://cors-anywhere.herokuapp.com/"+"https://poncyduckstextanalyzer.azurewebsites.net/api/HttpTrigger?code=ITA5bKwNaUKggjsmeaoCNzxsCr11tahKUmx9afV/XDNsCj/tIERNWQ==";
  xmlhttp.open("POST", theUrl);
  xmlhttp.setRequestHeader("Content-Type", "application/json");
  xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var myResponse = JSON.parse(this.responseText);
            console.log(myResponse);
            //do stuff with response like changing the innerHTML to display the response
            var averageSentiment = getOverAllSentiment(myResponse);
            var roundedAvg = Math.round(averageSentiment * 100);
            if(averageSentiment!=undefined){
              if(roundedAvg>50){
                document.getElementById("sentiment").innerHTML = roundedAvg + "%" + " positive based on response given";
              } else {
                document.getElementById("sentiment").innerHTML = roundedAvg + "%" + " negative based on response given";
              }
            }
            console.log(averageSentiment);
        }
  };
  xmlhttp.send(JSON.stringify(myJson));
}

//returns an array of filler words used in speech with word count. Filler words are defined at the top in an array.
//pass in result from sentenceToHash to use this function
function findFillerWord(unsortedObject){
  var returnArray = [];
  for(var i=0; i<fillerWords.length;i++){
    if(unsortedObject[fillerWords[i]]!=undefined){
      returnArray.push([fillerWords[i],unsortedObject[fillerWords[i]]]);
    }
  }
  returnArray.sort(function(a,b){
    return b[1]-a[1];
  })
  return returnArray;
}

//sorts unsorted object based on word count and returns array
//pass in result from sentenceToHash to use this function
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

//returns a JSON with initialized empty documents data
function createInitialJson(){
  var myText = '{"data":{"documents":[]}}';
  return JSON.parse(myText);
}

//returns a JSON with a sentence added to documents data in the given JSON
//pass in result from createInitialJson to use this function
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
//pass in result from sentenceToWordArray to use this function
function wordArrayToHash(myWordArray){
  let object = {};
  for(var i=0;i<myWordArray.length;i++){
    if((myWordArray[i]==undefined) || (myWordArray[i]=="")) continue;
    var lowerCaseWord = myWordArray[i].toLowerCase();
    if(lowerCaseWord == "i"){
      lowerCaseWord = "I";
    }
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
