//================================================================================================================================//
//============================================================ SERVER SETUP ======================================================//
//================================================================================================================================//

const express = require("express");
const cors = require("cors");

const PORT = process.env.PORT || 3001;
const USB_PORT = 'COM4';

const app = express();
app.use(cors());


//================================================================================================================================//
//======================================================== CONSTANT AND VARIABLES ================================================//
//================================================================================================================================//

const header_tick = 3;
var tick = 0;

const fluid_density = 997.77; // kg/m^3 (approximate density of water)
const gravity  = 9.81;

var pressure_data = []; // [1000, 1001, 1002, ...]
var water_depth_data = []; // [0.1, 0.2, 0.3, ...]
var data_stream = []; // [{tick: 1, pressure: 1000, water_depth: 0.1}, ...]
var average_pressure = 0;
var average_water_depth = 0;
var max_pressure = 0;
var max_wave_height = 0;

//================================================================================================================================//
//======================================================= DATA PROCESSING FUNCTIONS ==============================================//
//================================================================================================================================//

// Read in arduino data from USB port
const {SerialPort} = require('serialport');
var port = new SerialPort({ path: USB_PORT, baudRate: 9600 });
const { ReadlineParser  } = require('@serialport/parser-readline');

// Calculate water depth
function calculate_water_depth(pressure){
  return pressure / (fluid_density * gravity);
}

// Calculate average pressure
function calculate_average_pressure(pressure_data){
  return (pressure_data.map(Number)
                      .filter(x => !isNaN(x))
                      .reduce((a, b) => a + b, 0)) / pressure_data.length;
}

// Read in arduino data from USB port and calculate data
const parser = port.pipe(new ReadlineParser());
parser.on('data', function(data){
  if (tick++ < header_tick) return;

  // remove '\r\n' from the data
  data = data.replace(/(\r\n|\n|\r)/gm, "");

  // console.log(data.toString());
  // add current tick to the pressure data
  data_stream.push({tick: tick, 
                    pressure: data.toString(), 
                    water_depth: calculate_water_depth(data.toString())});
  pressure_data.push(data.toString());
  water_depth_data.push(calculate_water_depth(data.toString()));
  
  //calculate average pressure and set average pressure to current pressure
  average_pressure = calculate_average_pressure(pressure_data.slice(-50));
  average_water_depth = calculate_water_depth(water_depth_data);
  max_pressure = Math.max(...data_stream.map(x => x.pressure));
  max_wave_height = Math.max(...data_stream.map(x => x.water_depth));
  // log pressure and average pressure
  console.log('Pressure: ', data, 
              '\tAverage Pressure: ', average_pressure);
});

// Handle error event
parser.on('error', function(err){
  console.log('Error: ', err.message);
});


//================================================================================================================================//
//=============================================================== ROUTES ===========================================================//
//================================================================================================================================//

app.get("/api", (req, res) => {
  //send the last 10 pressure data
  res.json({ 
    average_pressure: average_pressure,
    data_stream: data_stream.slice(-50)
    // average_water_depth: average_water_depth,
    // max_pressure: max_pressure,
    // max_wave_height: max_wave_height,
  });
  console.log(res);
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
