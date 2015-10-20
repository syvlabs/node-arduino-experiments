var ArduinoLCD = require("./arduinolcd.js").ArduinoLCD;

ArduinoLCD.init('COM6', function(){
    ArduinoLCD.sendLine2("46989", true);
    ArduinoLCD.sendLine2("28");
    createBarChars();
    ArduinoLCD.sendLine1('Rain_  ', true);
    ArduinoLCD.sendChar(4);
    ArduinoLCD.sendLine1('9');
    ArduinoLCD.sendChar(4);
    ArduinoLCD.sendChar(4);
    ArduinoLCD.sendLine1('A');
    ArduinoLCD.sendChar(4);
    ArduinoLCD.sendChar(4);
    ArduinoLCD.sendLine1('3');
    ArduinoLCD.sendChar(4);

    ArduinoLCD.sendLine2('30%    ', true);
    insertRainChar(10);
    insertRainChar(30);
    insertRainChar(40);
    insertRainChar(50);
    insertRainChar(60);
    insertRainChar(70);
    insertRainChar(80);
    insertRainChar(90);
    insertRainChar(100);

    testGet();
});

function testGet() {
    var HttpProxyAgent = require('http-proxy-agent');
    var request = require('request');

    var proxy = 'http://10.40.36.5:8080';
    var agent = new HttpProxyAgent(proxy);

    request({
      uri: "http://api.wunderground.com/api/6f7e52b5ced6fbd0/hourly/q/zmw:00000.1.98430.json",
      method: "GET",
      agent: agent,
      timeout: 10000,
      followRedirect: true,
      maxRedirects: 10
    }, function(error, response, body) {
        console.log("Error" + error);
        console.log("Response: " + response);
        console.log("Body: "+ body);
    });
}

function insertRainChar(pct) {
    var level = Math.min(4, Math.max(0, Math.floor(pct/20.0)));
    if (level == 4) {
        ArduinoLCD.sendChar(255);
    } else {
        ArduinoLCD.sendChar(level);
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
    ArduinoLCD.createChar(4, [
        '.....', '.....', '.....', '..X..',
        '..X..', '.....', '.....', '.....'
    ]);
}
