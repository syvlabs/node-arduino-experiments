var ArduinoLCD = function () {};
var ALCD = ArduinoLCD.prototype;

ALCD.init = function(port, onInit) {
    var SerialPort = require("serialport").SerialPort
    var serialPort = new SerialPort(port, {
        baudrate: 9600,
        parser: require("serialport").parsers.readline("\n")
    });
    ALCD.serialPort = serialPort;
    serialPort.on("open", function () {
        serialPort.on('data', function(data) {
            if (data.trim() == "Ready") {
                ALCD.send("0\n");
                ALCD.send("0\n");
                ALCD.send("3\n");
                onInit();
            } else {
            }
        });
    });
};

ALCD.clear = function() {
    ALCD.send('3\n');
}

ALCD.send = function() {
    var args = [];
    for (var i = 0; i < arguments.length; ++i) {
        ALCD.serialPort.write(arguments[i], function(err, res){
            if (err)
                console.log("[ALCD] Error writing: ", err, "Results: ",res);
        });
    }
};

ALCD.sendText = function(line1, line2, reset) {
    if (line1) {
        ALCD.send((reset ? 1 : 6)+'\n');
        ALCD.send(line1+'\0');
    }
    if (line2) {
        ALCD.send((reset ? 2 : 7)+'\n');
        ALCD.send(line2+'\0');
    }
}

ALCD.sendLine1 = function(line, reset) {
    ALCD.sendText(line, null, reset);
}

ALCD.sendLine2 = function(line, reset) {
    ALCD.sendText(null, line, reset);
}

ALCD.sendChar = function(cmd) {
    ALCD.send('4\n');
    ALCD.send(ALCD.toHexStr2(cmd) + '\0');
}

ALCD.createChar = function(index, charArr) {
    ALCD.send('5\n');
    var str = '';
    for (var i = 0; i < 8; i++)
        str += ALCD.toHexStr2(parseInt(charArr[i].replace(/[.]/g, '0').replace(/X/g, '1'), 2));
    ALCD.send(str + ALCD.toHexStr2(index).charAt(1));
}

ALCD.toHexStr2 = function(num) {
    var str = num.toString(16);
    if (str.length < 2)
        str = '0' + str;
    return str.toUpperCase();
}

exports.ArduinoLCD = new ArduinoLCD();
