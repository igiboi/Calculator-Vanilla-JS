let display = '0';

//--- render ---
function render(value) {
  document.querySelector('#display').textContent = value;
}

function updateDisplay(current, action) {
  switch (action.type) {
    case 'DIGIT': {
      // requirement: replace 0 OR append
      const digit = action.value;
      if (current === '0') {
        return digit;
      } else {
        return current + digit;
      }
    }
    case 'DOT': {
      if (current.includes('.')) {
        return current;
      } else {
        return current + '.';
      }
    }
    case 'AC': {
      return '0';
    }

    case 'DEL': {
      if (display.length > 1) {
        return display.slice(0, display.length - 1);
      } else {
        return '0';
      }
    }

    default:
      return current; // no change for other actions
  }
}

// 1. Find the calculator keys area
const keys = document.querySelector('#keys');

// 2. Listen for clicks inside the keys area
keys.addEventListener('click', function (event) {
  // 3. Figure out what element was clicked
  const clickedElement = event.target;

  // 4. Only continue if it was a button
  if (!(clickedElement instanceof HTMLButtonElement)) {
    return; // stop if you clicked something else
  }

  // 5. Look at the button’s dataset
  const buttonKey = clickedElement.dataset.key; // e.g. "digit"
  const buttonValue = clickedElement.dataset.value; // e.g. "7"

  // 6. Decide what action object to create
  let action;
  if (buttonKey === 'digit') {
    action = { type: 'DIGIT', value: buttonValue };
  } else if (buttonKey === 'dot') {
    action = { type: 'DOT' };
  } else if (buttonKey === 'ac') {
    action = { type: 'AC' };
  } else if (buttonKey === 'del') {
    action = { type: 'DEL' };
  } else {
    return; // not handling other buttons yet
  }

  // 7. Update the display using our reducer
  display = updateDisplay(display, action);

  // 8. Re-render the UI
  render(display);
});
