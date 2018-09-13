const got = require("got");
const { usernames } = require("./usernames.json");

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
  const queries = usernames.map(u => isUsernameAvailable(u));
  const results = await Promise.all(queries);
  console.log(results);
}

setInterval(performCheck, 10000);