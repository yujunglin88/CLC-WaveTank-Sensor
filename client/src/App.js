import React from "react";
import { LineChart, Line, CartesianGrid, XAxis, YAxis } from 'recharts';
import "./App.css";



function App() {
  const [data, setData] = React.useState(null);

  const test_data = [{name: 'Page A', uv: 400, pv: 2400, amt: 2400},
                  {name: 'Page B', uv: 3000,pv: 1398,amt: 2210,},
                  {name: 'Page C',uv: 2000,pv: 9800,amt: 2290,},
                  {name: 'Page D',uv: 2780,pv: 3908,amt: 2000,},
                  {name: 'Page E',uv: 1890,pv: 4800,amt: 2181,},
                  {name: 'Page F',uv: 2390,pv: 3800,amt: 2500,},
                  {name: 'Page G',uv: 3490,pv: 4300,amt: 2100}
  ];

                  
  const renderLineChart = (
    <LineChart width={600} height={300} data={data}>
      <Line type="monotone" dataKey="pressure" stroke="#8884d8" />
      <CartesianGrid stroke="#ccc" />
      <XAxis dataKey="name" />
      <YAxis />
    </LineChart>
  );


  // listen to the server to continuously get the latest pressure data
  React.useEffect(() => {
    const interval = setInterval(() => {
      try {
        fetch("/api")
        .then((res) => res.json())
        .then((data) => {
          setData(data.data_stream);
        });
      } catch (error) {
          // no need to update the state if the fetch fails
      }
      
    }, 30);
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