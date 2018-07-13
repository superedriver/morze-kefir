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
const isNeededKey = ({ keyCode }) => keyCode === BUTTON_CODE;

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

    const keyDown$ = Kefir.fromEvents(document, `mousedown`)
      .map(_ => ({
        action: DOWN,
        timestamp: Date.now()
      }));
    const keyUp$ = Kefir.fromEvents(document, `mouseup`)
      .map(_ => ({
        action: UP,
        timestamp: Date.now()
      }));
    const action$ = keyDown$.merge(keyUp$);
    action$.onValue(e => {
      const isKeyPressed = e.action === DOWN;

      this.setState({
        ...this.state,
        isKeyPressed,
      })
    });
    const longPauses$ = action$.debounce(DOT_DURATION * 3).filter(e => e.action === UP);

    const symbolDelay$ = keyDown$
      .flatMapLatest(start => keyUp$.map(end => end.timestamp - start.timestamp));

    const symbol$ = symbolDelay$.map(getSymbol);
    symbol$.bufferBy(longPauses$).onValue(this.updateWord);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleClearClick);
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
    if(isNeededKey(e)) {
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
