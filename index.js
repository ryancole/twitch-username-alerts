const got = require("got");
const twilio = require("twilio");

// the usernames we want to check for
const { usernames } = require("./usernames.json");

// init twilio client
const twilioClient = twilio(process.env["TWILIO_SID"], process.env["TWILIO_TOKEN"]);

function log(message) {
  const date = new Date();
  console.log(`[${date.toLocaleString()}] ${message}`);
}

async function isUsernameAvailable(username) {
  const options = {
    baseUrl: "https://api.twitch.tv/kraken/channels",
	query: {
	  "client_id": process.env["TWITCH_CLIENT_ID"]
	}
  };

  const result = {
    active: false,
    username,
	available: false
  };

  try {
    const response = await got(username, options);
	result.active = true;
  } catch (err) {
    if (err instanceof got.HTTPError) {
	  if (err.statusCode == 404) {
	    result.available = true;
	  }
	}
  }

  return result;
}

async function performCheck() {
  const queries = usernames.map(u => isUsernameAvailable(u));
  const results = await Promise.all(queries);

  const active = results.filter(m => m.active).map(m => m.username);
  const available = results.filter(m => m.available).map(m => m.username);

  log(JSON.stringify(results));

  if (available.length > 0) {
    twilioClient
	  .messages
	  .create({ body: `Available twitch usernames: ${available.join()}`, to: process.env["TWILIO_TO"], from: process.env["TWILIO_FROM"] })
	  .catch(err => console.log(err))
	  .done();
  }

  if (active.length > 0) {
    twilioClient
	  .messages
	  .create({ body: `Already active twitch usernames: ${active.join()}`, to: process.env["TWILIO_TO"], from: process.env["TWILIO_FROM"] })
	  .catch(err => console.log(err))
	  .done();
  }
}

setInterval(performCheck, 60000);