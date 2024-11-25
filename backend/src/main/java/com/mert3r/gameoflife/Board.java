package com.mert3r.gameoflife;

public class Board {
    private final int rows;
    private final int cols;
    private Cell[][] grid;

    public Board(int rows, int cols) {
        this.rows = rows;
        this.cols = cols;
        this.grid = new Cell[rows][cols];
    }

    // Reset the board
    public void reset() {
        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < cols; j++) {
                grid[i][j] = new Cell(false); // Initially all cells are dead
            }
        }
    }

    public void randomizeCells(){
        double chance = 0.5;
        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < cols; j++) {
                boolean isAlive = Math.random() > chance;
                grid[i][j] = new Cell(isAlive); // 50/50 chance dead or alive cell
            }
        }
    }

    // Getters

    public Cell[][] getGrid() {
        return grid;
    }

    public int getRows() {
        return rows;
    }

    public int getCols() {
        return cols;
    }

    // Validations

    public boolean isValidPosition(int row, int col) {
        return row >= 0 && row < rows && col >= 0 && col < cols;
    }

    public boolean isCellAlive(int row, int col) {
        return isValidPosition(row, col) && grid[row][col].isAlive();
    }

    // Setters
    
    public void setCellState(int row, int col, boolean alive) {
        if (isValidPosition(row, col)) {
            grid[row][col].setAlive(alive);
        }
    }
    
}