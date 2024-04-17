// App.js
import React from 'react';
import './App.css';
import Canvas from './Canvas';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Real-Time Collaboration Canvas</h1>
        <p>Connect and create with others in real time.</p>
      </header>
      <div className="Canvas-container">
        {/* Ensure the Canvas size is controlled within the component */}
        <Canvas width={500} height={500} />
      </div>
    </div>
  );
}

export default App;
