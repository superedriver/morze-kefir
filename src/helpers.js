import { CLEAR_BUTTON_CODE, DASH, DOT, DOT_DURATION, SEED } from "./constants";

export const handleError = e => console.warn(e);

export const reduceProperties = arrayOfObjects => (
  arrayOfObjects.reduce(function(acc, current) {
    return {
      ...acc,
      ...current
    };
  }, {})
);

export const getSymbol = symbolDuration => symbolDuration <= DOT_DURATION ? DOT : DASH;

export const isClearButton = ({ keyCode }) => keyCode === CLEAR_BUTTON_CODE;

export const makeStore = fn$ => {
  return fn$
    .scan((state, fn) => fn(state), SEED)
    .skipDuplicates();
};