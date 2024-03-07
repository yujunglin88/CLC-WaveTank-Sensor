import React from "react";
import { useState, useEffect } from 'react';
import Toggle from "./components/Toggle";
import { LineChart, Line, YAxis, Tooltip, Legend, ReferenceLine } from 'recharts';
import "./App.css";

function useWindowDimensions() {

  const hasWindow = typeof window !== 'undefined';

  function getWindowDimensions() {
    const width = hasWindow ? window.innerWidth : null;
    const height = hasWindow ? window.innerHeight : null;
    return {
      width,
      height,
    };
  }

  const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

  useEffect(() => {
    if (hasWindow) {
      function handleResize() {
        setWindowDimensions(getWindowDimensions());
      }

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [hasWindow]);

  return windowDimensions;
}

function App() {
  const [isFetchingData, setIsFetchingData] = useState(false);
  const { height, width } = useWindowDimensions();
  const [data, setData] = useState(null);
  const [average_pressure, setAveragePressure] = useState(0);
  const [average_water_depth, setAverageWaterDepth] = useState(0);
  const [data_p_y_min, setDataPYMin] = useState(0);
  const [data_p_y_max, setDataPYMax] = useState(0);
  const [data_w_y_min, setDataWYMin] = useState(0);
  const [data_w_y_max, setDataWYMax] = useState(0);
  const [chart_type, setChartType] = useState('Relative');

  const ChartSelecter = () => {
    const containerStyle = {
      display: 'flex',
      flexDirection: 'row', // Arrange children horizontally
      justifyContent: 'space-between', // Add space between the two components
      alignItems: 'center', // Center items vertically
    };

    const buttonStyle = {
      display: 'flex',
      height: 25,
      margin: 5,
      alignItems: 'center'
    }

    return (
      <div style = {containerStyle} >
        <label>Water Level Chart Display: </label>
        <select
          value={chart_type}
          onChange={e => setChartType(e.target.value)}
          style={buttonStyle}
        >
          <option value="Relative">Relative</option>
          <option value="Absolute">Absolute</option>
        </select>
      </div>
    );};

  const [chart_height, updateChartHeight] = useState(height / 2.5);
  useEffect(() => {
    updateChartHeight(height / 2.5);
  }, [height]);

  const renderPressureChart = (
    <LineChart width={width} height={chart_height} data={data} 
      margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
      <Line type="monotone" isAnimationActive={false} dot={false} dataKey="pressure" stroke="#8884d8" />
      <Line type="monotone" isAnimationActive={false} dot={false} dataKey="ambient_pressure" stroke="#8884d8" />
      <ReferenceLine y={average_pressure} label="Average Pressure" stroke="red" strokeDasharray="3 3" />
      <YAxis domain={[data_p_y_min, data_p_y_max]}/>
      <Tooltip />
      <Legend />
    </LineChart>
  );

  const renderDepthChartRelative = (
    <LineChart width={width} height={chart_height} data={data} 
      margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
      {/* <Line type="monotone" isAnimationActive={false} dot={false} dataKey="water_depth" stroke="#8884d8" />
      <ReferenceLine y={average_water_depth} label="Average Depth" stroke="red" strokeDasharray="3 3" /> */}
      <Line type="monotone" isAnimationActive={false} dot={false} dataKey="water_relative" stroke="#8884d8" />
      <ReferenceLine y={0} label="Water Line" stroke="red" strokeDasharray="3 3" />
      <YAxis domain={[data_w_y_min, data_w_y_max]} />
      <Tooltip />
      <Legend />
    </LineChart>
  );

  const renderDepthChartAbsolute = (
    <LineChart width={width} height={chart_height} data={data} 
      margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
      <Line type="monotone" isAnimationActive={false} dot={false} dataKey="water_depth" stroke="#8884d8" />
      <ReferenceLine y={average_water_depth} label="Average Depth" stroke="red" strokeDasharray="3 3" />
      <YAxis domain={[data_w_y_min, data_w_y_max]} />
      <Tooltip />
      <Legend />
    </LineChart>
  );

  

  // listen to the server to continuously get the latest pressure data
  React.useEffect(() => {
    let interval;

    if (isFetchingData){
      interval = setInterval(() => {
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
        
      }, 150);
    }

    return () => clearInterval(interval);
  }, [isFetchingData]);

  const handleToggleChange = () => {
    setIsFetchingData(!isFetchingData);
  };

  return (
    <div className="App">
      <header className="App-header">
      {<ChartSelecter/>}
      <Toggle toggle={isFetchingData} handleToggleChange={handleToggleChange} on = "On" off = "Paused" />
      {renderPressureChart}
      {chart_type == "Relative" ? renderDepthChartRelative : renderDepthChartAbsolute}
      </header>
    </div>
  );
}

export default App;