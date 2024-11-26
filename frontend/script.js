// Grid
const gridSize = 50;
const rows = gridSize;
const cols = gridSize;

// Page elements
const gridContainer = document.getElementById('grid-container');
const stepButton = document.getElementById('step-button');
const resetButton = document.getElementById('reset-button');
const randomizeButton = document.getElementById('randomize-button');
const playPauseButton = document.getElementById("play-pause-button");

// Initialize an empty grid
let grid = Array.from({ length: rows }, () => Array(cols).fill(false)); 

// Interval ID
let playInterval = null;

// Generation initialization
let generation = 0;

// Function to render the grid in the DOM
function renderGrid() {
    requestAnimationFrame(() => {
        gridContainer.innerHTML = ""; // Clear previous grid

        for (let i = 0; i < grid.length; i++) {
            for (let j = 0; j < grid[i].length; j++) {
                const cell = document.createElement("div");
                cell.classList.add("cell");
                if (grid[i][j]) {
                    cell.classList.add("alive");
                }
                gridContainer.appendChild(cell);
            }
        }
    });
}

// Function to toggle the state of a cell
function toggleCellState(row, col) {
    grid[row][col] = !grid[row][col];
    renderGrid();  // Re-render the grid after a change
}

// Function to fetch the next generation from the backend
async function fetchNextGeneration() {
    try {
        const response = await fetch("http://localhost:7000/step", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ grid }), // Send current grid state to backend
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch next generation: ${response.statusText}`);
        }

        // Parse the response and update the grid
        const updatedGrid = await response.json();
        grid = updatedGrid; // Update the grid
        renderGrid(); // Re-render the grid
    } catch (error) {
        console.error("Error fetching next generation:", error);
    }
    generation++; // Increment the generation
    updateGenerationCounter(); // Update the UI
}

// Event listener for "Next generation" button
stepButton.addEventListener("click", fetchNextGeneration);

// Function to handle the "Reset" button click
resetButton.addEventListener('click', () => {
    fetch('http://localhost:7000/reset', {
        method: 'POST',
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to reset: ${response.statusText}`);
        }
        return response.json();
    })
    .then(resetGrid => {
        grid = resetGrid; // Update the grid with the reset grid from the backend
        renderGrid();     // Re-render the grid
    })
    .catch(error => console.error('Error resetting grid:', error));
    resetGenerationCounter();
});

// Function that randomizes the cell states in the grid
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
    resetGenerationCounter();
});

// Play/Pause logic
function togglePlayPause() {
    if (playInterval === null) {
        startInterval();
    } else {
        stopInterval();
    }
}

function startInterval(){
    // Start the interval
    playInterval = setInterval(() => {
        fetchNextGeneration();
    }, 250); // Adjust interval time as needed (250ms)
    playPauseButton.textContent = "Pause"; // Update button text
}

function stopInterval(){
    // Stop the interval
    clearInterval(playInterval);
    playInterval = null;
    playPauseButton.textContent = "Play"; // Update button text
}

// Event listener for Play/Pause button
playPauseButton.addEventListener("click", togglePlayPause);

// Update the generation counter in the DOM
function updateGenerationCounter() {
    const generationCountElement = document.getElementById("generation-count");
    generationCountElement.textContent = generation; // Set the generation number
}

//Reset Generation counter in the DOM
function resetGenerationCounter(){
    stopInterval();
    generation = 0; // Reset to 0
    updateGenerationCounter(); // Update the UI
}

// Initial render of the grid
renderGrid();