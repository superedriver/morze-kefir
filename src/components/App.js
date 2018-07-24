import React, { Component } from 'react';
import './App.css';
import morse from '../morze.png'

class App extends Component {

  render() {
    const { isKeyPressed$, word$ } = this.props;

    const rectClassName = isKeyPressed$
      ? '-red'
      : '-green';

    return (
      <div className="App">
        <h1>Use mouse button for Morzing</h1>
        <img
          src={morse}
          alt="morse code"
          width="300"
        />
        <br/>
        <h2>Use SPACE button for clearing</h2>
        <div className={`rectangle ${rectClassName}`} />
        <br/>
        <h2>{ word$ }</h2>
      </div>
    );
  }
}

export default App;
