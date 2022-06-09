const request = require("request");

/**
 * Makes a single API request to retrieve the user's IP address.
 * Input:
 *   - A callback (to pass back an error or the IP string)
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The IP address as a string (null if error). Example: "162.245.144.188"
 */

const URLIP = 'https://api.ipify.org/?format=json'
const URLGEO = 'https://api.ipbase.com/v2/info?apikey=xaMrt5Cvp4s0IKMLuOkwoWlHHjx3yeoR3QuWpIHK&ip='

const fetchMyIP = function (callback) {
  // use request to fetch IP address from JSON API
  let err, ip;
  request(URLIP, (error, response, body) => {
    if (error) {
      callback(error, null);
      return;
    }
    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching IP. Response: ${body}`;
      callback(Error(msg), null);
      return;
    }
    err = error;
    ip = JSON.parse(body).ip;

    callback(err, ip);
    return
  })
};

const fetchCoordsByIP = function (ip, callback) {
  let url = URLGEO + ip;

  // let url = `https://freegeoip.app/json/${ip}`;
  let err;
  request(url, (error, response, body) => {
    if (error) {
      callback(error, null);
      return;
    }
    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching coordinates for IP. Response: ${body}`;
      callback(Error(msg), null);
      return;
    }
    err = error;
    const { latitude, longitude } = JSON.parse(body).data.location;
    callback(err, { latitude, longitude });
    return
  })
}; // end fetchCoordsByIp


/**
 * Makes a single API request to retrieve upcoming ISS fly over times the for the given lat/lng coordinates.
 * Input:
 *   - An object with keys `latitude` and `longitude`
 *   - A callback (to pass back an error or the array of resulting data)
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The fly over times as an array of objects (null if error). Example:
 *     [ { risetime: 134564234, duration: 600 }, ... ]
 */
const fetchISSFlyOverTimes = function (coords, callback) {
  const url = `https://iss-pass.herokuapp.com/json/?lat=${coords.latitude}&lon=${coords.longitude}`;

  request(url, (error, response, body) => {
    if (error) {
      callback(error, null);
      return;
    }

    if (response.statusCode !== 200) {
      callback(Error(`Status Code ${response.statusCode} when fetching ISS pass times: ${body}`), null);
      return;
    }

    const passes = JSON.parse(body).response;
    callback(null, passes);
  });
};// end fetchISSFlyOverTimes

// iss.js 

/**
 * Orchestrates multiple API requests in order to determine the next 5 upcoming ISS fly overs for the user's current location.
 * Input:
 *   - A callback with an error or results. 
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The fly-over times as an array (null if error):
 *     [ { risetime: <number>, duration: <number> }, ... ]
 */
const nextISSTimesForMyLocation = function (callback) {
  fetchMyIP((error, ip) => {
    if (error) {
      return callback(error, null);
    }

    console.log('It worked! Returned IP:', ip);

    //fetch coords
    fetchCoordsByIP(ip, (error, data) => {
      if (error) {
        return callback(error, null);
      }

      //fetch Fly over Times
      fetchISSFlyOverTimes(data, (error, passTime) => {
        if (error) {
          return callback(error, null);
        }

        callback(null, passTime);

      }) //end fetchISSFlyOverTimes
    }); //end fetchCoordsByIP
  }); //end fetchMyIP
}//end nextISSTimesForMyLocation



module.exports = { fetchMyIP, fetchCoordsByIP, fetchISSFlyOverTimes, nextISSTimesForMyLocation };