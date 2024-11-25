// Define the size of the grid
const rows = 50;
const cols = 50;

// Define zoom const
const zoomFactor = 0.1;  // Change in zoom level per click
//Grid 100x100
const gridSize = 50;

// Get the grid container and buttons
const gridContainer = document.getElementById('grid-container');
const stepButton = document.getElementById('step-button');
const resetButton = document.getElementById('reset-button');
const randomizeButton = document.getElementById('randomize-button');

// Create an empty grid
let grid = Array.from({ length: rows }, () => Array(cols).fill(false)); 
// Initial zoom level
let zoomLevel = 1; 

// Function to render the grid in the DOM
function renderGrid() {
    gridContainer.innerHTML = "";  // Clear the grid

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            if (grid[i][j]) {
                cell.classList.add("alive");
            }

            // Add a click event listener to toggle the cell state
            cell.addEventListener("click", () => toggleCellState(i, j));

            gridContainer.appendChild(cell);
        }
    }
}

// Function to toggle the state of a cell (alive or dead)
function toggleCellState(row, col) {
    grid[row][col] = !grid[row][col];
    renderGrid();  // Re-render the grid after a change
}

// Function to handle the "Next Generation" button click
stepButton.addEventListener('click', () => {
    // Send the current grid state to the backend and get the next generation
    fetch('http://localhost:7000/step', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ grid: grid })
    })
    .then(response => response.json())
    .then(updatedGrid => {
        grid = updatedGrid;  // Update the grid with the next generation
        renderGrid();  // Re-render the grid
    })
    .catch(error => console.error('Error:', error));
});

// Function to handle the "Reset" button click
resetButton.addEventListener('click', () => {
    grid = Array.from({ length: rows }, () => Array(cols).fill(false));  // Reset grid to all dead cells
    renderGrid();  // Re-render the grid
});

randomizeButton.addEventListener('click', () => {
    fetch('http://localhost:7000/randomize', {
        method: 'POST',
    })
    .then(response => response.json())
    .then(updatedGrid => {
        grid = updatedGrid;  // Update the grid with the next generation
        renderGrid();  // Re-render the grid
    })
    .catch(error => console.error('Error:', error));
});

renderGrid(); // Initial render of the grid