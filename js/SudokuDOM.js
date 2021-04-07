import { getMap } from "./utils.js";

// Methods for interacting with Sudoku boards in the DOM
export default class SudokuDOM {
  constructor(containerEl) {
    this.board = containerEl;
  }

  // Render blank board
  createBoard() {
    // Construct 3x3 grid of subgrids
    for (let i = 0; i < 9; i++) {
      const subgridEl = document.createElement("div");
      subgridEl.classList.add("subgrid");

      // Construct 3x3 subgrid
      for (let j = 0; j < 9; j++) {
        const cellContainer = document.createElement("div");
        cellContainer.classList.add("cell-container");
        const cell = document.createElement("input");
        cell.classList.add("cell");
        cell.type = "number";

        // Store row and column numbers as attributes
        const row = Math.floor(j / 3) + Math.floor(i / 3) * 3;
        const col = (j % 3) + (i % 3) * 3;
        cell.dataset.row = row;
        cell.dataset.col = col;

        // Correct cell tabbing order
        cell.tabIndex = row * 9 + col + 1;

        cellContainer.append(cell);
        subgridEl.append(cellContainer);
      }

      this.board.append(subgridEl);
    }
  }

  // Set to blank board
  clearBoard() {
    const cells = this.board.querySelectorAll(".cell");
    for (const cell of cells) {
      cell.value = "";
      cell.className = "cell";
      cell.parentElement.removeAttribute("data-draft");
    }
  }

  // Remove board drafts
  removeDrafts() {
    const cells = this.board.querySelectorAll(".cell");
    for (const cell of cells) {
      cell.parentElement.removeAttribute("data-draft");
    }
  }

  // Add class to board according to mapping array
  paintBoard(map, className) {
    const cells = this.board.querySelectorAll(".cell");
    for (const cell of cells) {
      const row = cell.dataset.row;
      const col = cell.dataset.col;
      if (map[row][col]) cell.classList.add(className);
    }
  }

  // Remove board classes
  stripBoard(classNames) {
    // By default remove all but initial and highlight-conflict classes
    if (!classNames)
      classNames = [
        "highlight-selected",
        "highlight-row",
        "highlight-col",
        "highlight-subgrid",
        "highlight-repeat",
      ];

    const cells = this.board.querySelectorAll(".cell");
    for (const cell of cells) {
      for (const className of classNames) {
        cell.classList.remove(className);
      }
    }
  }

  // Add classes to board relating to cell relations (same row, column, or subgrid)
  highlightRelations(cellEl) {
    const row = parseInt(cellEl.dataset.row);
    const col = parseInt(cellEl.dataset.col);
    const x0 = Math.floor(row / 3) * 3;
    const y0 = Math.floor(col / 3) * 3;

    const rowMap = getMap((i, j) => i === row);
    const colMap = getMap((i, j) => j === col);
    const subgridMap = getMap(
      (i, j) => i >= x0 && j >= y0 && i < x0 + 3 && j < y0 + 3
    );

    cellEl.classList.add("highlight-selected");
    this.paintBoard(rowMap, "highlight-row");
    this.paintBoard(colMap, "highlight-col");
    this.paintBoard(subgridMap, "highlight-subgrid");
  }

  // Add classes to board relating to cell repetitions
  highlightRepeats(cellEl) {
    const board = this.getBoard();
    const val = parseInt(cellEl.value);

    const repeatMap = getMap((i, j) => board[i][j] === val);

    this.paintBoard(repeatMap, "highlight-repeat");
  }

  // Add classes to board relating to cell conflicts (same value and related)
  highlightConflicts() {
    const board = this.getBoard();
    const cells = this.board.querySelectorAll(".cell");
    for (const cell of cells) {
      if (!cell.value) continue;

      const row = parseInt(cell.dataset.row);
      const col = parseInt(cell.dataset.col);
      const val = parseInt(cell.value);
      const x0 = Math.floor(row / 3) * 3;
      const y0 = Math.floor(col / 3) * 3;

      const conflictsMap = getMap((i, j) => {
        if (i === row && j === col) return false;

        const sameValue = board[i][j] === val;
        const sameArea = i === row || j === col;
        const sameSubgrid = i >= x0 && j >= y0 && i < x0 + 3 && j < y0 + 3;

        return sameValue && (sameArea || sameSubgrid);
      });

      this.paintBoard(conflictsMap, "highlight-conflict");
    }
  }

  // Focus cell and update highlighting
  focusCell(cellEl) {
    cellEl.focus();

    // Remove input text highlighting (hack)
    cellEl.type = "text";
    cellEl.selectionStart = cellEl.selectionEnd;
    cellEl.type = "number";

    this.highlightRelations(cellEl);
    this.highlightRepeats(cellEl);
  }

  // Blur cell and remove highlighting
  blurCell(cellEl) {
    cellEl.blur();
    this.stripBoard();
  }

  // Determine if board has draft values
  hasDrafts() {
    const drafts = this.getDrafts().flat();
    for (const draft of drafts) {
      if (draft) return true;
    }
    return false;
  }

  // Determine if board has conflicts
  hasConflicts() {
    return this.board.querySelectorAll(".highlight-conflict").length !== 0;
  }

  // Get board values
  getBoard() {
    const board = [];
    const cells = this.board.querySelectorAll(".cell");
    for (const cell of cells) {
      const row = cell.dataset.row;
      const col = cell.dataset.col;
      if (!board[row]) board[row] = [];
      // Set entry to 0 if cell is empty
      board[row][col] = parseInt(cell.value) || 0;
    }
    return board;
  }

  // Get board drafts
  getDrafts() {
    const drafts = [];
    const cells = this.board.querySelectorAll(".cell");
    for (const cell of cells) {
      const row = cell.dataset.row;
      const col = cell.dataset.col;
      if (!drafts[row]) drafts[row] = [];
      // Set entry to 0 if cell is empty
      drafts[row][col] = parseInt(cell.parentElement.dataset.draft) || 0;
    }
    return drafts;
  }

  // Get adjacent cell corresponding to some direction
  getAdjacentCell(cellEl, direction) {
    let row = parseInt(cellEl.dataset.row);
    let col = parseInt(cellEl.dataset.col);

    switch (direction) {
      case "left": {
        col--;
        break;
      }
      case "up": {
        row--;
        break;
      }
      case "right": {
        col++;
        break;
      }
      case "down": {
        row++;
      }
    }

    return this.board.querySelector(
      `.cell[data-row="${row}"][data-col="${col}"]`
    );
  }

  // Get cell value
  getValue(cellEl) {
    return parseInt(cellEl.value);
  }

  // Get cell draft
  getDraft(cellEl) {
    return parseInt(cellEl.parentElement.dataset.draft);
  }

  // Set board values from data
  setBoard(board) {
    const cells = this.board.querySelectorAll(".cell");
    for (const cell of cells) {
      const row = cell.dataset.row;
      const col = cell.dataset.col;
      const val = board[row][col];
      cell.value = val || "";
    }
  }

  // Set board drafts from data
  setDrafts(drafts) {
    const cells = this.board.querySelectorAll(".cell");
    for (const cell of cells) {
      const row = cell.dataset.row;
      const col = cell.dataset.col;
      const val = drafts[row][col];
      cell.parentElement.removeAttribute("data-draft");
      if (val) cell.parentElement.dataset.draft = val;
    }
  }

  // Set cell value and
  setValue(cellEl, val) {
    cellEl.value = val || "";

    this.stripBoard(["highlight-repeat", "highlight-conflict"]);
    this.highlightRepeats(cellEl);
    this.highlightConflicts();
  }

  // Set cell draft
  setDraft(cellEl, val) {
    cellEl.parentElement.removeAttribute("data-draft");
    if (val) cellEl.parentElement.dataset.draft = val;
  }
}
