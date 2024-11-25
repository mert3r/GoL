package com.mert3r.gameoflife;

import io.javalin.Javalin;
import java.util.List;
import java.util.Map;

public class App {
    public static void main(String[] args) {
        int rows = 50; // Board size (same as frontend)
        int cols = 50;
        Board board = new Board(rows, cols);
        GameLogic gameLogic = new GameLogic(board);

        Javalin app = Javalin.create(config -> {
            // Enable CORS for all origins
            config.plugins.enableCors(cors -> {
                cors.add(it -> {
                    it.anyHost(); // Allow all origins
                });
            });
        }).start(7000);

        // Endpoint to fetch the current board state
        app.get("/board", ctx -> ctx.json(board.getGrid()));

        // Endpoint to toggle a cell's state
        app.post("/toggle", ctx -> {
            CellToggleRequest request = ctx.bodyAsClass(CellToggleRequest.class);
            board.setCellState(request.row, request.col, request.alive);
            ctx.status(200); 
        });

        app.post("/step", ctx -> {
            // Parse the grid as Map<String, Object>
            Map<String, Object> body = ctx.bodyAsClass(Map.class);

            // Get the grid from the map
            Object gridObject = body.get("grid");

            // Cast the grid to List<List<Boolean>>
            if (gridObject instanceof List) {
                List<List<Boolean>> inputList = (List<List<Boolean>>) gridObject;

                // Convert List<List<Boolean>> into boolean[][]
                boolean[][] inputGrid = new boolean[inputList.size()][];
                for (int i = 0; i < inputList.size(); i++) {
                    List<Boolean> rowList = inputList.get(i);
                    inputGrid[i] = new boolean[rowList.size()];
                    for (int j = 0; j < rowList.size(); j++) {
                        inputGrid[i][j] = rowList.get(j);
                    }
                }

                // Now you have the inputGrid as boolean[][]
                // Update the backend's board state with the input grid
                gameLogic.updateBoard(inputGrid);

                // Advance the game state
                gameLogic.step();

                // Convert the updated grid to a boolean grid for response
                boolean[][] updatedGrid = convertToBooleanGrid(gameLogic.getBoard().getGrid());

                // Respond with the updated grid
                ctx.json(updatedGrid);
                ctx.status(200);
            } else {
                // If the grid isn't a valid List, send an error response
                ctx.status(400).result("Invalid grid format.");
            }
        });

        // Endpoint to reset the board
        app.post("/reset", ctx -> {
            board.reset();
            ctx.status(200);
        });

        // Randomize the board
        app.post("/randomize", ctx -> {
            board.randomizeCells();
            boolean[][] randomizedGrid = convertToBooleanGrid(gameLogic.getBoard().getGrid());
            ctx.json(randomizedGrid);
            ctx.status(200);
        });
    }

    // Helper class for cell toggle requests
    public static class CellToggleRequest {
        public int row;
        public int col;
        public boolean alive;
    }

    private static boolean[][] convertToBooleanGrid(Cell[][] grid) {
        int rows = grid.length;
        int cols = grid[0].length;
        boolean[][] booleanGrid = new boolean[rows][cols];
    
        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < cols; j++) {
                booleanGrid[i][j] = grid[i][j].isAlive(); // Convert each cell to its alive state
            }
        }
    
        return booleanGrid;
    }

}