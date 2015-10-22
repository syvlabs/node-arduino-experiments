var ArduinoLCD = require("./arduinolcd.js").ArduinoLCD;
var request = require('request');
var moment = require('moment');
var unirest = require('unirest');

var proxy = 'http://10.40.36.5:8080';
var forecast = {
    data: null,
    lastUpdate: null
};

var screenHeaderIdx = 0;

const TICK_CGRAM = 4;

console.log("SCRIPT IS STARTING: "+strTimeNow());

var timeStart = moment();

ArduinoLCD.init('COM6', function(){
    console.log(strTimeNow()+' Arduino detected.');
    createBarChars();
    getForecast(function(){
        updateScreen();
        setInterval(updateScreen, 5000);   //Update screen every 5 sec
        setInterval(getForecast, 60000);   //Get new forecast every 1 min
    });
});

function getForecast(callback) {
    console.log(strTimeNow()+" Downloading forecast... ");
    var Request = unirest.get("http://syvlabs.com/weather/upd.php?rand=" + Math.round(Math.random()*1000000));
    Request.proxy(proxy);
    Request.end(function (response){
        console.log(strTimeNow()+" New forecast downloaded.");
        if (typeof response.body == "string")
            response.body = JSON.parse(response.body);
        forecast.data = response.body;
        forecast.lastUpdate = moment();
        if (callback)
            callback();
    });
}

function updateScreen() {
    if (!forecast.data) {
        console.log(strTimeNow() + " Update screen error: no forecast data");
        return;
    }
    if (screenHeaderIdx%2 == 0) {
        printLineHeader(1, 'Rain?');
    } else if (screenHeaderIdx%2 == 1) {
        printLineHeader(1, moment().format('HH:mm'));
    }
    var entryFrom = 0;
    var found = false;
    var hourly = forecast.data['hourly_forecast'];
    var now = moment();
    for (var i = 0; i < hourly.length; i++) {
        var t = moment(Number(hourly[i].FCTTIME.epoch)*1000);
        if (t >= now) {
            found = true;
            entryFrom = i;
            break;
        }
    }
    if (!found) {
        console.log(strTimeNow() + " Forecast is outdated");
        return;
    }
    var rainChars = [];
    for (var i = 0; i < 9; i++) {
        if (!hourly[entryFrom+i]) {
            ArduinoLCD.sendLine1(' ');
            rainChars.push(-1);
        } else {
            var hr = Number(hourly[entryFrom+i].FCTTIME.hour);
            if (hr % 3 != 0) {
                ArduinoLCD.sendChar(TICK_CGRAM);
            } else if (hr == 0) {
                ArduinoLCD.sendLine1('M');
            } else if (hr == 12) {
                ArduinoLCD.sendLine1('N');
            } else {
                ArduinoLCD.sendLine1((hr%12).toString());
            }
            rainChars.push(Number(hourly[entryFrom+i].pop));
        }
    }
    var pctStr = ' '+rainChars[0]+'%';
    while(pctStr.length < 7)
        pctStr += ' ';
    if (screenHeaderIdx%2 == 0) {
        printLineHeader(2, pctStr);
    } else if (screenHeaderIdx%2 == 1) {
        printLineHeader(2, moment().format(' ddd').toUpperCase());
    }
    for (var i = 0; i < 9; i++) {
        insertRainChar(rainChars[i]);
    }
    screenHeaderIdx++;
}

function printLineHeader(lineNum, str) {
    while (str.length < 7)
        str += ' ';
    ArduinoLCD['sendLine'+lineNum](str, true);
}

function insertRainChar(pct) {
    if (pct < 0) {
        ArduinoLCD.sendChar(32);
    } else {
        var level = Math.min(4, Math.max(0, Math.floor(pct/20.0)));
        if (level == 4) {
            ArduinoLCD.sendChar(255);
        } else {
            ArduinoLCD.sendChar(level);
        }
    }
}

function createBarChars() {
    for (var i = 0; i <= 3; i++) {
        var chars = [];
        for (var j = 0; j < 8; j++) {
            if (j >= 8 - i*2 || (i == 0 && j==7))
                chars.push('XXXXX');
            else if (j==0)
                chars.push('X..X.');
            else
                chars.push('.....');
        }
        ArduinoLCD.createChar(i, chars);
    }
    ArduinoLCD.createChar(TICK_CGRAM, [
        '.....', '.....', '.....', '..X..',
        '..X..', '.....', '.....', '.....'
    ]);
}

function strTimeNow() {
    return moment().format('MM/DD/YY, h:mm:ss a');
}

process.on('uncaughtException', function (exception) {
    console.log(exception);
});
