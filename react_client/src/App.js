import React from "react";
import { LineChart, Line, CartesianGrid, YAxis, Tooltip, Legend, ReferenceLine} from 'recharts';
import "./App.css";



function App() {
  const [data, setData] = React.useState(null);
  const [average_pressure, setAveragePressure] = React.useState(0);
  const [average_water_depth, setAverageWaterDepth] = React.useState(0);
  const [data_p_y_min, setDataPYMin] = React.useState(0);
  const [data_p_y_max, setDataPYMax] = React.useState(0);
  const [data_w_y_min, setDataWYMin] = React.useState(0);
  const [data_w_y_max, setDataWYMax] = React.useState(0);


  const renderPressureChart = (
    <LineChart width={1600} height={400} data={data} 
      margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
      <Line type="monotone" isAnimationActive={false} dot={false} dataKey="pressure" stroke="#8884d8" />
      <Line type="monotone" isAnimationActive={false} dot={false} dataKey="ambient_pressure" stroke="#8884d8" />
      <ReferenceLine y={average_pressure} label="Average Pressure" stroke="red" strokeDasharray="3 3" />
      {/* <CartesianGrid stroke="#ccc" /> */}
      <YAxis domain={[data_p_y_min, data_p_y_max]}/>
      <Tooltip />
      <Legend />
    </LineChart>
  );

  const renderDepthChart = (
    <LineChart width={1600} height={400} data={data} 
      margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
      {/* <Line type="monotone" isAnimationActive={false} dot={false} dataKey="water_depth" stroke="#8884d8" />
      <ReferenceLine y={average_water_depth} label="Average Depth" stroke="red" strokeDasharray="3 3" /> */}
      <Line type="monotone" isAnimationActive={false} dot={false} dataKey="water_relative" stroke="#8884d8" />
      <ReferenceLine y={0} label="Water Line" stroke="red" strokeDasharray="3 3" />
      {/* <CartesianGrid stroke="#ccc" /> */}
      <YAxis domain={[data_w_y_min, data_w_y_max]} />
      <Tooltip />
      <Legend />
    </LineChart>
  );


  // listen to the server to continuously get the latest pressure data
  React.useEffect(() => {
    const interval = setInterval(() => {
      try {
        fetch("/api")
          .then((res) => res.json())
          .then((data) => {
            console.log(data);
            setData(data.data_stream);
            setAveragePressure(data.average_pressure);
            setAverageWaterDepth(data.average_water_depth);
            setDataPYMin(data.data_y_min);
            setDataPYMax(data.data_y_max);
            setDataWYMin(data.data_w_y_min);
            setDataWYMax(data.data_w_y_max);
          });

      } catch (error) {
        // no need to update the state if the fetch fails
      }
      
    }, 100);
    return () => clearInterval(interval);
  }, []);



  return (
    <div className="App">
      <header className="App-header">
        {/* <img src={logo} className="App-logo" alt="logo" /> */}
        {/* <p>{!data ? "Loading..." : data}</p> */}
        <p>{renderPressureChart}</p>
        <p>{renderDepthChart}</p>
      </header>
    </div>
  );
}

export default App;