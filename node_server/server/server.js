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

const fluid_density = 997.77; // kg/m^3 (approximate density of water)
const gravity  = 9.81;

var ambient_pressure; // pressure above sea level
var pressure_data = []; // [1000, 1001, 1002, ...]
var water_depth_data = []; // [0.1, 0.2, 0.3, ...]
var data_out = []; // [{tick: 1, pressure: 1000, water_depth: 0.1}, ...]
var data_y_min = 0;
var data_y_max = 0;

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
  if (tick++ < 0) return;
  

  // remove '\r\n' from the data
  data = data.replace(/(\r\n|\n|\r)/gm, "");

  // console.log(data);

  //parse json data
  data = JSON.parse(data);


  data_y_max = ( Math.max(...data_out.map(x => x.pressure) )+ 500);
  data_y_min = ( ambient_pressure - 500);

  console.log("Ambient Pressure: ",data.pressure_2, "\tWater Pressure: ", data.pressure_1, "\tmin: ", data_y_min, "\tmax: ", data_y_max);
  // add current tick to the pressure data
  data_out.push({tick: tick, 
                    pressure: data.pressure_1, 
                    water_depth: calculate_water_depth(data.pressure_1),
                    ambient_pressure: data.pressure_2,
                  });
  ambient_pressure = data.pressure_2;
  pressure_data.push(data.pressure_1);
  water_depth_data.push(calculate_water_depth(data.pressure_1));
  
  //calculate average pressure and set average pressure to current pressure
  average_pressure = calculate_average_pressure(pressure_data.slice(-50));
  average_water_depth = calculate_water_depth(water_depth_data);
  max_pressure = Math.max(...data_out.map(x => x.pressure));
  max_wave_height = Math.max(...data_out.map(x => x.water_depth));

  // kepp only the latest 50 data points
  if (tick > 50){
    pressure_data.shift();
    water_depth_data.shift();
    data_out.shift();
  }

  // log pressure and average pressure
  // console.log('Pressure: ', data, 
  //             '\tAverage Pressure: ', average_pressure);
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
    data_stream: data_out,
    data_y_min: data_y_min,
    data_y_max: data_y_max
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
