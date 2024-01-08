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
                    int score = ObstructionGame.minimax(game, 0, false,
                            Integer.MIN_VALUE,
                            Integer.MAX_VALUE);
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
}
