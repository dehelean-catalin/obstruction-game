package com.example.backendobstruction;

import lombok.Getter;

import java.util.ArrayList;
import java.util.List;

public class ObstructionGame {
    private static final char emptySpot = '_';
    private static final String VALID_O_MOVES = "Oo0";
    private static final String VALID_X_MOVES = "Xx";
//    private char computer = 'O';
//    private char human = 'X';

    @Getter
    private byte colsCount = 0;

    @Getter
    private byte rowsCount = 0;

    @Getter
    private boolean isBoardEmpty = false;

    @Getter
    private boolean isComputerMovingFirst = false;

    @Getter
    private List<List<Character>> board;

    @Getter
    private List<String> oPositions;

    public ObstructionGame(String formula){
        if (formula.length() < 3) {
            throw new IllegalArgumentException("Invalid input");
        }

        rowsCount = Byte.parseByte(formula.substring(0,1));
        colsCount = Byte.parseByte(formula.substring(1,2));

        String gameMoves = formula.substring(2);

        checkSize(rowsCount,colsCount, gameMoves.length());

        isValidFormat(gameMoves);

        long[] occurrences = checkNumberOfOccurrences(gameMoves);

        if (occurrences[0] == occurrences[1]) {
            isComputerMovingFirst = true;
        }

        if(occurrences[0] == 0 && occurrences[1] == 0) {
            isBoardEmpty = true;
        }

        BoardConfig boardConfig = createBoard(gameMoves, rowsCount, colsCount);

        board = boardConfig.getBoard();
        oPositions = boardConfig.getOPositions();

    }

    public void makeComputerMove(int i, int j){
        board.get(i).set(j, VALID_O_MOVES.charAt(0));
    }

    public void makeHumanMove(int i, int j){
        board.get(i).set(j, VALID_O_MOVES.charAt(0));
    }

    public void unsetMove(int i, int j){
        board.get(i).set(j, emptySpot);
    }

    public boolean isFinished() {
        for (int i = 0; i < rowsCount; i++)
        {
            for (int j = 0; j < colsCount; j++)
            {
                if (isPositionEmpty(i, j) && isPositionValid(i,j)) {
                    return false;
                }
            }
        }

        return true;
    }

    public boolean isOddSizedBoard() {
        return colsCount % 2 != 0 && rowsCount % 2 != 0;
    }

    public String getCenterPosition(){
            int centerRowIndex = rowsCount / 2;
            int centerColIndex = colsCount / 2;

            return String.format("%d%d", centerRowIndex, centerColIndex);
    }

    public boolean isPositionEmpty(int i, int j) {
        return board.get(i).get(j).equals(emptySpot);
    }

    // Checks if the current spot is not surrounded by X or O
    public boolean isPositionValid(int i, int j) {
        // Left value check
        if (j > 0 && !board.get(i).get(j-1).equals(emptySpot)) return false;

        // Right value check
        if (j < colsCount - 1 && !board.get(i).get(j+1).equals(emptySpot)) return false;

        // Top value check
        if (i > 0 && !board.get(i-1).get(j).equals(emptySpot)) return false;

        // Bottom value check
        if (i < rowsCount - 1 && !board.get(i+1).get(j).equals(emptySpot)) return false;

        // Left-top value check
        if (i > 0 && j > 0 && !board.get(i-1).get(j-1).equals(emptySpot)) return false;

        // Right-top value check
        if (i > 0 && j < colsCount - 1 && !board.get(i-1).get(j+1).equals(emptySpot)) return false;

        // Left-bottom value check
        if (i < rowsCount - 1 && j > 0 && !board.get(i+1).get(j-1).equals(emptySpot)) return false;

        // Right-bottom value check
        if (i < rowsCount - 1 && j < colsCount - 1 && !board.get(i+1).get(j+1).equals(emptySpot)) return false;

        return true;
    }

    public static void isValidFormat(String gameMoves){
        String pattern = "^[XxOo0_]*$";

        if (!gameMoves.matches(pattern)){
            throw new IllegalArgumentException("Invalid moves format");
        }
    }

    public static void checkSize(
            int rowsCount,
            int colsCount,
            int movesLength){

        if(rowsCount * colsCount != movesLength){
            throw new IllegalArgumentException("Invalid board size");
        }

    }

    public static long[] checkNumberOfOccurrences(String gameMoves){
        long xCount =
                gameMoves.chars()
                        .filter(ch -> VALID_X_MOVES.indexOf(ch ) != -1)
                        .count();

        long oCount =
                gameMoves.chars()
                        .filter(ch-> VALID_O_MOVES.indexOf(ch ) != -1)
                        .count();

        if(Math.abs(xCount - oCount) > 1){
            throw new IllegalArgumentException("Invalid moves count");
        }

        long[] values = {xCount, oCount};

        return values;
    }

    public static BoardConfig createBoard(
            String gameMoves,
            int colsCount,
            int rowsCount
    ){

        List<List<Character>> board = new ArrayList<>();
        List<String> oPositions = new ArrayList<>();

        for (int i =0; i< rowsCount;i++){
            List<Character> rowList = new ArrayList<>();

            for (int j=0; j< colsCount;j++){
                int index = i* colsCount + j;
                char move = gameMoves.charAt(index);

                if (move != emptySpot){
                    boolean isValid = isValidAdjacencyPosition(gameMoves, rowsCount,
                            colsCount, i, j);

                    if (!isValid) {
                        throw new IllegalArgumentException("Invalid spot");
                    };
                }

                if(VALID_O_MOVES.contains(Character.toString(move))){
                  oPositions.add(String.format("%d%d", i,j));
                }

                rowList.add(move);

            }

            board.add(rowList);
        }

        return new BoardConfig(board,oPositions);
    }

    public static boolean isValidAdjacencyPosition(
            String gameMoves,
            int rowsCount,
            int colsCount,
            int i,
            int j
    ) {
        int index = i * colsCount + j;

        if (j > 0 && gameMoves.charAt(index - 1) != emptySpot) return false;  // Left check

        if (j < colsCount - 1 && gameMoves.charAt(index + 1) != emptySpot) return false; // dreapta

        if (i > 0 && gameMoves.charAt(index - colsCount) != emptySpot) return false;  //sus

        if (i < rowsCount - 1 && gameMoves.charAt(index + colsCount) != emptySpot) return false; // jos

        if (j > 0 && i > 0 && gameMoves.charAt(index - colsCount - 1) != emptySpot) return false; //sus-stanga

        if (j < colsCount - 1 && i > 0 && gameMoves.charAt(index - colsCount + 1) != emptySpot) return false; //sus-dreapta

        if (j > 0 && i < rowsCount - 1 && gameMoves.charAt(index + colsCount - 1) != emptySpot) return false; //jos-stanga

        if (j < colsCount - 1 && i < rowsCount - 1 && gameMoves.charAt(index + colsCount + 1) != emptySpot) return false; //jos-dreapta

        return true;
    }

    public static int minimax(
            ObstructionGame game,
            int depth,
            boolean isMaximizing,
            int alpha,
            int beta) {

        if (game.isFinished()) {
            return game.BestScore(depth);
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

    public int BestScore(int depth){
        int xCount = 0;
        int oCount = 0;

        for (int i = 0; i < rowsCount; i++) {

            for (int j = 0; j < colsCount; j++) {

                if (VALID_O_MOVES.contains(board.get(i).get(j).toString())){
                    oCount++;
                }

                if (VALID_X_MOVES.contains(board.get(i).get(j).toString())){
                    xCount++;
                }
            }
        }

        int score = (xCount - oCount) * 10;

        boolean isComputerWinning =
                (!isComputerMovingFirst && xCount == oCount) || (isComputerMovingFirst && xCount > oCount);


        if (isComputerWinning){
            score += 100 - depth;

        }else{
            score += -100 + depth;
        }

        return score;
    }

//    public static void checkOddSizedBoard(ObstructionGame game){
//        if (game.checkOddSizedBoard() && game.IsComputerFirstMove())
//        {
//            if (game.IsBoardEmpty()) return Task.FromResult(game.CenterSpot());
//
//            for (int i = 0; i < game.OccupiedSpots.Count; i++)
//            {
//                int rowIndex = int.Parse(game.OccupiedSpots[i][0].ToString());
//                int colIndex = int.Parse(game.OccupiedSpots[i][1].ToString());
//
//                int adjacentRowIndex = game.RowsCount - rowIndex - 1;
//                int adjacentColIndex = game.ColsCount - colIndex - 1;
//
//                if (game.IsSpotEmptyAndValid(adjacentRowIndex, adjacentColIndex))
//                {
//                    game.MakeComputerMove(adjacentRowIndex, adjacentColIndex);
//
//                    string message = $"{adjacentRowIndex}{adjacentColIndex}";
//
//                    if (game.IsFinished()) return Task.FromResult($"{message}:FINAL");
//
//                    return Task.FromResult(message);
//                }
//
//            }
//        }
//
//    }

}
