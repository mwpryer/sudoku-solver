import Sudoku from "./Sudoku.js";
import SudokuDOM from "./SudokuDOM.js";
import { easy, medium, hard, extreme, empty } from "./constants.js";

// DOM elements
const panelEl = document.getElementById("panel");
const gridEl = document.getElementById("grid");
const boardSel = document.getElementById("board-sel");
const undoBtn = document.getElementById("undo-btn");
const redoBtn = document.getElementById("redo-btn");
const hintBtn = document.getElementById("hint-btn");
const solveBtn = document.getElementById("solve-btn");
const resetBtn = document.getElementById("reset-btn");
const draftCb = document.getElementById("draft-cb");
const mdlEl = document.getElementById("mdl");
const mdlTitleEl = document.getElementById("mdl-title");
const mdlDescEl = document.getElementById("mdl-body");
const mdlBtn = document.getElementById("mdl-btn");
const mdlBackdrop = document.getElementById("mdl-backdrop");

// State
let currBoard;
let currCell;
let currCellValue;
let draftMode = draftCb.checked;
let customMode = false;
let isSolved = false;
let isInitial = true;
let undoStack = [];
let redoStack = [];

// Initialize Sudoku DOM interface
const sudokuDOM = new SudokuDOM(gridEl);

// Set initial board in DOM
function initializeBoard(board) {
  currBoard = board;
  sudokuDOM.clearBoard();
  setBoard(board);
  // Make distinction between initial values and others
  sudokuDOM.paintBoard(board, "initial");

  undoStack = [];
  undoBtn.disabled = true;
  redoBtn.disabled = true;
}

// Set board in DOM
function setBoard(board) {
  sudokuDOM.setBoard(board);
  // Highlight new potential conflicts
  sudokuDOM.stripBoard(["highlight-conflict"]);
  sudokuDOM.highlightConflicts();

  // Evaluate new board to update state and UI
  evaluateBoard(board);
  if (currCell) currCell.blur();
}

// Update UI and state reflective of board
function evaluateBoard(board) {
  // Check if board is solved
  isSolved = Sudoku.isComplete(board);
  // Check if board is initial board and has no drafts
  isInitial = Sudoku.equal(currBoard, board) && !sudokuDOM.hasDrafts();
  // Update UI
  hintBtn.disabled = isSolved;
  solveBtn.disabled = isSolved;
  resetBtn.disabled = isInitial;
}

// Set drafts in DOM
function setDrafts(drafts) {
  sudokuDOM.setDrafts(drafts);
}

// Validate and set a cells value/draft to num
function setCell(num) {
  // Do not allow input in fixed value cells
  if (currCell.classList.contains("initial")) return;
  // Check if valid number
  const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  if (!num || !nums.includes(num)) return;

  if (draftMode) {
    // Only update if cell has new draft
    if (sudokuDOM.getDraft(currCell) !== num) {
      save();
      sudokuDOM.setDraft(currCell, num);
      evaluateBoard(sudokuDOM.getBoard());
    }
  } else {
    // Only update if cell has new value
    if (sudokuDOM.getValue(currCell) !== num) {
      save();
      sudokuDOM.setValue(currCell, num);
      // Check if completed board
      evaluateBoard(sudokuDOM.getBoard());
      if (isSolved) complete();
    }
  }
}

// Update state and focus cell in DOM
function focusCell(cellEl) {
  if (!cellEl) return;
  currCell = cellEl;
  currCellValue = cellEl.value;
  sudokuDOM.focusCell(cellEl);
}

// Update state and blur cell in DOM
function blurCell(cellEl) {
  if (!cellEl) return;
  currCell = null;
  currCellValue = "";
  sudokuDOM.blurCell(cellEl);
}

// Try solving board in DOM and return it
function solve() {
  if (sudokuDOM.hasConflicts()) {
    showModal("conflicts");
    return;
  }

  const solved = Sudoku.solve(sudokuDOM.getBoard());
  return solved;
}

// Set solved board in DOM and cleanup
function complete() {
  const solved = Sudoku.solve(sudokuDOM.getBoard());
  setBoard(solved);

  sudokuDOM.removeDrafts();
  if (currCell) currCell.blur();
}

// Save board state
function save() {
  const state = {
    board: sudokuDOM.getBoard(),
    drafts: sudokuDOM.getDrafts(),
    cell: currCell,
  };
  undoStack.push(state);
  redoStack = [];
  undoBtn.disabled = false;
  redoBtn.disabled = true;
}

// Undo to previous board state
function undo() {
  redoBtn.disabled = false;

  // Add current state to redo stack
  const currState = {
    board: sudokuDOM.getBoard(),
    drafts: sudokuDOM.getDrafts(),
    cell: currCell,
  };
  redoStack.push(currState);

  const state = undoStack.pop();
  setBoard(state.board);
  setDrafts(state.drafts);
  focusCell(state.cell);

  if (!undoStack[0]) undoBtn.disabled = true;
}

// Reverse undo action
function redo() {
  undoBtn.disabled = false;

  // Add current state to undo stack
  const currState = {
    board: sudokuDOM.getBoard(),
    drafts: sudokuDOM.getDrafts(),
    cell: currCell,
  };
  undoStack.push(currState);

  const state = redoStack.pop();
  setBoard(state.board);
  setDrafts(state.drafts);
  focusCell(state.cell);

  if (!redoStack[0]) redoBtn.disabled = true;
}

// Display modal according to type
function showModal(type) {
  if (mdlEl.style.display === "block") return;

  switch (type) {
    case "conflicts": {
      mdlTitleEl.textContent = "Conflicts Found";
      mdlDescEl.textContent =
        "Correct any conflicts on the board before trying again.";
      break;
    }
    case "solve": {
      mdlTitleEl.textContent = "Error Solving";
      mdlDescEl.textContent =
        "The current board has no solution! Try removing some of your inputs.";
      break;
    }
    case "selection": {
      mdlTitleEl.textContent = "Selection Error";
      mdlDescEl.textContent =
        "Select an empty cell on the board before trying again.";
      break;
    }
    case "hint": {
      mdlTitleEl.textContent = "Hint Error";
      mdlDescEl.textContent =
        "The current board has no solution and so cannot solve the selected cell.";
    }
  }

  mdlEl.style.display = "block";
  mdlBackdrop.style.display = "block";
}

// Hide modal
function hideModal() {
  mdlEl.style.display = "none";
  mdlBackdrop.style.display = "none";
}

// Board select handler
function handleBoardSelect(e) {
  customMode = false;
  switch (e.target.value) {
    case "easy": {
      initializeBoard(easy);
      break;
    }
    case "medium": {
      initializeBoard(medium);
      break;
    }
    case "hard": {
      initializeBoard(hard);
      break;
    }
    case "extreme": {
      initializeBoard(extreme);
      break;
    }
    case "custom": {
      customMode = true;
      initializeBoard(empty);
    }
  }
}

// Cell focus handler
function handleCellFocus(e) {
  focusCell(e.target);
}

// Cell blur handler
function handleCellBlur(e) {
  blurCell(e.target);
}

// Cell keypress handler
function handleCellKeypress(e) {
  // Prevent default behaviour except for tab key
  if (e.keyCode !== 9) e.preventDefault();

  currCell = e.target;

  // Handle keypress manually
  switch (e.keyCode) {
    case 13:
    case 27: {
      // ENTER or ESC key pressed
      currCell.blur();
      break;
    }
    case 46:
    case 8: {
      // DELETE or BACKSPACE key pressed
      // Do not allow deletion in fixed value cells
      if (currCell.classList.contains("initial")) break;

      if (draftMode) {
        // Only update if draft to delete
        if (sudokuDOM.getDraft(currCell)) {
          save();
          sudokuDOM.setDraft(currCell, "");
        }
      } else {
        // Only update if value to delete
        if (sudokuDOM.getValue(currCell)) {
          save();
          sudokuDOM.setValue(currCell, "");
        }
      }
      evaluateBoard(sudokuDOM.getBoard());
      break;
    }
    case 37:
    case 38:
    case 39:
    case 40: {
      // LEFT, UP, RIGHT, or DOWN key pressed
      const directions = { 37: "left", 38: "up", 39: "right", 40: "down" };
      const nextCell = sudokuDOM.getAdjacentCell(
        currCell,
        directions[e.keyCode],
      );
      if (!nextCell) break;

      // Refocus on new cell
      currCell.blur();
      nextCell.focus();
      break;
    }
    default: {
      // Some other key pressed
      setCell(parseInt(e.key));
    }
  }
}

// Hint button handler
function handleHint(e) {
  e.preventDefault();

  const selectionError =
    !currCell ||
    currCell.classList.contains("initial") ||
    (customMode && currCell.value);
  if (selectionError) {
    showModal("selection");
    return;
  }

  const solved = solve();
  if (!solved) {
    showModal("hint");
    return;
  }

  // Retrieve answer for current cell
  const row = currCell.dataset.row;
  const col = currCell.dataset.col;
  const hint = solved[row][col];

  // Only update if cell has new value
  if (sudokuDOM.getValue(currCell) !== hint) {
    save();
    sudokuDOM.setValue(currCell, hint);
  }

  // Check if completed board
  evaluateBoard(sudokuDOM.getBoard());
  if (isSolved) complete();
}

// Solve button handler
function handleSolve(e) {
  const solved = solve();
  if (!solved) {
    e.preventDefault();
    showModal("solve");
    return;
  }

  // Check if board already solved in DOM
  if (Sudoku.equal(solved, sudokuDOM.getBoard())) return;

  save();
  complete();
}

// Reset button handler
function handleReset() {
  initializeBoard(currBoard);
}

// Draft checkbox handler
function handleDraftModeChange(e) {
  draftMode = e.target.checked;
}

// Undo button handler
function handleUndo(e) {
  e.preventDefault();
  undo();
}

// Redo button handler
function handleRedo(e) {
  e.preventDefault();
  redo();
}

// Modal close button handler
function handleMdlClose(e) {
  e.preventDefault();
  hideModal();
}

// Events
panelEl.addEventListener("mousedown", (e) => {
  const targetedPanel = e.target.isEqualNode(panelEl);
  const targetedPanelChild = e.target.parentElement.isEqualNode(panelEl);
  // Retain cell focus on clicks in top panel
  if (targetedPanel || targetedPanelChild) e.preventDefault();
});
gridEl.addEventListener("focusin", (e) => {
  if (!e.target.classList.contains("cell")) return;
  handleCellFocus(e);
});
gridEl.addEventListener("focusout", (e) => {
  if (!e.target.classList.contains("cell")) return;
  handleCellBlur(e);
});
gridEl.addEventListener("input", (e) => {
  // Handle cell input on mobile
  if (!e.target.classList.contains("cell")) return;
  e.target.value = currCellValue;
  setCell(parseInt(e.data));
});
gridEl.addEventListener("keydown", (e) => {
  if (!e.target.classList.contains("cell")) return;
  handleCellKeypress(e);
});
boardSel.addEventListener("change", handleBoardSelect);
undoBtn.addEventListener("mousedown", handleUndo);
redoBtn.addEventListener("mousedown", handleRedo);
hintBtn.addEventListener("mousedown", handleHint);
solveBtn.addEventListener("mousedown", handleSolve);
resetBtn.addEventListener("mousedown", handleReset);
draftCb.addEventListener("change", handleDraftModeChange);
mdlBtn.addEventListener("mousedown", handleMdlClose);
mdlBackdrop.addEventListener("mousedown", handleMdlClose);

// Initialization
function initialize() {
  sudokuDOM.createBoard();
  initializeBoard(easy);
  // Wait for board to be created before showing it to prevent flicker
  document.getElementById("sudoku-solver").classList.remove("hidden");
  document.getElementById("sudoku-solver").classList.add("flex");
}
initialize();
