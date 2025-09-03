const INITIAL_STATE = {
  display: '0',
  accumulator: null,
  operator: null,
  awaitingNext: false,
};

let calculatorState = { ...INITIAL_STATE };

function renderDisplay() {
  document.querySelector('#display').textContent = calculatorState.display;
}

function calculatorReducer(previousState, action) {
  switch (action.type) {
    case 'DIGIT': {
      const pressedDigit = action.value;
      const currentDisplay = previousState.display;
      let updatedDisplay;

      if (currentDisplay === '0') {
        updatedDisplay = pressedDigit; // replace leading "0"
      } else {
        updatedDisplay = currentDisplay + pressedDigit; // append
      }

      return { ...previousState, display: updatedDisplay };
    }

    case 'DOT': {
      const currentDisplay = previousState.display;

      if (currentDisplay.includes('.')) {
        return previousState; // ignore extra dot
      } else {
        const updatedDisplay = currentDisplay + '.';
        return { ...previousState, display: updatedDisplay };
      }
    }

    case 'AC': {
      return { ...INITIAL_STATE }; // full reset
    }

    case 'DEL': {
      const currentDisplay = previousState.display;
      let updatedDisplay;

      if (currentDisplay.length > 1) {
        updatedDisplay = currentDisplay.slice(0, currentDisplay.length - 1); // remove last char
      } else {
        updatedDisplay = '0'; // clamp at "0"
      }

      return { ...previousState, display: updatedDisplay };
    }

    default:
      return previousState;
  }
}

const keysContainer = document.querySelector('#keys');

keysContainer.addEventListener('click', (event) => {
  const clickedTarget = event.target;
  if (!(clickedTarget instanceof HTMLButtonElement)) return;

  const buttonType = clickedTarget.dataset.key; // "digit" | "dot" | "ac" | "del"
  const buttonPayload = clickedTarget.dataset.value; // e.g., "7" for digits

  let action;
  if (buttonType === 'digit') action = { type: 'DIGIT', value: buttonPayload };
  else if (buttonType === 'dot') action = { type: 'DOT' };
  else if (buttonType === 'ac') action = { type: 'AC' };
  else if (buttonType === 'del') action = { type: 'DEL' };
  else return;

  calculatorState = calculatorReducer(calculatorState, action);
  renderDisplay();
});

// initial paint
renderDisplay();
