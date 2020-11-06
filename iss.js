const request = require('request');

const fetchMyIP = function (callback) {
  const url = `https://api.ipify.org?format=json`;
  request(url, (error, response, body) => {
    if (error) {
      callback('Url Not Valid', null);
      return;
    } else if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching IP. Response: ${body}`;
      callback(Error(msg), null);
      return;
    } else {
      let data = JSON.parse(body);
      callback(null, data.ip);
    }
  });
};

const fetchCoordsByIP = function (ip, callback) {
  const url = `http://ip-api.com/json/${ip}`;
  request(url, (error, response, body) => {
    const data = JSON.parse(body);
    if (error) {
      callback(error, null);
      return;
    } else if (data.status === "fail") {
      const msg = `error when fetching coordinates for IP. Response: ${ip}`;
      callback(msg, null);
      return;
    } else {
      const coords = { 'latitude': data.lat, 'longitude': data.lon };
      callback(null, coords);

    }
  });
};

const fetchISSFlyOverTimes = function (coords, callback) {
  const url = `http://api.open-notify.org/iss-pass.json?lat=${coords.latitude}&lon=${coords.longitude}`;
  request(url, (error, response, body) => {
    const data = JSON.parse(body);
    if (error) {
      callback(error, null);
      return;
    } else if (data.message === "failure") {
      callback(data.reason, null);
      return;
    } else {
      callback(null, data.response);
    }
  });
};

const nextISSTimesForMyLocation = function (callback) {
  fetchMyIP((error, ip) => {
    if (error) {
      return callback(error, null);
    }

    fetchCoordsByIP(ip, (error, loc) => {
      if (error) {
        return callback(error, null);
      }

      fetchISSFlyOverTimes(loc, (error, nextPasses) => {
        if (error) {
          return callback(error, null);
        }

        callback(null, nextPasses);
      });
    });
  });
};

module.exports = {
  fetchMyIP,
  fetchCoordsByIP,
  fetchISSFlyOverTimes,
  nextISSTimesForMyLocation,
};
