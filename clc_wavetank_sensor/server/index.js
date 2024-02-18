const express = require("express");
const cors = require("cors");

const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors());

const fluid_density = 997.77; // kg/m^3 (approximate density of water)
const gravity  = 9.81;

const header_tick = 3;
var tick = 0;


//calculate water depth
function calculate_water_depth(pressure){
  return pressure / (fluid_density * gravity);
}



//calculate average pressure
function calculate_average_pressure(pressure_data){
  return pressure_data.reduce((a, b) => a + b, 0) / pressure_data.length;
}



// read in arduino data from COM4
const {SerialPort} = require('serialport');
var port = new SerialPort({ path: 'COM4', baudRate: 9600 });
const { ReadlineParser  } = require('@serialport/parser-readline');

//pressure data array
var data_stream = []; // [{tick: 1, pressure: 1000, water_depth: 0.1}, ...]
var average_pressure;

const parser = port.pipe(new ReadlineParser());
// convert buffer to string
parser.on('data', function(data){
    if (tick++ < header_tick) return;

    console.log(data.toString());
    // add current tick to the pressure data
    data_stream.push({tick: tick, 
                      pressure: data.toString(), 
                      water_depth: calculate_water_depth(data.toString())});
    
    //calculate average pressure and set average pressure to current pressure
    average_pressure = calculate_average_pressure(data_stream);
});



// handle error event
parser.on('error', function(err){
    console.log('Error: ', err.message);
});

app.get("/api", (req, res) => {
    //send the last 10 pressure data
    res.json({ 
        // array[:-50]: last 50 elements of the array
        data_stream: data_stream.slice(-50),

        // average pressure
        average_pressure: average_pressure

        // average water depth
        
        // max pressure
        // max wave height


      });


        
    
});


app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
