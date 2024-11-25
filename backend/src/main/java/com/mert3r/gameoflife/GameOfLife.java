package com.mert3r.gameoflife;

import io.javalin.Javalin;

public class GameOfLife {
    public static void main(String[] args) {
        Javalin app = Javalin.create().start(7000);

        // Setup 
        Board board = new Board(50, 50); // board 50x50
        GameLogic gameLogic = new GameLogic(board);

        // Define routes
        app.get("/", ctx -> ctx.result("Game of Life"));

        app.get("/board", ctx -> ctx.json(board.getGrid()));

        app.post("/step", ctx -> {
            gameLogic.step();
            ctx.json(board.getGrid());
        });

        app.post("/reset", ctx -> {
            board.reset();
            ctx.json(board.getGrid());
        });
    }
}
