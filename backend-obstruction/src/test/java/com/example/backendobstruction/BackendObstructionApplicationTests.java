package com.example.backendobstruction;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.junit.jupiter.api.Assertions.*;

class ObstructionGameTests {

	@Test
	void invalidBoardSize(){
        Exception exception = assertThrows(IllegalArgumentException.class,
                ()-> ObstructionGame.checkSize(3,3, 8)
        );

        assertEquals("Invalid board size", exception.getMessage());
	}

    @Test
    void invalidGameMoves(){
        Exception exception = assertThrows(IllegalArgumentException.class,
                ()-> ObstructionGame.isValidFormat("__1___")
        );

        assertEquals("Invalid moves format", exception.getMessage());
    }

    @ParameterizedTest
    @ValueSource(strings = { "Xx__", "0Xxx", "___Oo", "___0oO" })
    void invalidOccurrences(String candidate){
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> ObstructionGame.checkNumberOfOccurrences(candidate));

        assertEquals("Invalid moves count", exception.getMessage());
    }

    @ParameterizedTest
    @ValueSource(strings = {"____X___O",})
    void invalidAdjacencyPosition(String candidate){

        assertFalse(ObstructionGame.isValidAdjacencyPosition(candidate, 3,3,
                1,1));
    }

   @Test
    void invalidBoardConfig(){
        ObstructionGame obstructionGame = new ObstructionGame("33____X____");
        assertEquals(obstructionGame.getRowsCount(),3);
    }

}
