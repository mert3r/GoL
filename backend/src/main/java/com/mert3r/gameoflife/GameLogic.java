package com.mert3r.gameoflife;

public class GameLogic {
    private final Board board;

    public GameLogic(Board board) {
        this.board = board;
    }

    // Step (Next generation) logic
    public void step() {
        int rows = board.getRows();
        int cols = board.getCols();
        Cell[][] newGrid = new Cell[rows][cols];

        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < cols; j++) {
                boolean isAlive = board.isCellAlive(i, j);
                int liveNeighbors = countLiveNeighbors(i, j);

                if (isAlive) {
                    newGrid[i][j] = new Cell(liveNeighbors == 2 || liveNeighbors == 3); 
                } else {
                    newGrid[i][j] = new Cell(liveNeighbors == 3);
                }
            }
        }

        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < cols; j++) {
                board.setCellState(i, j, newGrid[i][j].isAlive());
            }
        }
    }

    private int countLiveNeighbors(int row, int col) {
        int count = 0;
    
        for (int i = -1; i <= 1; i++) {
            for (int j = -1; j <= 1; j++) {
                // Skip the current cell itself
                if (i == 0 && j == 0) {
                    continue;
                }
    
                int newRow = row + i;
                int newCol = col + j;
    
                // Check if the neighbor is within bounds and alive
                if (board.isValidPosition(newRow, newCol) && board.isCellAlive(newRow, newCol)) {
                    count++;
                }
            }
        }
        return count;
    }

    public Board getBoard() {
        return this.board; // Assuming 'board' is the instance of the game's board
    }

    public void updateBoard(boolean[][] grid) {
        int rows = grid.length;
        int cols = grid[0].length;
    
        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < cols; j++) {
                board.setCellState(i, j, grid[i][j]);
            }
        }
    }    
    
}