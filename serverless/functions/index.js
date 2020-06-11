const functions = require('firebase-functions');
const admin = require('firebase-admin');
const yrno = require('yr.no-forecast')({
    version: '1.9',
    request: {
        timeout: 15000
    }
});


admin.initializeApp({
    credential:
        //admin.credential.cert(require("../../config/serviceAccountKey.json")),
        admin.credential.applicationDefault(),
    databaseURL: "https://solarpower-extravaganza.firebaseio.com"
});

const LOCATION = { // Lølandsheia, Lyngdal (Vest-Agder)
    lat: 58.25698,
    lon: 7.25752
};

exports.getWeather = functions.https.onRequest((request, response) => {

    var now = new Date().getTime();
    var collection = admin.firestore().collection('weatherforecast');

    collection.where('forecasted', '>', (now - (1 * 1000 * 60 * 60))).get()
        .then((snapshot) => {
            if (snapshot.size === 0) {
                return yrno.getWeather(LOCATION).then((weather) => {
                    return weather.getFiveDaySummary();
                }).then((summary) => {
                    return Promise.all(summary.map(x => {
                        return collection.add({
                            forecasted: now,
                            date: x.from,
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
                        });
                    })).then(() => {
                        return 200;
                    });
                });
            } else {
                return Promise.resolve(304);
            }
        }).then((status) => {
            response.sendStatus(200);
            return true;
        }).catch((e) => {
            response.status(500).send(e);
            return false;
        });
});

exports.addPower = functions.https.onRequest(async (request, response) => {
    var body = JSON.parse(request.body);
    if (!body.voltage) {
        response.status(402).send('Voltage is not set');
    }
    else if (!body.current) {
        response.status(402).send('Current is not set');
    } else {
        await admin.database().ref('/power').push({
            voltage: body.voltage,
            current: body.current,
            registered: new Date().getTime()
        });
        response.status(200);
    }
});