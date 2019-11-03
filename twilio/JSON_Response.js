exports.handler = function(context, event, callback) {
  //let response = { get_started: true };
  let response;
  const client = context.getTwilioClient();
  client.transcriptions.list({limit: 20})
      .then(function(transcriptions) {
          response = { transcrptions: transcriptions};
          callback(null, response);
      })
      .catch(err => {
        throw err;
    });
};