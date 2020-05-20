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
        .then((summay) => {
            response.send(summay);
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
        current: 147.622,
        power: 1805.639
    });

    response.status(200).send(true);

});