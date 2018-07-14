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
const DOWN = 'D';
const UP = 'U';

// additional code
const getSymbol = symbolDuration => symbolDuration <= DOT_DURATION ? DOT : DASH;
const isClearButton = ({ keyCode }) => keyCode === BUTTON_CODE;

let keyDown$ = Kefir.fromEvents(document, `mousedown`)
  .map(_ => ({
    action: DOWN,
    timestamp: Date.now()
  }));
let keyUp$ = Kefir.fromEvents(document, `mouseup`)
  .map(_ => ({
    action: UP,
    timestamp: Date.now()
  }));
const action$ = keyDown$.merge(keyUp$);

const longPauses$ = action$.debounce(DOT_DURATION * 3).filter(e => e.action === UP);

const symbolDelay$ = keyDown$
  .flatMapLatest(start => keyUp$.map(end => end.timestamp - start.timestamp));

const symbol$ = symbolDelay$.map(getSymbol);

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
    document.addEventListener('keydown', this.handleClearClick);

    action$.onValue(e => {
      const isKeyPressed = e.action === DOWN;

      this.setState({
        ...this.state,
        isKeyPressed,
      })
    });

    symbol$.bufferBy(longPauses$).onValue(this.updateWord);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleClearClick);
    keyDown$ = null;
    keyUp$ = null;
  }

  updateWord(letterCode) {
    const { word } = this.state;
    const letter = CODE_TO_LETTER[letterCode.join('')] || ERROR;

    this.setState({
      ...this.state,
      word: word + letter,
    });
  }

  handleClearClick(e) {
    if(isClearButton(e)) {
      this.setState(INITIAL_STATE);
    }
  }

  render() {
    const { word, isKeyPressed } = this.state;
    const rectClassName = isKeyPressed
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
        <h2>{ word }</h2>
      </div>
    );
  }
}

export default App;
