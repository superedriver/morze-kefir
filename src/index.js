import React from 'react';
import ReactDOM from 'react-dom';
import Kefir from 'kefir';

import './index.css';
import App from './components/App';
import registerServiceWorker from './registerServiceWorker';

import {
  CODE_TO_LETTER,
  DOT,
  DASH,
  ERROR,
  DOT_DURATION,
  BUTTON_CODE,
  DOWN,
  UP,
  SEED,
} from './constants';

// additional code
const getSymbol = symbolDuration => symbolDuration <= DOT_DURATION ? DOT : DASH;
const isClearButton = ({ keyCode }) => keyCode === BUTTON_CODE;

const makeStore = fn$ => {
  return fn$
    .scan((state, fn) => fn(state), SEED)
    .skipDuplicates();
};

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

const letter$ = symbol$.bufferBy(longPauses$);

const handleUpdateWord$ = makeStore(
  letter$.map(
    letterCode => store => {
      const word = store.word + CODE_TO_LETTER[letterCode.join('')];

      return { word }
    }
  )
);

handleUpdateWord$.log("handleUpdateWord$");

const isKeyPressed$ = action$.map(e => e.action === DOWN);

isKeyPressed$.log("isKeyPressed$");



ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
