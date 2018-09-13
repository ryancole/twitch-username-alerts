const got = require("got");
const { usernames } = require("./usernames.json");

let accessToken = null;
let needNewToken = true;

async function passportLogin(username, password) {
  const options = {
    method: "POST",
	body: JSON.stringify({
	  username,
	  password,
	  "client_id": "kimne78kx3ncx6brgo4mv6wki5h1ko"
	})
  };

  const response = await got("https://passport.twitch.tv/login", options);

  return response;
}

async function isUsernameAvailable(username) {
  const options = {
    baseUrl: "https://passport.twitch.tv/usernames",
	query: {
	  "is_rename": true
	}
  };

  const response = await got(username, options);

  if (response.statusCode == 204) {
    return true;
  }

  return false;
}

async function getUserDetails(usernames) {
  const query = new URLSearchParams();

  usernames.forEach(username => { query.append("login", username); });

  const options = {
    query,
    headers: {
	  "Authorization": `Bearer ${accessToken.access_token}`
	}
  };

  const response = await got("https://api.twitch.tv/helix/users", options);

  if (response.statusCode == 401)
  {
	needNewToken = true;
    return;
  }

  if (response.statusCode != 200)
  {
    return;
  }

  return JSON.parse(response.body);
}

async function getAccessToken() {
  const options = {
    "method": "POST",
	"query": {
	  "client_id": process.env["TWITCH_CLIENT_ID"],
	  "grant_type": "client_credentials",
	  "client_secret": process.env["TWITCH_CLIENT_SECRET"]
	}
  };

  const response = await got("https://id.twitch.tv/oauth2/token", options);

  if (response.statusCode != 200)
  {
    return;
  }
  
  return JSON.parse(response.body);
}

/* * * * * * * * * *
 * Performs one complete check for each provided username
 */

async function performCheck() {

  // we may need a new access token, in which case we need to request one from
  // the server. this should happen at the start of the process, but can also
  // happen randomly as the token expires or is invalidated for any reason.
  if (needNewToken) {
    
	// request the new access token
    accessToken = await getAccessToken();

	// if we were given an access token, we can disable the needs new flag,
	// otherwise we leave the flag enabled and abort this function call.
	if (accessToken) {
	  needNewToken = false;
	} else {
	  return;
	}
  }

  // fetch the user details for each desired username
  const details = await getUserDetails(usernames);

  // it's possible that the request for user details failed for any reason,
  // which is indicated by an undefined return value. we only want to proceed
  // if we actually succeed in fetching a valid response.
  if (details) {
    
  }
}

// setInterval(performCheck, 10000);

async function foo() {
  console.log("fetching");
  const result = await passportLogin("realultimatewarrior", "foo");
  console.log("fetched");
  console.log(result);
}

foo();