import React, { Component } from 'react';
import './App.css';
import morse from '../morze.png'
import {
  CODE_TO_LETTER,
  DOT,
  DASH,
  ERROR,
  DOT_DURATION,
  BUTTON_CODE,
} from '../constants';

// additional code
const getSymbol = symbolDuration => symbolDuration <= DOT_DURATION ? DOT : DASH;
const isPauseShort = pause => pause < DOT_DURATION;
const INITIAL_STATE = {
  symbol: '',
  letterCode: '',
  word: '',
  startKeyDown: null,
  startKeyUp: null,
  pauseTimerId: null,
};

class App extends Component {

  constructor() {
    super();

    this.state = INITIAL_STATE;

    this.handleSpaceDown = this.handleSpaceDown.bind(this);
    this.handleSpaceUp = this.handleSpaceUp.bind(this);
    this.handleClearClick = this.handleClearClick.bind(this);
    this.updateLetter = this.updateLetter.bind(this);
    this.updateWord = this.updateWord.bind(this);
    this.getLetter = this.getLetter.bind(this);
    this.handlePauseTimeoutEnd = this.handlePauseTimeoutEnd.bind(this);
  }

  componentWillMount() {
    document.addEventListener('keydown', this.handleSpaceDown);
    document.addEventListener('keyup', this.handleSpaceUp);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleSpaceDown);
    document.removeEventListener('keyup', this.handleSpaceUp);
  }

  getLetter() {
    const { symbol, letterCode } = this.state;

    return CODE_TO_LETTER[letterCode + symbol] || ERROR;
  }

  updateLetter(e) {
    const { symbol, letterCode } = this.state;

    this.setState({
      ...this.state,
      startKeyDown: e.timeStamp,
      startKeyUp: null,
      symbol: '',
      letterCode: letterCode + symbol,
    });
  }

  updateWord(e) {
    const { word } = this.state;
    const letter = this.getLetter();

    this.setState({
      ...this.state,
      startKeyDown: e.timeStamp,
      startKeyUp: null,
      symbol: '',
      letterCode: '',
      word: word + letter,
    });
  }

  handleSpaceDown(e) {
    if(e.keyCode === BUTTON_CODE) {
      const { startKeyUp, startKeyDown, pauseTimerId } = this.state;

      if(pauseTimerId) {
        clearTimeout(pauseTimerId)
      }

      if (!startKeyDown && startKeyUp) {
        const pauseDuration = e.timeStamp - startKeyUp;

        if(isPauseShort(pauseDuration)) {
          this.updateLetter(e);
        } else {
          this.updateWord(e);
        }
      } else if (!startKeyDown && !startKeyUp) {
        this.setState({
          ...this.state,
          startKeyDown: e.timeStamp,
        });
      }
    }
  }

  handlePauseTimeoutEnd() {
    const { word } = this.state;
    const letter = this.getLetter();

    this.setState({
      ...INITIAL_STATE,
      word: word + letter,
    });
  }

  handleSpaceUp(e) {
    if(e.keyCode === BUTTON_CODE) {
      const startKeyUp = e.timeStamp;
      const { startKeyDown } = this.state;
      const symbol = getSymbol(startKeyUp - startKeyDown);

      this.setState({
        startKeyDown: null,
        startKeyUp,
        symbol,
        pauseTimerId: setTimeout(this.handlePauseTimeoutEnd, DOT_DURATION),
      });
    }
  }

  handleClearClick() {
    this.setState(INITIAL_STATE);
  }

  render() {
    const { word, startKeyDown } = this.state;
    const rectClassName = startKeyDown
      ? '-red'
      : '-green';

    return (
      <div className="App">
        <h1>Use SPACE button for Morzing</h1>
        <img
          src={morse}
          alt="morse code"
          width="300"
        />
        <br/>
        <div className={`rectangle ${rectClassName}`} />
        <br/>
        <button onClick={this.handleClearClick}>
          Clear
        </button>
        <h2>{ word }</h2>
      </div>
    );
  }
}

export default App;
