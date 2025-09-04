// -----------------------------
// High-level flow (read this!)
// -----------------------------
// 1) User clicks a button inside #keys  →  click handler runs
// 2) Click handler reads button's data-*  →  builds an ACTION object
//    - e.g. { type: 'DIGIT', value: '7' } or { type: 'OPERATOR', value: '+' }
// 3) We call the REDUCER with (previousState, action)
//    - reducer = "the brain": it decides the NEW STATE based on old state + action
// 4) We save the NEW STATE into calculatorState
// 5) We call renderDisplay() to update the DOM from calculatorState.display
//
// The reducer is PURE: it never touches the DOM and never mutates outer variables.
// Given the same inputs (state + action), it returns the same output (new state).

const INITIAL_STATE = {
  display: '0', // what’s shown on screen
  accumulator: null, // left operand (stored when an operator is pressed)
  operator: null, // '+', '−', '×', '÷'
  awaitingNext: false, // true means: the next digit should REPLACE the display
};

let calculatorState = { ...INITIAL_STATE };

// Renders the current state's display to the screen.
// Single responsibility: read calculatorState.display and paint it.
function renderDisplay() {
  const displayEl = document.querySelector('#display');
  const historyEl = document.querySelector('#history');

  displayEl.textContent = calculatorState.display;

  const { accumulator, operator, awaitingNext, display } = calculatorState;

  // Build history line:
  // - If we have accumulator + operator:
  //   - awaitingNext === true  → show "acc op" (e.g., "96 +")
  //   - awaitingNext === false → show "acc op display" (e.g., "96 + 232")
  // Decide what to show in the history line
  if (accumulator !== null && operator !== null) {
    if (awaitingNext === true) {
      // User just pressed an operator, waiting for next number
      historyEl.textContent = accumulator + ' ' + operator;
    } else {
      // User already typing the right-hand number
      historyEl.textContent = accumulator + ' ' + operator + ' ' + display;
    }
  } else {
    // No operator yet, clear the history line
    historyEl.textContent = '';
  }
}

// -----------------------------
// Reducer (the "brain")
// -----------------------------
// Input: previousState (snapshot before this click), action ({type, value?})
// Output: a NEW state object (do not mutate previousState)
function calculatorReducer(previousState, action) {
  switch (action.type) {
    case 'DIGIT': {
      // If we just pressed an operator, we're awaiting the next number:
      // the first digit typed now should REPLACE the display.
      const pressedDigit = action.value;
      const currentDisplay = previousState.display;

      if (previousState.awaitingNext === true) {
        return {
          ...previousState,
          display: pressedDigit, // start fresh with this digit
          awaitingNext: false, // we're now typing the right-hand number
        };
      }

      // Otherwise, normal typing rules: replace "0" or append.
      let updatedDisplay;
      if (currentDisplay === '0') {
        updatedDisplay = pressedDigit; // avoid "07"
      } else {
        updatedDisplay = currentDisplay + pressedDigit;
      }

      return { ...previousState, display: updatedDisplay };
    }

    case 'DOT': {
      // Allow only one decimal point per number.
      const currentDisplay = previousState.display;

      if (currentDisplay.includes('.')) {
        return previousState; // ignore extra dot
      } else {
        const updatedDisplay = currentDisplay + '.';
        return { ...previousState, display: updatedDisplay };
      }
    }

    case 'AC': {
      // Reset everything back to the initial clean slate.
      return { ...INITIAL_STATE };
    }

    case 'DEL': {
      // Delete the last character. If only one left, go back to "0".
      const currentDisplay = previousState.display;
      let updatedDisplay;

      if (currentDisplay.length > 1) {
        updatedDisplay = currentDisplay.slice(0, -1);
      } else {
        updatedDisplay = '0';
      }

      return { ...previousState, display: updatedDisplay };
    }

    case 'OPERATOR': {
      // Two scenarios:
      // (A) awaitingNext === true  → user is switching operator (e.g., '+' then '×' before typing)
      //     - just replace the operator; keep accumulator/display as-is
      // (B) awaitingNext === false → user just finished typing left operand
      //     - store accumulator, store operator, set awaitingNext so next digit replaces
      if (previousState.awaitingNext === true) {
        return {
          ...previousState,
          operator: action.value, // swap operator only
        };
      } else {
        return {
          ...previousState,
          accumulator: Number(previousState.display), // store left operand as a number
          operator: action.value, // remember which operator was chosen
          awaitingNext: true, // next digit should replace the display
          display: previousState.display + ' ' + action.value, // show operator too
        };
      }
    }

    default:
      // Unknown action: return state unchanged (idempotent).
      return previousState;
  }
}

// -----------------------------
// Event wiring (controller)
// -----------------------------
// Translates a click into an ACTION, runs the reducer, then renders.
const keysContainer = document.querySelector('#keys');

keysContainer.addEventListener('click', (event) => {
  const clickedTarget = event.target;
  if (!(clickedTarget instanceof HTMLButtonElement)) return; // guard: only buttons

  // Read semantic info from HTML:
  //   data-key: "digit" | "dot" | "ac" | "del" | "op" | "eq"
  //   data-value: the payload (e.g., "7", "+", "×")
  const buttonType = clickedTarget.dataset.key;
  const buttonPayload = clickedTarget.dataset.value;

  // Build the action object for the reducer
  let action;
  if (buttonType === 'digit') action = { type: 'DIGIT', value: buttonPayload };
  else if (buttonType === 'dot') action = { type: 'DOT' };
  else if (buttonType === 'ac') action = { type: 'AC' };
  else if (buttonType === 'del') action = { type: 'DEL' };
  else if (buttonType === 'op')
    action = { type: 'OPERATOR', value: buttonPayload };
  else return; // ignore other buttons for now (e.g., '=' until we implement it)

  // Run the "brain": previous state + action -> new state
  calculatorState = calculatorReducer(calculatorState, action);

  // Paint the new state's display to the UI
  renderDisplay();
});

// Initial paint so the UI matches the initial state on load.
renderDisplay();
