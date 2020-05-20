const functions = require('firebase-functions');
const admin = require('firebase-admin');
const yrno = require('yr.no-forecast')({
    version: '1.9',
    request: {
        timeout: 15000
    }
});

admin.initializeApp();

const LOCATION = { // Lølandsheia, Lyngdal (Vest-Agder)
    lat: 58.25698,
    lon: 7.25752
};

exports.getWeather = functions.https.onRequest((request, response) => {

    yrno.getWeather(LOCATION)
        .then((weather) => {
            return weather.getFiveDaySummary();
        })
        .then((summary) => {
            response.send(summary.map(x => {
                return {
                    from: x.from,
                    to: x.to,
                    minRain: x.rainDetails.minRain,
                    maxRain: x.rainDetails.maxRain,
                    rain: x.rainDetails.rain,
                    temperature: x.temperature.value,
                    windDirectionDeg: x.windDirection.deg,
                    windDirectionName: x.windDirection.name,
                    windSpeedMps: x.windSpeed.mps,
                    windSpeedBeaufort: x.windSpeed.beaufort,
                    windGustMps: (x.windGust || {}).mps,
                    humidity: x.humidity.value,
                    pressure: x.pressure.value,
                    cloudinessId: x.cloudiness.id,
                    cloudiness: x.cloudiness.percent,
                    fog: (x.fog || {}).percent,
                    lowClouds: x.lowClouds.percent,
                    lowCloudsId: x.lowClouds.id,
                    mediumCloudsId: x.mediumClouds.id,
                    mediumClouds: x.mediumClouds.percent,
                    highCloudsId: x.highClouds.id,
                    highClouds: x.highClouds.percent,
                    dewpointTemperature: x.dewpointTemperature.value
                };
            }));
            return true;
        })
        .catch((e) => {
            response.send(e);
            return false;
        });
});

exports.addPower = functions.https.onRequest(async (request, response) => {

    const original = request.query.text;

    const snapshot = await admin.database().ref('/power').push({
        voltage: 12.224,
        current: 0.135
    });

    response.status(200).send(true);

});