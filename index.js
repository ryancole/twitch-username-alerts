const got = require("got");
const twilio = require("twilio");

// the usernames we want to check for
const { usernames } = require("./usernames.json");

// init twilio client
const twilioClient = twilio(process.env["TWILIO_SID"], process.env["TWILIO_TOKEN"]);

async function isUsernameAvailable(username) {
  let available = false;

  const options = {
    baseUrl: "https://api.twitch.tv/kraken/channels",
	query: {
	  "client_id": process.env["TWITCH_CLIENT_ID"]
	}
  };

  try {
    const response = await got(username, options);
  } catch (err) {
    if (err instanceof got.HTTPError) {
	  if (err.statusCode == 404) {
	    available = true;
	  }
	}
  }

  return {username, available};
}

async function performCheck() {
  console.log("Performing availability check ...");

  const queries = usernames.map(u => isUsernameAvailable(u));
  const results = await Promise.all(queries);
  const available = results.filter(m => m.available).map(m => m.username);

  console.log(results);

  if (available.length > 0) {
    twilioClient
	  .messages
	  .create({ body: `Available twitch usernames: ${available.join()}`, to: process.env["TWILIO_TO"], from: process.env["TWILIO_FROM"] })
	  .catch(err => console.log(err))
	  .done();
  }
}

setInterval(performCheck, 60000);

module.exports = () => "twitch username alerts";