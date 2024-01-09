package com.example.backendobstruction;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/api")
public class GameController {

    @GetMapping
    public String easyMove(@RequestParam String formula){

        ObstructionGame game = new ObstructionGame(formula);

            if (game.isOddSizedBoard() && game.isComputerMovingFirst()) {

                if (game.isBoardEmpty()) {
                    return game.getCenterPosition();
                }

                for (int i = 0; i < (long) game.getOPositions().size(); i++) {

                    int rowIndex = Integer.parseInt(Character.toString(game.getOPositions().get(i).charAt(0)));
                    int colIndex =
                            Integer.parseInt(Character.toString(game.getOPositions().get(i).charAt(1)));

                    int adjacentRowIndex = game.getRowsCount() - rowIndex - 1;
                    int adjacentColIndex = game.getColsCount() - colIndex - 1;

                    if (game.isPositionEmpty(adjacentRowIndex, adjacentColIndex)
                            && game.isPositionValid(adjacentRowIndex,adjacentColIndex)) {
                        game.makeComputerMove(adjacentRowIndex,
                                adjacentColIndex);

                        String message = String.format("%d%d",
                                adjacentRowIndex, adjacentColIndex);

                        if (game.isFinished()) {
                            return String.format("%s:FINAL",message);
                        }

                        return message;
                    }

                }
            }

        GameMove gameMove = new GameMove(game);

        if (gameMove.getScore() == Integer.MIN_VALUE) return "NU_EXISTA";

        game.makeComputerMove(gameMove.getRowIndex(), gameMove.getColIndex());

        String bestMove = String.format("%d%d", gameMove.getRowIndex(),
                gameMove.getColIndex());

        if (game.isFinished()) {
            return String.format("%s:FINAL", bestMove);
        }

        return bestMove;
    }
}
