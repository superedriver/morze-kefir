import React from 'react';
import ReactDOM from 'react-dom';
import Kefir from 'kefir';

import './index.css';
import App from './components/App';
import connect from './connect';
import registerServiceWorker from './registerServiceWorker';

import {
  getSymbol,
  isClearButton,
  makeStore,
} from "./helpers";

import {
  CODE_TO_LETTER,
  ERROR,
  DOT_DURATION,
  DOWN,
  UP,
  SEED,
} from './constants';

const keyDown$ = Kefir.fromEvents(document, `mousedown`)
  .map(_ => ({
    action: DOWN,
    timestamp: Date.now()
  }));
//---D-----D---------------D--

const keyUp$ = Kefir.fromEvents(document, `mouseup`)
  .map(_ => ({
    action: UP,
    timestamp: Date.now()
  }));
//------U-----------U--------U---

const clearPressed$ = Kefir.fromEvents(document, `keyup`)
  .filter(isClearButton);
//------------------------------SPACE--

const action$ = keyDown$.merge(keyUp$);
//---D-U---D-------U-------D-U---

const longPauses$ = action$.debounce(DOT_DURATION * 3).filter(e => e.action === UP);
//-------------------------true------

const symbolDelay$ = keyDown$
  .flatMapLatest(start => keyUp$.map(end => end.timestamp - start.timestamp));
//------100-----------400------100---

const symbol$ = symbolDelay$.map(getSymbol);
//---------'.'----------'-'------'.'---

const letter$ = symbol$.bufferBy(longPauses$)
  .map(letterCode => CODE_TO_LETTER[letterCode.join('')] || ERROR);
//--------------------------['.','-']-['.']--------
//-----------------------------------'A'---'E'--------

const word$ = makeStore(Kefir.merge([
  letter$.map(letter => store => ({ word: store.word + letter })),
  clearPressed$.map(_ => _ => SEED)
]));
//------{ word: 'A'}------{ word: 'AE' }------{ word: '' }--

const isKeyPressed$ = action$.map(e => ({ isKeyPressed: e.action === DOWN }));
//---{ isKeyPressed: true }----{ isKeyPressed: false }---

const observesToConnect = [
  word$,
  isKeyPressed$
];

const WrappedComponent = connect(observesToConnect, App);

ReactDOM.render(<WrappedComponent />, document.getElementById('root'));
registerServiceWorker();
