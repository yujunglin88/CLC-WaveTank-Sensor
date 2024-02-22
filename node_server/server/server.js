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

var tick = -2;
const DATA_STREAM_SIZE = 100;

const fluid_density = 997.77; // kg/m^3 (approximate density of water)
const gravity  = 9.81;

var ambient_pressure; // pressure above sea level
var pressure_data = []; // [1000, 1001, 1002, ...]
var water_depth_data = []; // [0.1, 0.2, 0.3, ...]
var data_out = []; // [{tick: 1, pressure: 1000, water_depth: 0.1}, ...]

var water_depth = 0;
var water_relative = 0;
var average_pressure = 0;
var average_water_depth = 0;
var max_pressure = 0;
var max_wave_height = 0;

var data_p_y_min = 0;
var data_p_y_max = 0;
var data_w_y_min = 0;
var data_w_y_max = 0;

//================================================================================================================================//
//======================================================= DATA PROCESSING FUNCTIONS ==============================================//
//================================================================================================================================//

// Read in arduino data from USB port
const {SerialPort} = require('serialport');
var port = new SerialPort({ path: USB_PORT, baudRate: 9600 });
const { ReadlineParser  } = require('@serialport/parser-readline');

// Calculate water depth
function calculate_water_depth(pressure){
  // round to 2 decimal places
  return Math.round(((pressure- ambient_pressure) / (fluid_density * gravity))*10000)/100 ;
}

// Calculate average pressure
function calculate_average_pressure(pressure_data){
  return (pressure_data.map(Number)
                      .filter(x => !isNaN(x))
                      .reduce((a, b) => a + b, 0)) / pressure_data.length;
}

//calculate average water depth
function calculate_average_water_depth(water_depth_data){
  return (water_depth_data.map(Number)
                      .filter(x => !isNaN(x))
                      .reduce((a, b) => a + b, 0)) / water_depth_data.length;
}

// Read in arduino data from USB port and calculate data
const parser = port.pipe(new ReadlineParser());
parser.on('data', function(data){
  if (tick++ < 0) return;
  
  // remove '\r\n' from the data
  data = data.replace(/(\r\n|\n|\r)/gm, "");

  //parse json data
  data = JSON.parse(data);
  
  //calculate average pressure and set average pressure to current pressure
  average_pressure    = calculate_average_pressure(pressure_data.slice(-50));
  average_water_depth = calculate_average_water_depth(water_depth_data);
  max_pressure        = Math.max(...data_out.map(x => x.pressure));
  max_wave_height     = Math.max(...data_out.map(x => x.water_depth));
  ambient_pressure    = data.pressure_2;
  water_depth     = calculate_water_depth(data.pressure_1);
  water_relative  = Math.round((water_depth - average_water_depth)*100) / 100;

  data_p_y_max = (Math.max(...data_out.map(x => x.pressure)) + 500);
  data_p_y_min = (ambient_pressure - 500);
  data_w_y_max = (Math.max(...data_out.map(x => x.water_depth)) + 0.5);
  data_w_y_min = (Math.min(...data_out.map(x => x.water_depth)) - 0.5);

  pressure_data.push(data.pressure_1);
  water_depth_data.push(water_depth);
  data_out.push({tick: tick, 
                pressure: data.pressure_1, 
                water_depth: water_depth,
                water_relative: water_relative,
                ambient_pressure: ambient_pressure,
              });
  
  // kepp only the latest data points of DATA_STREAM_SIZE
  if (tick > DATA_STREAM_SIZE){
    pressure_data.shift();
    water_depth_data.shift();
    data_out.shift();
  }

  console.log("Ambient Pressure: ",data.pressure_2, "\tWater Pressure: ", data.pressure_1, "\trelative: ", relative);
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
    average_water_depth: average_water_depth,
    max_pressure: max_pressure,
    max_wave_height: max_wave_height,
    
    data_p_y_min: data_p_y_min,
    data_p_y_max: data_p_y_max,
    data_w_y_min: data_w_y_min,
    data_w_y_max: data_w_y_max,

    data_stream: data_out
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
