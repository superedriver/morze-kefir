import React, { Component } from 'react';
import Kefir from 'kefir';
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
const isPauseLong = pauseDuration => pauseDuration > DOT_DURATION;
// const isNeededKey = ({ keyCode }) => keyCode === BUTTON_CODE;

const INITIAL_STATE = {
  word: '',
  isKeyPressed: false,
};

class App extends Component {

  constructor() {
    super();

    this.state = INITIAL_STATE;

    this.handleClearClick = this.handleClearClick.bind(this);
    this.updateWord = this.updateWord.bind(this);
  }

  componentWillMount() {
    const keyDownTime$ = Kefir.fromEvents(document, `mousedown`)
      .map(_ => Date.now());
    const keyUpTime$ = Kefir.fromEvents(document, `mouseup`)
      .map(_ => Date.now());

    const symbolDelay$ = keyDownTime$
      .flatMapLatest(startTime => keyUpTime$.map(endTime => endTime - startTime));
    symbolDelay$.log();
    const pauseDelay$ = keyUpTime$
      .flatMapLatest(startTime => keyDownTime$.map(endTime => endTime - startTime));

    const symbol$ = symbolDelay$.map(getSymbol);
    const longPauses$ = pauseDelay$.filter(isPauseLong);
    const letterCode$ = symbol$.bufferBy(longPauses$);
    letterCode$.onValue(this.updateWord);
  }

  updateWord(letterCode) {
    const { word } = this.state;
    const letter = CODE_TO_LETTER[letterCode.join('')] || ERROR;

    this.setState({
      ...this.state,
      word: word + letter,
    });
  }

  handleClearClick() {
    this.setState(INITIAL_STATE);
  }

  render() {
    const { word, isKeyPressed } = this.state;
    const rectClassName = isKeyPressed
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
