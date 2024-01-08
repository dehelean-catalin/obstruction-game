package com.example.backendobstruction;


import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;
@AllArgsConstructor
public class BoardConfig {
    @Getter
    private List<List<Character>> board;
    @Getter
    private List<String> oPositions;
}
