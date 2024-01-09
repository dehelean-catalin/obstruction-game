package com.example.backendobstruction;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
public class GameMove {
    @Getter
    private int score = Integer.MIN_VALUE;
    @Getter
    private int rowIndex = 0;
    @Getter
    private int colIndex = 0;

    public GameMove (ObstructionGame game){

        for (int i = 0; i < game.getRowsCount(); i++) {

            for (int j = 0; j < game.getColsCount(); j++) {

                if (game.isPositionValid(i, j) && game.isPositionEmpty(i,j)){

                    game.makeComputerMove(i, j);

                    int score = minimax(
                            game,
                            0,
                            false,
                            Integer.MIN_VALUE,
                            Integer.MAX_VALUE
                    );

                    game.unsetMove(i, j);

                    if (score > this.score) {
                        this.score = score;
                        rowIndex = i;
                        colIndex = j;
                    }
                }
            }
        }
    }
    private static int minimax(
            ObstructionGame game,
            int depth,
            boolean isMaximizing,
            int alpha,
            int beta) {

        if (game.isFinished()) {
            return game.findBestScore(depth);
        }

        if (isMaximizing){
            int bestScore = Integer.MIN_VALUE;

            for (int i = 0; i < game.getRowsCount(); i++) {
                for (int j = 0; j < game.getColsCount(); j++)
                {
                    if (game.isPositionEmpty(i,j) && game.isPositionValid(i, j))
                    {
                        game.makeComputerMove(i, j);
                        int score = minimax(game, depth + 1, false, alpha,
                                beta);
                        game.unsetMove(i, j);

                        bestScore = Math.max(bestScore, score);
                        alpha = Math.max(alpha, score);

                        if (beta <= alpha) {
                            break;
                        }

                    }
                }

                if (beta <= alpha) {
                    break;
                }
            }

            return bestScore;
        }
        else {
            int bestScore = Integer.MAX_VALUE;

            for (int i = 0; i < game.getRowsCount(); i++) {

                for (int j = 0; j < game.getColsCount(); j++) {

                    if (game.isPositionValid(i,j) && game.isPositionEmpty(i, j)) {
                        game.makeHumanMove(i, j);
                        int score = minimax(game, depth + 1, true, alpha, beta);
                        game.unsetMove(i, j);

                        bestScore = Math.min(bestScore, score);
                        beta = Math.min(beta, score);

                        if (beta <= alpha) {
                            break;
                        }
                    }
                }

                if (beta <= alpha) {
                    break;
                }
            }

            return bestScore;
        }
    }
}
