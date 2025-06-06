class SudokuChecker {
    constructor() {
        this.grid = Array(9).fill().map(() => Array(9).fill(0));
        this.originalGrid = Array(9).fill().map(() => Array(9).fill(0));
        this.solution = Array(9).fill().map(() => Array(9).fill(0));
        this.initializeGrid();
        this.setupEventListeners();
    }

    initializeGrid() {
        const gridContainer = document.getElementById('sudokuGrid');
        gridContainer.innerHTML = '';

        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                
                const input = document.createElement('input');
                input.type = 'text';
                input.maxLength = 1;
                input.dataset.row = i;
                input.dataset.col = j;
                
                input.addEventListener('input', (e) => this.handleInput(e));
                input.addEventListener('keydown', (e) => this.handleKeyDown(e));
                
                cell.appendChild(input);
                gridContainer.appendChild(cell);
            }
        }
    }

    handleInput(event) {
        const input = event.target;
        const value = input.value;
        
        // Only allow numbers 1-9
        if (value && !/^[1-9]$/.test(value)) {
            input.value = '';
            return;
        }

        const row = parseInt(input.dataset.row);
        const col = parseInt(input.dataset.col);
        
        // Update the grid
        this.grid[row][col] = value ? parseInt(value) : 0;
        
        // Remove error styling
        input.parentElement.classList.remove('error');
    }

    handleKeyDown(event) {
        const input = event.target;
        
        // Handle arrow keys
        if (event.key.startsWith('Arrow')) {
            event.preventDefault();
            const row = parseInt(input.dataset.row);
            const col = parseInt(input.dataset.col);
            
            let newRow = row;
            let newCol = col;
            
            switch(event.key) {
                case 'ArrowUp': newRow = Math.max(0, row - 1); break;
                case 'ArrowDown': newRow = Math.min(8, row + 1); break;
                case 'ArrowLeft': newCol = Math.max(0, col - 1); break;
                case 'ArrowRight': newCol = Math.min(8, col + 1); break;
            }
            
            const nextInput = document.querySelector(`input[data-row="${newRow}"][data-col="${newCol}"]`);
            if (nextInput) nextInput.focus();
        }
    }

    setOriginalPuzzle() {
        // Clear previous original values
        this.originalGrid = Array(9).fill().map(() => Array(9).fill(0));
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('original');
            const input = cell.querySelector('input');
            input.readOnly = false;
        });

        // Set current values as original
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const input = document.querySelector(`input[data-row="${i}"][data-col="${j}"]`);
                const value = parseInt(input.value) || 0;
                if (value !== 0) {
                    this.originalGrid[i][j] = value;
                    input.readOnly = true;
                    input.parentElement.classList.add('original');
                }
            }
        }

        // Solve the puzzle
        this.solvePuzzle();
    }

    solvePuzzle() {
        // Copy the original grid to the solution
        this.solution = this.originalGrid.map(row => [...row]);
        
        // Solve the puzzle
        this.solve(this.solution);
    }

    solve(grid) {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (grid[i][j] === 0) {
                    for (let num = 1; num <= 9; num++) {
                        if (this.isValid(grid, i, j, num)) {
                            grid[i][j] = num;
                            if (this.solve(grid)) {
                                return true;
                            }
                            grid[i][j] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    isValid(grid, row, col, num) {
        // Check row
        for (let x = 0; x < 9; x++) {
            if (grid[row][x] === num) {
                return false;
            }
        }

        // Check column
        for (let x = 0; x < 9; x++) {
            if (grid[x][col] === num) {
                return false;
            }
        }

        // Check 3x3 box
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (grid[boxRow + i][boxCol + j] === num) {
                    return false;
                }
            }
        }

        return true;
    }

    checkSolution() {
        let hasErrors = false;
        let isComplete = true;
        const messageDiv = document.getElementById('message');
        
        // Clear previous error styling
        document.querySelectorAll('.cell').forEach(cell => cell.classList.remove('error'));
        
        // Track which cells have errors
        const errorCells = new Set();

        // Compare user's solution with the solved puzzle
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const userValue = this.grid[i][j];
                const correctValue = this.solution[i][j];

                // Skip empty cells
                if (userValue === 0) {
                    isComplete = false;
                    continue;
                }

                // Check if the user's value matches the solution
                if (userValue !== correctValue) {
                    errorCells.add(`${i},${j}`);
                    hasErrors = true;
                }
            }
        }

        // Highlight error cells
        errorCells.forEach(cellKey => {
            const [row, col] = cellKey.split(',').map(Number);
            const cell = document.querySelector(`input[data-row="${row}"][data-col="${col}"]`).parentElement;
            cell.classList.add('error');
        });
        
        if (hasErrors) {
            messageDiv.textContent = 'There are errors in your solution.';
            messageDiv.className = 'message error';
        } else if (isComplete) {
            messageDiv.textContent = 'Congratulations! Your solution is correct.';
            messageDiv.className = 'message success';
        } else {
            messageDiv.textContent = 'No errors found!';
            messageDiv.className = 'message success';
        }
    }

    isValidSet(numbers) {
        const set = new Set();
        for (const num of numbers) {
            if (num === 0) return false; // Empty cell
            if (set.has(num)) return false; // Duplicate number
            set.add(num);
        }
        return set.size === 9;
    }

    clearGrid() {
        // Clear the original grid array
        this.originalGrid = Array(9).fill().map(() => Array(9).fill(0));
        this.solution = Array(9).fill().map(() => Array(9).fill(0));
        
        // Clear all cells and remove styling
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const input = document.querySelector(`input[data-row="${i}"][data-col="${j}"]`);
                input.value = '';
                input.readOnly = false;
                this.grid[i][j] = 0;
                input.parentElement.classList.remove('error', 'original');
            }
        }
        document.getElementById('message').textContent = '';
    }

    setupEventListeners() {
        document.getElementById('checkSolution').addEventListener('click', () => this.checkSolution());
        document.getElementById('clearGrid').addEventListener('click', () => this.clearGrid());
        document.getElementById('setOriginal').addEventListener('click', () => this.setOriginalPuzzle());
    }
}

// Initialize the Sudoku checker
const sudokuChecker = new SudokuChecker(); 