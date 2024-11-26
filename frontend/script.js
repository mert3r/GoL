// Grid
const gridSize = 50;
const rows = gridSize;
const cols = gridSize;

// Speed
const maxSpeed = 50; // 50ms/generation
const minSpeed = 1000; // 1000ms/generation

// Page elements
const gridContainer = document.getElementById('grid-container');
const stepButton = document.getElementById('step-button');
const resetButton = document.getElementById('reset-button');
const randomizeButton = document.getElementById('randomize-button');
const playPauseButton = document.getElementById("play-pause-button");
const speedControl = document.getElementById('speedControl');
const speedValue = document.getElementById('speedValue');

// Variables
let grid = Array.from({ length: rows }, () => Array(cols).fill(false)); // Initialize an empty grid

let playIntervalId = null; // Interval ID
let playInterval = 250; // Default interval (250ms)
let isPlaying = false; // Track whether the game is currently playing

let generation = 0; // Generation initialization

// Function to render the grid in the DOM
function renderGrid() {
    const gridContainer = document.getElementById('grid-container');
    gridContainer.innerHTML = ''; // Clear the existing grid

    for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[row].length; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = row; // Store row index
            cell.dataset.col = col; // Store column index
            cell.style.backgroundColor = grid[row][col] ? 'black' : 'white';

            // Event listener
            cell.addEventListener('click', () => {
                toggleCellState(row, col);
            });

            gridContainer.appendChild(cell);
        }
    }
}

// Function to toggle the cell state
async function toggleCellState(row, col) {
    try {
        // Prepare the request payload
        const payload = {
            row: row,
            col: col,
            alive: !grid[row][col] // Flip the current cell's state
        };

        // Send POST request to the backend
        const response = await fetch('http://localhost:7000/toggle', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`Failed to toggle cell state: ${response.statusText}`);
        }

        // Update the grid visually
        grid[row][col] = payload.alive;
        renderGrid(); // Re-render the grid with the updated state
    } catch (error) {
        console.error('Error toggling cell state:', error);
    }
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
    if (isPlaying) {
        stopInterval(); // Pause the game
    } else {
        startInterval(); // Start the game
    }
}

// Function to start the interval and advance generations (start the game)
function startInterval(){
    playIntervalId = setInterval(() => {
        fetchNextGeneration();
    }, playInterval); // Sets interval time
    playPauseButton.textContent = "Pause"; // Update button text
    isPlaying = true;
}

// Function to stop the interval (pause the game)
function stopInterval(){
    clearInterval(playIntervalId); // Stop the current interval
    playPauseButton.textContent = "Play"; // Update button text
    isPlaying = false;
}

// Event listener for Play/Pause button
playPauseButton.addEventListener("click", togglePlayPause);

// Update the generation counter in the DOM
function updateGenerationCounter() {
    const generationCountElement = document.getElementById("generation-count");
    generationCountElement.textContent = generation;
}

//Reset Generation counter in the DOM
function resetGenerationCounter(){
    stopInterval();
    generation = 0;
    updateGenerationCounter(); // Update the UI
}

// Function to update the speed when the slider value changes
function updateSpeed() {
    // Reverse the slider value
    const reversedInterval = (minSpeed - parseInt(speedControl.value, 10)) + maxSpeed;

    // Update the playInterval with the reversed value
    playInterval = reversedInterval;

    // Display the reversed interval as the current speed in the UI
    speedValue.textContent = `${reversedInterval} ms/generation`;

    // If the game is running, restart the interval with the updated speed
    if (isPlaying) {
        stopInterval();
        startInterval();
    }
}

// Event listener for speed control
speedControl.addEventListener("input", updateSpeed);

// Initial render of the grid
renderGrid();