const express = require("express");

const PORT = process.env.PORT || 3001;

const app = express();

// read in arduino data from COM4
const {SerialPort} = require('serialport');
var port = new SerialPort({ path: 'COM4', baudRate: 9600 });
const { ByteLengthParser } = require('@serialport/parser-byte-length');

const parser = port.pipe(new ByteLengthParser({length: 8}));
parser.on('data', console.log);


app.get("/api", (req, res) => {
    res.json({ message: "Hello from server!" });
});


app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});