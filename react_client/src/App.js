import React from "react";
import { LineChart, Line, CartesianGrid, YAxis, Tooltip, Legend, ReferenceLine} from 'recharts';
import "./App.css";



function App() {
  const [data, setData] = React.useState(null);
  const [average_pressure, setAveragePressure] = React.useState(0);

  const renderLineChart = (
    <LineChart width={1400} height={800} data={data} 
      margin={{ top: 5, right: 30, left: 50, bottom: 5 }}>
      <Line type="monotone" dataKey="pressure" stroke="#8884d8" />
      <ReferenceLine y={average_pressure} label="Average Depth" stroke="red" strokeDasharray="3 3" />
      <CartesianGrid stroke="#ccc" />
      <YAxis domain={[99000, 100000]}/>
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
          });

      } catch (error) {
          // no need to update the state if the fetch fails
      }
      
    }, 1000);
    return () => clearInterval(interval);
  }, []);



  return (
    <div className="App">
      <header className="App-header">
        {/* <img src={logo} className="App-logo" alt="logo" /> */}
        {/* <p>{!data ? "Loading..." : data}</p> */}
        <p>{renderLineChart}</p>
      </header>
    </div>
  );
}

export default App;