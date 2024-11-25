package com.mert3r.gameoflife;

import io.javalin.Javalin;
import java.util.List;
import java.util.Map;

public class App {
    public static void main(String[] args) {
        // Board and GameLogic setup
        int rows = 50; 
        int cols = 50;
        Board board = new Board(rows, cols);
        GameLogic gameLogic = new GameLogic(board);

        // Javalin setup with CORS enabled
        Javalin app = Javalin.create(config -> {
            config.plugins.enableCors(cors -> cors.add(it -> it.anyHost()));
        }).start(7000);

        // Endpoints
        app.get("/", ctx -> ctx.result("Game of Life"));

        app.get("/board", ctx -> ctx.json(board.getGrid())); // Get the board state

        app.post("/step", ctx -> { // Advance the game by one generation
            processStepRequest(ctx, gameLogic);
        });

        app.post("/reset", ctx -> { // Reset the board
            board.reset();
            ctx.json(convertToBooleanGrid(board.getGrid()));
        });

        app.post("/randomize", ctx -> { // Randomize the board
            board.randomizeCells();
            ctx.json(convertToBooleanGrid(board.getGrid()));
        });

        app.post("/toggle", ctx -> { // Toggle a single cell state
            CellToggleRequest request = ctx.bodyAsClass(CellToggleRequest.class);
            board.setCellState(request.row, request.col, request.alive);
            ctx.status(200);
        });
    }

    private static void processStepRequest(io.javalin.http.Context ctx, GameLogic gameLogic) {
        Map<String, Object> body = ctx.bodyAsClass(Map.class);
        Object gridObject = body.get("grid");

        if (gridObject instanceof List) {
            List<List<Boolean>> inputList = (List<List<Boolean>>) gridObject;
            boolean[][] inputGrid = convertListToGrid(inputList);
            gameLogic.updateBoard(inputGrid);
            gameLogic.step();
            ctx.json(convertToBooleanGrid(gameLogic.getBoard().getGrid()));
        } else {
            ctx.status(400).result("Invalid grid format.");
        }
    }

    private static boolean[][] convertListToGrid(List<List<Boolean>> inputList) {
        boolean[][] grid = new boolean[inputList.size()][];
        for (int i = 0; i < inputList.size(); i++) {
            List<Boolean> row = inputList.get(i);
            grid[i] = new boolean[row.size()];
            for (int j = 0; j < row.size(); j++) {
                grid[i][j] = row.get(j);
            }
        }
        return grid;
    }

    private static boolean[][] convertToBooleanGrid(Cell[][] grid) {
        int rows = grid.length;
        int cols = grid[0].length;
        boolean[][] booleanGrid = new boolean[rows][cols];
        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < cols; j++) {
                booleanGrid[i][j] = grid[i][j].isAlive();
            }
        }
        return booleanGrid;
    }

    public static class CellToggleRequest {
        public int row;
        public int col;
        public boolean alive;
    }
}