import { deepCopyArr, isUniqueArr } from "./utils.js";

// Methods for operations on Sudoku boards
export default class Sudoku {
  // Get row x of board
  static getRow(board, x) {
    const row = [...board[x]];
    return row;
  }

  // Get column y of board
  static getCol(board, y) {
    const col = [];
    for (let i = 0; i < 9; i++) {
      col.push(board[i][y]);
    }
    return col;
  }

  // Get 3x3 subgrid starting at (x,y) of board
  static getSubgrid(board, x, y) {
    const subgrid = [];
    for (let i = x; i < x + 3; i++) {
      for (let j = y; j < y + 3; j++) {
        subgrid.push(board[i][j]);
      }
    }
    return subgrid;
  }

  // Get coordinates of empty slot on board
  static getEmpty(board) {
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (!board[i][j]) return [i, j];
      }
    }
  }

  // Determine if value in slot (x,y) is valid
  static isValidEntry(board, x, y, val) {
    // Check row uniqueness
    const row = this.getRow(board, x);
    if (row.includes(val)) return false;

    // Check column uniqueness
    const col = this.getCol(board, y);
    if (col.includes(val)) return false;

    // Check subgrid uniqueness
    const x0 = Math.floor(x / 3) * 3;
    const y0 = Math.floor(y / 3) * 3;
    const subgrid = this.getSubgrid(board, x0, y0);
    if (subgrid.includes(val)) return false;

    return true;
  }

  // Determine if board is valid
  // 1. Any row has at most one occurence of any value
  // 2. Any column has at most one occurence of any value
  // 3. Any subgrid has at most one occurence of any value
  static isValidBoard(board) {
    for (let i = 0; i < 9; i++) {
      // Check row uniqueness
      const row = this.getRow(board, i);
      if (!isUniqueArr(row)) return false;

      // Check column uniqueness
      const col = this.getCol(board, i);
      if (!isUniqueArr(col)) return false;
    }

    // Check subgrid uniqueness
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        let x0 = i * 3;
        let y0 = j * 3;
        const subgrid = this.getSubgrid(board, x0, y0);
        if (!isUniqueArr(subgrid)) return false;
      }
    }

    return true;
  }

  // Check if board is complete and correct
  static isComplete(board) {
    // Check if filled
    const vals = board.flat();
    for (const val of vals) {
      if (!val) return false;
    }

    // Check if valid
    const valid = Sudoku.isValidBoard(board);
    if (!valid) return false;

    return true;
  }

  // Check for equality of two boards
  static equal(board1, board2) {
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (board1[i][j] != board2[i][j]) return false;
      }
    }
    return true;
  }

  // Solve board (public)
  static solve(board) {
    // Check first for valid board
    if (!this.isValidBoard(board)) return false;
    // Deep copy board for immutability
    return this._solve(deepCopyArr(board));
  }

  // Solve board (private)
  static _solve(board) {
    let empty = this.getEmpty(board);
    if (!empty) return board;

    const [row, col] = empty;
    for (let i = 1; i <= 9; i++) {
      if (this.isValidEntry(board, row, col, i)) {
        // Try potential value i
        board[row][col] = i;

        // Recursively solve
        if (this._solve(board)) return board;

        // Backtrack, value was wrong
        board[row][col] = 0;
      }
    }

    // Exhausted branch
    return;
  }

  // Print board to console
  static print(board) {
    let str = "";
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        str += board[i][j] + ", ";
      }
      str = str.slice(0, -2) + "\n";
    }
    console.log(str);
  }
}
