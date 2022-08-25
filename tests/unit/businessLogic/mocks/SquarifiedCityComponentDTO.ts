/* eslint-disable */
export const CityComponentDTOMock = {
  "quarter": {
    "position": {
      "x": 0,
      "y": 0
    },
    "dimension": {
      "width": 1,
      "height": 1
    },
    "depth": 0,
    "hidden": false,
    "name": "city",
    "content": [
      {
        "quarter": {
          "position": {
            "x": 0,
            "y": 0
          },
          "dimension": {
            "width": 0.7786606129398411,
            "height": 1
          },
          "depth": 0,
          "hidden": false,
          "name": "ai",
          "content": [
            {
              "building": {
                "name": "IterativeDeepening",
                "hidden": false,
                "depth": 0.7,
                "dimension": {
                  "width": 0.19518672835593864,
                  "height": 0.19518672835593864
                },
                "position": {
                  "x": 0.10478130007619732,
                  "y": 0.04963695652173913
                },
                "type": "JavaClass",
                "metrics": {
                  "sourceCode": "public class IterativeDeepening extends Observable implements MoveStrategy {\n\n    private final BoardEvaluator evaluator;\n    private final int searchDepth;\n    private final MoveSorter moveSorter;\n    private long boardsEvaluated;\n    private long executionTime;\n    private int cutOffsProduced;\n\n    private enum MoveSorter {\n\n        SORT {\n            @Override\n            Collection<Move> sort(final Collection<Move> moves) {\n                return from(SMART_SORT).immutableSortedCopy(moves);\n            }\n        };\n\n        public static Comparator<Move> SMART_SORT = new Comparator<Move>() {\n            @Override\n            public int compare(final Move move1, final Move move2) {\n                return ComparisonChain.start()\n                        .compareTrueFirst(BoardUtils.isThreatenedBoardImmediate(move1.getBoard()), BoardUtils.isThreatenedBoardImmediate(move2.getBoard()))\n                        .compareTrueFirst(move1.isAttack(), move2.isAttack())\n                        .compareTrueFirst(move1.isCastlingMove(), move2.isCastlingMove())\n                        .compare(move2.getMovedPiece().getPieceValue(), move1.getMovedPiece().getPieceValue())\n                        .result();\n            }\n        };\n\n        abstract Collection<Move> sort(Collection<Move> moves);\n    }\n\n    public IterativeDeepening(final int searchDepth) {\n        this.evaluator = StandardBoardEvaluator.get();\n        this.searchDepth = searchDepth;\n        this.moveSorter = MoveSorter.SORT;\n        this.boardsEvaluated = 0;\n        this.cutOffsProduced = 0;\n    }\n\n    @Override\n    public String toString() {\n        return \"ID\";\n    }\n\n    @Override\n    public long getNumBoardsEvaluated() {\n        return this.boardsEvaluated;\n    }\n\n    @Override\n    public Move execute(final Board board) {\n\n        final long startTime = System.currentTimeMillis();\n        System.out.println(board.currentPlayer() + \" THINKING with depth = \" + this.searchDepth);\n\n        MoveOrderingBuilder builder = new MoveOrderingBuilder();\n        builder.setOrder(board.currentPlayer().getAlliance().isWhite() ? Ordering.DESC : Ordering.ASC);\n        for(final Move move : board.currentPlayer().getLegalMoves()) {\n            builder.addMoveOrderingRecord(move, 0);\n        }\n\n        Move bestMove = MoveFactory.getNullMove();\n        int currentDepth = 1;\n\n        int highestSeenValue = Integer.MIN_VALUE;\n        int lowestSeenValue = Integer.MAX_VALUE;\n\n        while (currentDepth <= this.searchDepth) {\n            final long subTimeStart = System.currentTimeMillis();\n            //int highestSeenValue = Integer.MIN_VALUE;\n            //int lowestSeenValue = Integer.MAX_VALUE;\n            int currentValue;\n            final List<MoveScoreRecord> records = builder.build();\n            builder = new MoveOrderingBuilder();\n            builder.setOrder(board.currentPlayer().getAlliance().isWhite() ? Ordering.DESC : Ordering.ASC);\n            for (final MoveScoreRecord record : records) {\n                final Move move = record.getMove();\n                final MoveTransition moveTransition = board.currentPlayer().makeMove(move);\n                if (moveTransition.getMoveStatus().isDone()) {\n                    currentValue = board.currentPlayer().getAlliance().isWhite() ?\n                            min(moveTransition.getToBoard(), currentDepth - 1, highestSeenValue, lowestSeenValue) :\n                            max(moveTransition.getToBoard(), currentDepth - 1, highestSeenValue, lowestSeenValue);\n                    builder.addMoveOrderingRecord(move, currentValue);\n                    if (board.currentPlayer().getAlliance().isWhite() && currentValue > highestSeenValue) {\n                        highestSeenValue = currentValue;\n                        bestMove = move;\n                    } else if (board.currentPlayer().getAlliance().isBlack() && currentValue < lowestSeenValue) {\n                        lowestSeenValue = currentValue;\n                        bestMove = move;\n                    }\n                }\n            }\n            final long subTime = System.currentTimeMillis()- subTimeStart;\n            System.out.println(\"\\t\" +toString()+ \" bestMove = \" +bestMove+ \" Depth = \" +currentDepth+ \" took \" +(subTime) + \" ms, ordered moves : \" +records);\n            setChanged();\n            notifyObservers(bestMove);\n            currentDepth++;\n        }\n        this.executionTime = System.currentTimeMillis() - startTime;\n        System.out.printf(\"%s SELECTS %s [#boards evaluated = %d, time taken = %d ms, eval rate = %.1f cutoffCount = %d prune percent = %.2f\\n\", board.currentPlayer(),\n                bestMove, this.boardsEvaluated, this.executionTime, (1000 * ((double)this.boardsEvaluated/this.executionTime)), this.cutOffsProduced, 100 * ((double)this.cutOffsProduced/this.boardsEvaluated));\n        return bestMove;\n    }\n\n    public int max(final Board board,\n                   final int depth,\n                   final int highest,\n                   final int lowest) {\n        if (depth == 0 || BoardUtils.isEndGame(board)) {\n            this.boardsEvaluated++;\n            return this.evaluator.evaluate(board, depth);\n        }\n        int currentHighest = highest;\n        for (final Move move : this.moveSorter.sort((board.currentPlayer().getLegalMoves()))) {\n            final MoveTransition moveTransition = board.currentPlayer().makeMove(move);\n            if (moveTransition.getMoveStatus().isDone()) {\n                currentHighest = Math.max(currentHighest, min(moveTransition.getToBoard(),\n                        depth - 1, currentHighest, lowest));\n                if (lowest <= currentHighest) {\n                    this.cutOffsProduced++;\n                    break;\n                }\n            }\n        }\n        return currentHighest;\n    }\n\n    public int min(final Board board,\n                   final int depth,\n                   final int highest,\n                   final int lowest) {\n        if (depth == 0 || BoardUtils.isEndGame(board)) {\n            this.boardsEvaluated++;\n            return this.evaluator.evaluate(board, depth);\n        }\n        int currentLowest = lowest;\n        for (final Move move : this.moveSorter.sort((board.currentPlayer().getLegalMoves()))) {\n            final MoveTransition moveTransition = board.currentPlayer().makeMove(move);\n            if (moveTransition.getMoveStatus().isDone()) {\n                currentLowest = Math.min(currentLowest, max(moveTransition.getToBoard(),\n                        depth - 1, highest, currentLowest));\n                if (currentLowest <= highest) {\n                    this.cutOffsProduced++;\n                    break;\n                }\n            }\n        }\n        return currentLowest;\n    }\n\n    private static class MoveScoreRecord implements Comparable<MoveScoreRecord> {\n        final Move move;\n        final int score;\n\n        MoveScoreRecord(final Move move, final int score) {\n            this.move = move;\n            this.score = score;\n        }\n\n        Move getMove() {\n            return this.move;\n        }\n\n        int getScore() {\n            return this.score;\n        }\n\n        @Override\n        public int compareTo(MoveScoreRecord o) {\n            return Integer.compare(this.score, o.score);\n        }\n\n        @Override\n        public String toString() {\n            return this.move + \" : \" +this.score;\n        }\n    }\n\n    enum Ordering {\n        ASC {\n            @Override\n            List<MoveScoreRecord> order(final List<MoveScoreRecord> moveScoreRecords) {\n                Collections.sort(moveScoreRecords, new Comparator<MoveScoreRecord>() {\n                    @Override\n                    public int compare(final MoveScoreRecord o1,\n                                       final MoveScoreRecord o2) {\n                        return Ints.compare(o1.getScore(), o2.getScore());\n                    }\n                });\n                return moveScoreRecords;\n            }\n        },\n        DESC {\n            @Override\n            List<MoveScoreRecord> order(final List<MoveScoreRecord> moveScoreRecords) {\n                Collections.sort(moveScoreRecords, new Comparator<MoveScoreRecord>() {\n                    @Override\n                    public int compare(final MoveScoreRecord o1,\n                                       final MoveScoreRecord o2) {\n                        return Ints.compare(o2.getScore(), o1.getScore());\n                    }\n                });\n                return moveScoreRecords;\n            }\n        };\n\n        abstract List<MoveScoreRecord> order(final List<MoveScoreRecord> moveScoreRecords);\n    }\n\n\n    private static class MoveOrderingBuilder {\n        List<MoveScoreRecord> moveScoreRecords;\n        Ordering ordering;\n\n        MoveOrderingBuilder() {\n            this.moveScoreRecords = new ArrayList<>();\n        }\n\n        void addMoveOrderingRecord(final Move move,\n                                   final int score) {\n            this.moveScoreRecords.add(new MoveScoreRecord(move, score));\n        }\n\n        void setOrder(final Ordering order) {\n            this.ordering = order;\n        }\n\n        List<MoveScoreRecord> build() {\n            return this.ordering.order(moveScoreRecords);\n        }\n    }\n\n\n}",
                  "lineCount": 236,
                  "methodCount": 20,
                  "fieldCount": 6,
                  "modifiers": [
                    "public"
                  ],
                  "path": "com.chess.engine.classic.player.ai",
                  "containsMainMethod": false
                },
                "frontYards": [
                  {
                    "width": 0.055144343554458186,
                    "height": 0.19518672835593864,
                    "position": {
                      "x": 0.049636956521739134,
                      "y": 0.04963695652173913
                    },
                    "treeWidth": 0.09927391304347825
                  },
                  {
                    "width": 0.055144343554458186,
                    "height": 0.19518672835593864,
                    "position": {
                      "x": 0.299968028432136,
                      "y": 0.04963695652173913
                    },
                    "treeWidth": 0.09927391304347825
                  }
                ]
              }
            },
            {
              "street": {
                "hidden": false,
                "depth": 0.01,
                "nestingDepth": 2,
                "dimension": {
                  "width": 0.4047493285083333,
                  "height": 0.08934652173913044
                },
                "position": {
                  "x": 0,
                  "y": 0.2497873805298517
                }
              }
            },
            {
              "building": {
                "name": "StandardBoardEvaluator",
                "hidden": false,
                "depth": 0.35,
                "dimension": {
                  "width": 0.19518672835593864,
                  "height": 0.19518672835593864
                },
                "position": {
                  "x": 0.49411160654611785,
                  "y": 0.04963695652173913
                },
                "type": "JavaClass",
                "metrics": {
                  "sourceCode": "public final class StandardBoardEvaluator\n        implements BoardEvaluator {\n\n    private final static int CHECK_MATE_BONUS = 10000;\n    private final static int CHECK_BONUS = 45;\n    private final static int CASTLE_BONUS = 25;\n    private final static int MOBILITY_MULTIPLIER = 5;\n    private final static int ATTACK_MULTIPLIER = 1;\n    private final static int TWO_BISHOPS_BONUS = 25;\n    private static final StandardBoardEvaluator INSTANCE = new StandardBoardEvaluator();\n\n    private StandardBoardEvaluator() {\n    }\n\n    public static StandardBoardEvaluator get() {\n        return INSTANCE;\n    }\n\n    @Override\n    public int evaluate(final Board board,\n                        final int depth) {\n        return score(board.whitePlayer(), depth) - score(board.blackPlayer(), depth);\n    }\n\n    public String evaluationDetails(final Board board, final int depth) {\n        return\n               (\"White Mobility : \" + mobility(board.whitePlayer()) + \"\\n\") +\n                \"White kingThreats : \" + kingThreats(board.whitePlayer(), depth) + \"\\n\" +\n                \"White attacks : \" + attacks(board.whitePlayer()) + \"\\n\" +\n                \"White castle : \" + castle(board.whitePlayer()) + \"\\n\" +\n                \"White pieceEval : \" + pieceEvaluations(board.whitePlayer()) + \"\\n\" +\n                \"White pawnStructure : \" + pawnStructure(board.whitePlayer()) + \"\\n\" +\n                \"---------------------\\n\" +\n                \"Black Mobility : \" + mobility(board.blackPlayer()) + \"\\n\" +\n                \"Black kingThreats : \" + kingThreats(board.blackPlayer(), depth) + \"\\n\" +\n                \"Black attacks : \" + attacks(board.blackPlayer()) + \"\\n\" +\n                \"Black castle : \" + castle(board.blackPlayer()) + \"\\n\" +\n                \"Black pieceEval : \" + pieceEvaluations(board.blackPlayer()) + \"\\n\" +\n                \"Black pawnStructure : \" + pawnStructure(board.blackPlayer()) + \"\\n\\n\" +\n                \"Final Score = \" + evaluate(board, depth);\n    }\n\n    @VisibleForTesting\n    private static int score(final Player player,\n                             final int depth) {\n        return mobility(player) +\n               kingThreats(player, depth) +\n               attacks(player) +\n               castle(player) +\n               pieceEvaluations(player) +\n               pawnStructure(player);\n    }\n\n    private static int attacks(final Player player) {\n        int attackScore = 0;\n        for(final Move move : player.getLegalMoves()) {\n            if(move.isAttack()) {\n                final Piece movedPiece = move.getMovedPiece();\n                final Piece attackedPiece = move.getAttackedPiece();\n                if(movedPiece.getPieceValue() <= attackedPiece.getPieceValue()) {\n                    attackScore++;\n                }\n            }\n        }\n        return attackScore * ATTACK_MULTIPLIER;\n    }\n\n    private static int pieceEvaluations(final Player player) {\n        int pieceValuationScore = 0;\n        int numBishops = 0;\n        for (final Piece piece : player.getActivePieces()) {\n            pieceValuationScore += piece.getPieceValue() + piece.locationBonus();\n            if(piece.getPieceType() == BISHOP) {\n                numBishops++;\n            }\n        }\n        return pieceValuationScore + (numBishops == 2 ? TWO_BISHOPS_BONUS : 0);\n    }\n\n    private static int mobility(final Player player) {\n        return MOBILITY_MULTIPLIER * mobilityRatio(player);\n    }\n\n    private static int mobilityRatio(final Player player) {\n        return (int)((player.getLegalMoves().size() * 10.0f) / player.getOpponent().getLegalMoves().size());\n    }\n\n    private static int kingThreats(final Player player,\n                                   final int depth) {\n        return player.getOpponent().isInCheckMate() ? CHECK_MATE_BONUS  * depthBonus(depth) : check(player);\n    }\n\n    private static int check(final Player player) {\n        return player.getOpponent().isInCheck() ? CHECK_BONUS : 0;\n    }\n\n    private static int depthBonus(final int depth) {\n        return depth == 0 ? 1 : 100 * depth;\n    }\n\n    private static int castle(final Player player) {\n        return player.isCastled() ? CASTLE_BONUS : 0;\n    }\n\n    private static int pawnStructure(final Player player) {\n        return PawnStructureAnalyzer.get().pawnStructureScore(player);\n    }\n\n    private static int kingSafety(final Player player) {\n        final KingDistance kingDistance = KingSafetyAnalyzer.get().calculateKingTropism(player);\n        return ((kingDistance.getEnemyPiece().getPieceValue() / 100) * kingDistance.getDistance());\n    }\n\n//    private static int rookStructure(final Player player) {\n//        return RookStructureAnalyzer.get().rookStructureScore(player);\n//    }\n\n}",
                  "lineCount": 118,
                  "methodCount": 18,
                  "fieldCount": 7,
                  "modifiers": [
                    "public",
                    "final"
                  ],
                  "path": "com.chess.engine.classic.player.ai",
                  "containsMainMethod": false
                },
                "frontYards": [
                  {
                    "width": 0.039725321516045464,
                    "height": 0.19518672835593864,
                    "position": {
                      "x": 0.4543862850300724,
                      "y": 0.04963695652173913
                    },
                    "treeWidth": 0.09927391304347825
                  },
                  {
                    "width": 0.039725321516045464,
                    "height": 0.19518672835593864,
                    "position": {
                      "x": 0.6892983349020565,
                      "y": 0.04963695652173913
                    },
                    "treeWidth": 0.09927391304347825
                  }
                ]
              }
            },
            {
              "street": {
                "hidden": false,
                "depth": 0.01,
                "nestingDepth": 2,
                "dimension": {
                  "width": 0.37391128443150784,
                  "height": 0.08934652173913044
                },
                "position": {
                  "x": 0.4047493285083333,
                  "y": 0.2497873805298517
                }
              }
            },
            {
              "street": {
                "hidden": false,
                "depth": 0.01,
                "nestingDepth": 2,
                "dimension": {
                  "width": 0.08934652173913044,
                  "height": 0.2944606413994169
                },
                "position": {
                  "x": 0.3600760676387681,
                  "y": 0
                }
              }
            },
            {
              "building": {
                "name": "StockAlphaBeta",
                "hidden": false,
                "depth": 0.572457627118644,
                "dimension": {
                  "width": 0.1420465248511006,
                  "height": 0.1420465248511006
                },
                "position": {
                  "x": 0.04963695652173913,
                  "y": 0.40452581434801627
                },
                "type": "JavaClass",
                "metrics": {
                  "sourceCode": "public class StockAlphaBeta extends Observable implements MoveStrategy {\n\n    private final BoardEvaluator evaluator;\n    private final int searchDepth;\n    private long boardsEvaluated;\n    private int quiescenceCount;\n    private static final int MAX_QUIESCENCE = 5000 * 5;\n\n    private enum MoveSorter {\n\n        STANDARD {\n            @Override\n            Collection<Move> sort(final Collection<Move> moves) {\n                return Ordering.from((Comparator<Move>) (move1, move2) -> ComparisonChain.start()\n                        .compareTrueFirst(move1.isCastlingMove(), move2.isCastlingMove())\n                        .compare(mvvlva(move2), mvvlva(move1))\n                        .result()).immutableSortedCopy(moves);\n            }\n        },\n        EXPENSIVE {\n            @Override\n            Collection<Move> sort(final Collection<Move> moves) {\n                return Ordering.from((Comparator<Move>) (move1, move2) -> ComparisonChain.start()\n                        .compareTrueFirst(BoardUtils.kingThreat(move1), BoardUtils.kingThreat(move2))\n                        .compareTrueFirst(move1.isCastlingMove(), move2.isCastlingMove())\n                        .compare(mvvlva(move2), mvvlva(move1))\n                        .result()).immutableSortedCopy(moves);\n            }\n        };\n\n        abstract  Collection<Move> sort(Collection<Move> moves);\n    }\n\n\n    public StockAlphaBeta(final int searchDepth) {\n        this.evaluator = StandardBoardEvaluator.get();\n        this.searchDepth = searchDepth;\n        this.boardsEvaluated = 0;\n        this.quiescenceCount = 0;\n    }\n\n    @Override\n    public String toString() {\n        return \"StockAB\";\n    }\n\n    @Override\n    public long getNumBoardsEvaluated() {\n        return this.boardsEvaluated;\n    }\n\n    @Override\n    public Move execute(final Board board) {\n        final long startTime = System.currentTimeMillis();\n        final Player currentPlayer = board.currentPlayer();\n        Move bestMove = MoveFactory.getNullMove();\n        int highestSeenValue = Integer.MIN_VALUE;\n        int lowestSeenValue = Integer.MAX_VALUE;\n        int currentValue;\n        System.out.println(board.currentPlayer() + \" THINKING with depth = \" + this.searchDepth);\n        int moveCounter = 1;\n        int numMoves = board.currentPlayer().getLegalMoves().size();\n        for (final Move move : MoveSorter.EXPENSIVE.sort((board.currentPlayer().getLegalMoves()))) {\n            final MoveTransition moveTransition = board.currentPlayer().makeMove(move);\n            this.quiescenceCount = 0;\n            final String s;\n            if (moveTransition.getMoveStatus().isDone()) {\n                final long candidateMoveStartTime = System.nanoTime();\n                currentValue = currentPlayer.getAlliance().isWhite() ?\n                        min(moveTransition.getToBoard(), this.searchDepth - 1, highestSeenValue, lowestSeenValue) :\n                        max(moveTransition.getToBoard(), this.searchDepth - 1, highestSeenValue, lowestSeenValue);\n                if (currentPlayer.getAlliance().isWhite() && currentValue > highestSeenValue) {\n                    highestSeenValue = currentValue;\n                    bestMove = move;\n                    if(moveTransition.getToBoard().blackPlayer().isInCheckMate()) {\n                        break;\n                    }\n                }\n                else if (currentPlayer.getAlliance().isBlack() && currentValue < lowestSeenValue) {\n                    lowestSeenValue = currentValue;\n                    bestMove = move;\n                    if(moveTransition.getToBoard().whitePlayer().isInCheckMate()) {\n                        break;\n                    }\n                }\n\n                final String quiescenceInfo = \" \" + score(currentPlayer, highestSeenValue, lowestSeenValue) + \" q: \" +this.quiescenceCount;\n                s = \"\\t\" + toString() + \"(\" +this.searchDepth+ \"), m: (\" +moveCounter+ \"/\" +numMoves+ \") \" + move + \", best:  \" + bestMove\n\n                        + quiescenceInfo + \", t: \" +calculateTimeTaken(candidateMoveStartTime, System.nanoTime());\n            } else {\n                s = \"\\t\" + toString() + \"(\" +this.searchDepth + \")\" + \", m: (\" +moveCounter+ \"/\" +numMoves+ \") \" + move + \" is illegal! best: \" +bestMove;\n            }\n            System.out.println(s);\n            setChanged();\n            notifyObservers(s);\n            moveCounter++;\n        }\n\n        final long executionTime = System.currentTimeMillis() - startTime;\n        final String result = board.currentPlayer() + \" SELECTS \" +bestMove+ \" [#boards evaluated = \" +this.boardsEvaluated+\n                \" time taken = \" + executionTime /1000+ \" rate = \" +(1000 * ((double)this.boardsEvaluated/ executionTime));\n        System.out.printf(\"%s SELECTS %s [#boards evaluated = %d, time taken = %d ms, rate = %.1f\\n\", board.currentPlayer(),\n                bestMove, this.boardsEvaluated, executionTime, (1000 * ((double)this.boardsEvaluated/ executionTime)));\n        setChanged();\n        notifyObservers(result);\n        return bestMove;\n    }\n\n    private static String score(final Player currentPlayer,\n                                final int highestSeenValue,\n                                final int lowestSeenValue) {\n\n        if(currentPlayer.getAlliance().isWhite()) {\n            return \"[score: \" +highestSeenValue + \"]\";\n        } else if(currentPlayer.getAlliance().isBlack()) {\n            return \"[score: \" +lowestSeenValue+ \"]\";\n        }\n        throw new RuntimeException(\"bad bad boy!\");\n    }\n\n    private int max(final Board board,\n                    final int depth,\n                    final int highest,\n                    final int lowest) {\n        if (depth == 0 || BoardUtils.isEndGame(board)) {\n            this.boardsEvaluated++;\n            return this.evaluator.evaluate(board, depth);\n        }\n        int currentHighest = highest;\n        for (final Move move : MoveSorter.STANDARD.sort((board.currentPlayer().getLegalMoves()))) {\n            final MoveTransition moveTransition = board.currentPlayer().makeMove(move);\n            if (moveTransition.getMoveStatus().isDone()) {\n                final Board toBoard = moveTransition.getToBoard();\n                currentHighest = Math.max(currentHighest, min(toBoard,\n                        calculateQuiescenceDepth(toBoard, depth), currentHighest, lowest));\n                if (currentHighest >= lowest) {\n                    return lowest;\n                }\n            }\n        }\n        return currentHighest;\n    }\n\n    private int min(final Board board,\n                    final int depth,\n                    final int highest,\n                    final int lowest) {\n        if (depth == 0 || BoardUtils.isEndGame(board)) {\n            this.boardsEvaluated++;\n            return this.evaluator.evaluate(board, depth);\n        }\n        int currentLowest = lowest;\n        for (final Move move : MoveSorter.STANDARD.sort((board.currentPlayer().getLegalMoves()))) {\n            final MoveTransition moveTransition = board.currentPlayer().makeMove(move);\n            if (moveTransition.getMoveStatus().isDone()) {\n                final Board toBoard = moveTransition.getToBoard();\n                currentLowest = Math.min(currentLowest, max(toBoard,\n                        calculateQuiescenceDepth(toBoard, depth), highest, currentLowest));\n                if (currentLowest <= highest) {\n                    return highest;\n                }\n            }\n        }\n        return currentLowest;\n    }\n\n    private int calculateQuiescenceDepth(final Board toBoard,\n                                         final int depth) {\n        if(depth == 1 && this.quiescenceCount < MAX_QUIESCENCE) {\n            int activityMeasure = 0;\n            if (toBoard.currentPlayer().isInCheck()) {\n                activityMeasure += 1;\n            }\n            for(final Move move: BoardUtils.lastNMoves(toBoard, 2)) {\n                if(move.isAttack()) {\n                    activityMeasure += 1;\n                }\n            }\n            if(activityMeasure >= 2) {\n                this.quiescenceCount++;\n                return 2;\n            }\n        }\n        return depth - 1;\n    }\n\n    private static String calculateTimeTaken(final long start, final long end) {\n        final long timeTaken = (end - start) / 1000000;\n        return timeTaken + \" ms\";\n    }\n\n}",
                  "lineCount": 193,
                  "methodCount": 13,
                  "fieldCount": 5,
                  "modifiers": [
                    "public"
                  ],
                  "path": "com.chess.engine.classic.player.ai",
                  "containsMainMethod": false
                },
                "frontYards": [
                  {
                    "width": 0.1420465248511006,
                    "height": 0.06042821642686025,
                    "position": {
                      "x": 0.04963695652173913,
                      "y": 0.344097597921156
                    },
                    "treeWidth": 0.09927391304347825
                  },
                  {
                    "width": 0.1420465248511006,
                    "height": 0.06042821642686025,
                    "position": {
                      "x": 0.04963695652173913,
                      "y": 0.5465723391991169
                    },
                    "treeWidth": 0.09927391304347825
                  }
                ]
              }
            },
            {
              "street": {
                "hidden": false,
                "depth": 0.01,
                "nestingDepth": 2,
                "dimension": {
                  "width": 0.24132043789457885,
                  "height": 0.08934652173913044
                },
                "position": {
                  "x": 0,
                  "y": 0.611964251278151
                }
              }
            },
            {
              "building": {
                "name": "MoveOrdering",
                "hidden": false,
                "depth": 0.37076271186440674,
                "dimension": {
                  "width": 0.1420465248511006,
                  "height": 0.1420465248511006
                },
                "position": {
                  "x": 0.04963695652173913,
                  "y": 0.757295493648308
                },
                "type": "JavaClass",
                "metrics": {
                  "sourceCode": "public final class MoveOrdering {\n\n    private final BoardEvaluator evaluator;\n\n    private static final MoveOrdering INSTANCE = new MoveOrdering();\n    private static final int ORDER_SEARCH_DEPTH = 2;\n\n    private MoveOrdering() {\n        this.evaluator = StandardBoardEvaluator.get();\n    }\n\n    public static MoveOrdering get() {\n        return INSTANCE;\n    }\n\n    public List<Move> orderMoves(final Board board) {\n        return orderImpl(board, ORDER_SEARCH_DEPTH);\n    }\n\n    private static class MoveOrderEntry {\n        final Move move;\n        final int score;\n\n        MoveOrderEntry(final Move move,\n                       final int score) {\n            this.move = move;\n            this.score = score;\n        }\n\n        final Move getMove() {\n            return this.move;\n        }\n\n        final int getScore() {\n            return this.score;\n        }\n\n        @Override\n        public String toString() {\n            return \"move = \" +this.move+ \" score = \" +this.score;\n        }\n    }\n\n    private List<Move> orderImpl(final Board board,\n                                 final int depth) {\n        final List<MoveOrderEntry> moveOrderEntries = new ArrayList<>();\n        for (final Move move : board.currentPlayer().getLegalMoves()) {\n            final MoveTransition moveTransition = board.currentPlayer().makeMove(move);\n            if (moveTransition.getMoveStatus().isDone()) {\n                final int attackBonus = calculateAttackBonus(board.currentPlayer(), move);\n                final int currentValue = attackBonus + (board.currentPlayer().getAlliance().isWhite() ?\n                        min(moveTransition.getToBoard(), depth - 1) :\n                        max(moveTransition.getToBoard(), depth - 1));\n                moveOrderEntries.add(new MoveOrderEntry(move, currentValue));\n            }\n        }\n        Collections.sort(moveOrderEntries, new Comparator<MoveOrderEntry>() {\n            @Override\n            public int compare(final MoveOrderEntry o1, final MoveOrderEntry o2) {\n                return Ints.compare(o2.getScore(), o1.getScore());\n            }\n        });\n        final List<Move> orderedMoves = new ArrayList<>();\n        for(final MoveOrderEntry entry : moveOrderEntries) {\n            orderedMoves.add(entry.getMove());\n        }\n\n        return ImmutableList.copyOf(orderedMoves);\n    }\n\n    private int calculateAttackBonus(final Player player,\n                                     final Move move) {\n        final int attackBonus = move.isAttack() ? 1000 : 0;\n        return attackBonus * (player.getAlliance().isWhite() ? 1 : -1);\n    }\n\n    private static Collection<Move> calculateSimpleMoveOrder(final Collection<Move> moves) {\n        final List<Move> sortedMoves = new ArrayList<>();\n        sortedMoves.addAll(moves);\n        Collections.sort(sortedMoves, (m1, m2) -> Booleans.compare(m2.isAttack(), m1.isAttack()));\n        return sortedMoves;\n    }\n\n    public int min(final Board board,\n                   final int depth) {\n        if(depth == 0 || isEndGameScenario(board)) {\n            return this.evaluator.evaluate(board, depth);\n        }\n        int lowestSeenValue = Integer.MAX_VALUE;\n        for (final Move move : calculateSimpleMoveOrder(board.currentPlayer().getLegalMoves())) {\n            final MoveTransition moveTransition = board.currentPlayer().makeMove(move);\n            if (moveTransition.getMoveStatus().isDone()) {\n                final int currentValue = max(moveTransition.getToBoard(), depth - 1);\n                if (currentValue <= lowestSeenValue) {\n                    lowestSeenValue = currentValue;\n                }\n            }\n        }\n        return lowestSeenValue;\n    }\n\n    public int max(final Board board,\n                   final int depth) {\n        if(depth == 0 || isEndGameScenario(board)) {\n            return this.evaluator.evaluate(board, depth);\n        }\n        int highestSeenValue = Integer.MIN_VALUE;\n        for (final Move move : calculateSimpleMoveOrder(board.currentPlayer().getLegalMoves())) {\n            final MoveTransition moveTransition = board.currentPlayer().makeMove(move);\n            if (moveTransition.getMoveStatus().isDone()) {\n                final int currentValue = min(moveTransition.getToBoard(), depth - 1);\n                if (currentValue >= highestSeenValue) {\n                    highestSeenValue = currentValue;\n                }\n            }\n        }\n        return highestSeenValue;\n    }\n\n    private static boolean isEndGameScenario(final Board board) {\n        return  board.currentPlayer().isInCheckMate() ||\n                board.currentPlayer().isInStaleMate();\n    }\n\n}",
                  "lineCount": 125,
                  "methodCount": 12,
                  "fieldCount": 3,
                  "modifiers": [
                    "public",
                    "final"
                  ],
                  "path": "com.chess.engine.classic.player.ai",
                  "containsMainMethod": false
                },
                "frontYards": [
                  {
                    "width": 0.1420465248511006,
                    "height": 0.0510210249788525,
                    "position": {
                      "x": 0.04963695652173913,
                      "y": 0.7062744686694554
                    },
                    "treeWidth": 0.09927391304347825
                  },
                  {
                    "width": 0.1420465248511006,
                    "height": 0.0510210249788525,
                    "position": {
                      "x": 0.04963695652173913,
                      "y": 0.8993420184994085
                    },
                    "treeWidth": 0.09927391304347825
                  }
                ]
              }
            },
            {
              "building": {
                "name": "PawnStructureAnalyzer",
                "hidden": false,
                "depth": 0.19576271186440675,
                "dimension": {
                  "width": 0.17696434595866362,
                  "height": 0.17696434595866362
                },
                "position": {
                  "x": 0.29095739441631796,
                  "y": 0.3559583919549396
                },
                "type": "JavaClass",
                "metrics": {
                  "sourceCode": "public final class PawnStructureAnalyzer {\n\n    private static final PawnStructureAnalyzer INSTANCE = new PawnStructureAnalyzer();\n\n    public static final int ISOLATED_PAWN_PENALTY = -10;\n    public static final int DOUBLED_PAWN_PENALTY = -10;\n\n    private PawnStructureAnalyzer() {\n    }\n\n    public static PawnStructureAnalyzer get() {\n        return INSTANCE;\n    }\n\n    public int isolatedPawnPenalty(final Player player) {\n        return calculateIsolatedPawnPenalty(createPawnColumnTable(calculatePlayerPawns(player)));\n    }\n\n    public int doubledPawnPenalty(final Player player) {\n        return calculatePawnColumnStack(createPawnColumnTable(calculatePlayerPawns(player)));\n    }\n\n    public int pawnStructureScore(final Player player) {\n        final int[] pawnsOnColumnTable = createPawnColumnTable(calculatePlayerPawns(player));\n        return calculatePawnColumnStack(pawnsOnColumnTable) + calculateIsolatedPawnPenalty(pawnsOnColumnTable);\n    }\n\n    private static Collection<Piece> calculatePlayerPawns(final Player player) {\n        return player.getActivePieces().stream().filter(piece -> piece.getPieceType() == Piece.PieceType.PAWN).collect(Collectors.toList());\n    }\n\n    private static int calculatePawnColumnStack(final int[] pawnsOnColumnTable) {\n        int pawnStackPenalty = 0;\n        for(final int pawnStack : pawnsOnColumnTable) {\n            if(pawnStack > 1) {\n                pawnStackPenalty += pawnStack;\n            }\n        }\n        return pawnStackPenalty * DOUBLED_PAWN_PENALTY;\n    }\n\n    private static int calculateIsolatedPawnPenalty(final int[] pawnsOnColumnTable) {\n        int numIsolatedPawns = 0;\n        if(pawnsOnColumnTable[0] > 0 && pawnsOnColumnTable[1] == 0) {\n            numIsolatedPawns += pawnsOnColumnTable[0];\n        }\n        if(pawnsOnColumnTable[7] > 0 && pawnsOnColumnTable[6] == 0) {\n            numIsolatedPawns += pawnsOnColumnTable[7];\n        }\n        for(int i = 1; i < pawnsOnColumnTable.length - 1; i++) {\n            if((pawnsOnColumnTable[i-1] == 0 && pawnsOnColumnTable[i+1] == 0)) {\n                numIsolatedPawns += pawnsOnColumnTable[i];\n            }\n        }\n        return numIsolatedPawns * ISOLATED_PAWN_PENALTY;\n    }\n\n    private static int[] createPawnColumnTable(final Collection<Piece> playerPawns) {\n        final int[] table = new int[8];\n        for(final Piece playerPawn : playerPawns) {\n            table[playerPawn.getPiecePosition() % 8]++;\n        }\n        return table;\n    }\n\n}",
                  "lineCount": 66,
                  "methodCount": 12,
                  "fieldCount": 3,
                  "modifiers": [
                    "public",
                    "final"
                  ],
                  "path": "com.chess.engine.classic.player.ai",
                  "containsMainMethod": false
                },
                "frontYards": [
                  {
                    "width": 0.17696434595866362,
                    "height": 0.011860794033783567,
                    "position": {
                      "x": 0.29095739441631796,
                      "y": 0.344097597921156
                    },
                    "treeWidth": 0.09927391304347825
                  },
                  {
                    "width": 0.17696434595866362,
                    "height": 0.011860794033783567,
                    "position": {
                      "x": 0.29095739441631796,
                      "y": 0.5329227379136032
                    },
                    "treeWidth": 0.09927391304347825
                  }
                ]
              }
            },
            {
              "street": {
                "hidden": false,
                "depth": 0.01,
                "nestingDepth": 2,
                "dimension": {
                  "width": 0.2762382590021419,
                  "height": 0.08934652173913044
                },
                "position": {
                  "x": 0.24132043789457885,
                  "y": 0.5497472275995607
                }
              }
            },
            {
              "street": {
                "hidden": false,
                "depth": 0.01,
                "nestingDepth": 2,
                "dimension": {
                  "width": 0.08934652173913044,
                  "height": 0.299959847069709
                },
                "position": {
                  "x": 0.19664717702501364,
                  "y": 0.2944606413994169
                }
              }
            },
            {
              "building": {
                "name": "AlphaBetaWithMoveOrdering",
                "hidden": false,
                "depth": 0.4953389830508474,
                "dimension": {
                  "width": 0.16182800299964212,
                  "height": 0.16182800299964212
                },
                "position": {
                  "x": 0.5671956534184599,
                  "y": 0.36352656343445033
                },
                "type": "JavaClass",
                "metrics": {
                  "sourceCode": "public class AlphaBetaWithMoveOrdering extends Observable implements MoveStrategy {\n\n    private final BoardEvaluator evaluator;\n    private final int searchDepth;\n    private final MoveSorter moveSorter;\n    private final int quiescenceFactor;\n    private long boardsEvaluated;\n    private long executionTime;\n    private int quiescenceCount;\n    private int cutOffsProduced;\n\n    private enum MoveSorter {\n\n        SORT {\n            @Override\n            Collection<Move> sort(final Collection<Move> moves) {\n                return Ordering.from(SMART_SORT).immutableSortedCopy(moves);\n            }\n        };\n\n        public static Comparator<Move> SMART_SORT = new Comparator<Move>() {\n            @Override\n            public int compare(final Move move1, final Move move2) {\n                return ComparisonChain.start()\n                        .compareTrueFirst(BoardUtils.isThreatenedBoardImmediate(move1.getBoard()), BoardUtils.isThreatenedBoardImmediate(move2.getBoard()))\n                        .compareTrueFirst(move1.isAttack(), move2.isAttack())\n                        .compareTrueFirst(move1.isCastlingMove(), move2.isCastlingMove())\n                        .compare(move2.getMovedPiece().getPieceValue(), move1.getMovedPiece().getPieceValue())\n                        .result();\n            }\n        };\n\n        abstract Collection<Move> sort(Collection<Move> moves);\n    }\n\n    public AlphaBetaWithMoveOrdering(final int searchDepth,\n                                     final int quiescenceFactor) {\n        this.evaluator = StandardBoardEvaluator.get();\n        this.searchDepth = searchDepth;\n        this.quiescenceFactor = quiescenceFactor;\n        this.moveSorter = MoveSorter.SORT;\n        this.boardsEvaluated = 0;\n        this.quiescenceCount = 0;\n        this.cutOffsProduced = 0;\n    }\n\n    @Override\n    public String toString() {\n        return \"AB+MO\";\n    }\n\n    @Override\n    public long getNumBoardsEvaluated() {\n        return this.boardsEvaluated;\n    }\n\n    @Override\n    public Move execute(final Board board) {\n        final long startTime = System.currentTimeMillis();\n        final Player currentPlayer = board.currentPlayer();\n        final Alliance alliance = currentPlayer.getAlliance();\n        Move bestMove = MoveFactory.getNullMove();\n        int highestSeenValue = Integer.MIN_VALUE;\n        int lowestSeenValue = Integer.MAX_VALUE;\n        int currentValue;\n        int moveCounter = 1;\n        final int numMoves = this.moveSorter.sort(board.currentPlayer().getLegalMoves()).size();\n        System.out.println(board.currentPlayer() + \" THINKING with depth = \" + this.searchDepth);\n        System.out.println(\"\\tOrdered moves! : \" + this.moveSorter.sort(board.currentPlayer().getLegalMoves()));\n        for (final Move move : this.moveSorter.sort(board.currentPlayer().getLegalMoves())) {\n            final MoveTransition moveTransition = board.currentPlayer().makeMove(move);\n            this.quiescenceCount = 0;\n            final String s;\n            if (moveTransition.getMoveStatus().isDone()) {\n                final long candidateMoveStartTime = System.nanoTime();\n                currentValue = alliance.isWhite() ?\n                        min(moveTransition.getToBoard(), this.searchDepth - 1, highestSeenValue, lowestSeenValue) :\n                        max(moveTransition.getToBoard(), this.searchDepth - 1, highestSeenValue, lowestSeenValue);\n                if (alliance.isWhite() && currentValue > highestSeenValue) {\n                    highestSeenValue = currentValue;\n                    bestMove = move;\n                    //setChanged();\n                    //notifyObservers(bestMove);\n                }\n                else if (alliance.isBlack() && currentValue < lowestSeenValue) {\n                    lowestSeenValue = currentValue;\n                    bestMove = move;\n                    //setChanged();\n                    //notifyObservers(bestMove);\n                }\n                final String quiescenceInfo = \" [h: \" +highestSeenValue+ \" l: \" +lowestSeenValue+ \"] q: \" +this.quiescenceCount;\n                s = \"\\t\" + toString() + \"(\" +this.searchDepth+ \"), m: (\" +moveCounter+ \"/\" +numMoves+ \") \" + move + \", best:  \" + bestMove\n\n                        + quiescenceInfo + \", t: \" +calculateTimeTaken(candidateMoveStartTime, System.nanoTime());\n            } else {\n                s = \"\\t\" + toString() + \", m: (\" +moveCounter+ \"/\" +numMoves+ \") \" + move + \" is illegal, best: \" +bestMove;\n            }\n            System.out.println(s);\n            setChanged();\n            notifyObservers(s);\n            moveCounter++;\n        }\n        this.executionTime = System.currentTimeMillis() - startTime;\n        System.out.printf(\"%s SELECTS %s [#boards evaluated = %d, time taken = %d ms, eval rate = %.1f cutoffCount = %d prune percent = %.2f\\n\", board.currentPlayer(),\n                bestMove, this.boardsEvaluated, this.executionTime, (1000 * ((double)this.boardsEvaluated/this.executionTime)), this.cutOffsProduced, 100 * ((double)this.cutOffsProduced/this.boardsEvaluated));\n        return bestMove;\n    }\n\n    public int max(final Board board,\n                   final int depth,\n                   final int highest,\n                   final int lowest) {\n        if (depth == 0 || BoardUtils.isEndGame(board)) {\n            this.boardsEvaluated++;\n            return this.evaluator.evaluate(board, depth);\n        }\n        int currentHighest = highest;\n        for (final Move move : this.moveSorter.sort((board.currentPlayer().getLegalMoves()))) {\n            final MoveTransition moveTransition = board.currentPlayer().makeMove(move);\n            if (moveTransition.getMoveStatus().isDone()) {\n                currentHighest = Math.max(currentHighest, min(moveTransition.getToBoard(),\n                        calculateQuiescenceDepth(board, move, depth), currentHighest, lowest));\n                if (lowest <= currentHighest) {\n                    this.cutOffsProduced++;\n                    break;\n                }\n            }\n        }\n        return currentHighest;\n    }\n\n    public int min(final Board board,\n                   final int depth,\n                   final int highest,\n                   final int lowest) {\n        if (depth == 0 || BoardUtils.isEndGame(board)) {\n            this.boardsEvaluated++;\n            return this.evaluator.evaluate(board, depth);\n        }\n        int currentLowest = lowest;\n        for (final Move move : this.moveSorter.sort((board.currentPlayer().getLegalMoves()))) {\n            final MoveTransition moveTransition = board.currentPlayer().makeMove(move);\n            if (moveTransition.getMoveStatus().isDone()) {\n                currentLowest = Math.min(currentLowest, max(moveTransition.getToBoard(),\n                        calculateQuiescenceDepth(board, move, depth), highest, currentLowest));\n                if (currentLowest <= highest) {\n                    this.cutOffsProduced++;\n                    break;\n                }\n            }\n        }\n        return currentLowest;\n    }\n\n    private int calculateQuiescenceDepth(final Board board,\n                                         final Move move,\n                                         final int depth) {\n        return depth - 1;\n    }\n\n    private static String calculateTimeTaken(final long start, final long end) {\n        final long timeTaken = (end - start) / 1000000;\n        return timeTaken + \" ms\";\n    }\n\n\n}",
                  "lineCount": 167,
                  "methodCount": 11,
                  "fieldCount": 8,
                  "modifiers": [
                    "public"
                  ],
                  "path": "com.chess.engine.classic.player.ai",
                  "containsMainMethod": false
                },
                "frontYards": [
                  {
                    "width": 0.16182800299964212,
                    "height": 0.019428965513294316,
                    "position": {
                      "x": 0.5671956534184599,
                      "y": 0.344097597921156
                    },
                    "treeWidth": 0.09927391304347825
                  },
                  {
                    "width": 0.16182800299964212,
                    "height": 0.019428965513294316,
                    "position": {
                      "x": 0.5671956534184599,
                      "y": 0.5253545664340924
                    },
                    "treeWidth": 0.09927391304347825
                  }
                ]
              }
            },
            {
              "street": {
                "hidden": false,
                "depth": 0.01,
                "nestingDepth": 2,
                "dimension": {
                  "width": 0.2611019160431204,
                  "height": 0.08934652173913044
                },
                "position": {
                  "x": 0.5175586968967207,
                  "y": 0.5497472275995607
                }
              }
            },
            {
              "street": {
                "hidden": false,
                "depth": 0.01,
                "nestingDepth": 2,
                "dimension": {
                  "width": 0.08934652173913044,
                  "height": 0.299959847069709
                },
                "position": {
                  "x": 0.4728854360271555,
                  "y": 0.2944606413994169
                }
              }
            },
            {
              "building": {
                "name": "KingSafetyAnalyzer",
                "hidden": false,
                "depth": 0.3648305084745762,
                "dimension": {
                  "width": 0.10351584272195886,
                  "height": 0.10351584272195886
                },
                "position": {
                  "x": 0.37147455496038084,
                  "y": 0.6440574449908651
                },
                "type": "JavaClass",
                "metrics": {
                  "sourceCode": "public final class KingSafetyAnalyzer {\n\n    private static final KingSafetyAnalyzer INSTANCE = new KingSafetyAnalyzer();\n    private static final List<List<Boolean>> COLUMNS = initColumns();\n\n    private KingSafetyAnalyzer() {\n    }\n\n    public static KingSafetyAnalyzer get() {\n        return INSTANCE;\n    }\n\n    private static List<List<Boolean>> initColumns() {\n        final List<List<Boolean>> columns = new ArrayList<>();\n        columns.add(BoardUtils.INSTANCE.FIRST_COLUMN);\n        columns.add(BoardUtils.INSTANCE.SECOND_COLUMN);\n        columns.add(BoardUtils.INSTANCE.THIRD_COLUMN);\n        columns.add(BoardUtils.INSTANCE.FOURTH_COLUMN);\n        columns.add(BoardUtils.INSTANCE.FIFTH_COLUMN);\n        columns.add(BoardUtils.INSTANCE.SIXTH_COLUMN);\n        columns.add(BoardUtils.INSTANCE.SEVENTH_COLUMN);\n        columns.add(BoardUtils.INSTANCE.EIGHTH_COLUMN);\n        return ImmutableList.copyOf(columns);\n    }\n\n    public KingDistance calculateKingTropism(final Player player) {\n        final int playerKingSquare = player.getPlayerKing().getPiecePosition();\n        final Collection<Move> enemyMoves = player.getOpponent().getLegalMoves();\n        Piece closestPiece = null;\n        int closestDistance = Integer.MAX_VALUE;\n        for(final Move move : enemyMoves) {\n            final int currentDistance = calculateChebyshevDistance(playerKingSquare, move.getDestinationCoordinate());\n            if(currentDistance < closestDistance) {\n                closestDistance = currentDistance;\n                closestPiece = move.getMovedPiece();\n            }\n        }\n        return new KingDistance(closestPiece, closestDistance);\n    }\n\n    private int calculateChebyshevDistance(final int kingTileId,\n                                           final int enemyAttackTileId) {\n\n        final int squareOneRank = getRank(kingTileId);\n        final int squareTwoRank = getRank(enemyAttackTileId);\n\n        final int squareOneFile = getFile(kingTileId);\n        final int squareTwoFile = getFile(enemyAttackTileId);\n\n        final int rankDistance = Math.abs(squareTwoRank - squareOneRank);\n        final int fileDistance = Math.abs(squareTwoFile - squareOneFile);\n\n        return Math.max(rankDistance, fileDistance);\n    }\n\n    private static int getFile(final int coordinate) {\n        if(BoardUtils.INSTANCE.FIRST_COLUMN.get(coordinate)) {\n            return 1;\n        } else if(BoardUtils.INSTANCE.SECOND_COLUMN.get(coordinate)) {\n            return 2;\n        } else if(BoardUtils.INSTANCE.THIRD_COLUMN.get(coordinate)) {\n            return 3;\n        } else if(BoardUtils.INSTANCE.FOURTH_COLUMN.get(coordinate)) {\n            return 4;\n        } else if(BoardUtils.INSTANCE.FIFTH_COLUMN.get(coordinate)) {\n            return 5;\n        } else if(BoardUtils.INSTANCE.SIXTH_COLUMN.get(coordinate)) {\n            return 6;\n        } else if(BoardUtils.INSTANCE.SEVENTH_COLUMN.get(coordinate)) {\n            return 7;\n        } else if(BoardUtils.INSTANCE.EIGHTH_COLUMN.get(coordinate)) {\n            return 8;\n        }\n        throw new RuntimeException(\"should not reach here!\");\n    }\n\n    private static int getRank(final int coordinate) {\n        if(BoardUtils.INSTANCE.FIRST_ROW.get(coordinate)) {\n            return 1;\n        } else if(BoardUtils.INSTANCE.SECOND_ROW.get(coordinate)) {\n            return 2;\n        } else if(BoardUtils.INSTANCE.THIRD_ROW.get(coordinate)) {\n            return 3;\n        } else if(BoardUtils.INSTANCE.FOURTH_ROW.get(coordinate)) {\n            return 4;\n        } else if(BoardUtils.INSTANCE.FIFTH_ROW.get(coordinate)) {\n            return 5;\n        } else if(BoardUtils.INSTANCE.SIXTH_ROW.get(coordinate)) {\n            return 6;\n        } else if(BoardUtils.INSTANCE.SEVENTH_ROW.get(coordinate)) {\n            return 7;\n        } else if(BoardUtils.INSTANCE.EIGHTH_ROW.get(coordinate)) {\n            return 8;\n        }\n        throw new RuntimeException(\"should not reach here!\");\n    }\n\n    static class KingDistance {\n\n        final Piece enemyPiece;\n        final int distance;\n\n        KingDistance(final Piece enemyDistance,\n                     final int distance) {\n            this.enemyPiece = enemyDistance;\n            this.distance = distance;\n        }\n\n        public Piece getEnemyPiece() {\n            return enemyPiece;\n        }\n\n        public int getDistance() {\n            return distance;\n        }\n\n        public int tropismScore() {\n            return (enemyPiece.getPieceValue()/10) * distance;\n        }\n\n    }\n\n}",
                  "lineCount": 123,
                  "methodCount": 10,
                  "fieldCount": 2,
                  "modifiers": [
                    "public",
                    "final"
                  ],
                  "path": "com.chess.engine.classic.player.ai",
                  "containsMainMethod": false
                },
                "frontYards": [
                  {
                    "width": 0.08051716054406291,
                    "height": 0.10351584272195886,
                    "position": {
                      "x": 0.29095739441631796,
                      "y": 0.6440574449908651
                    },
                    "treeWidth": 0.09927391304347825
                  },
                  {
                    "width": 0.08051716054406291,
                    "height": 0.10351584272195886,
                    "position": {
                      "x": 0.4749903976823397,
                      "y": 0.6440574449908651
                    },
                    "treeWidth": 0.09927391304347825
                  }
                ]
              }
            },
            {
              "street": {
                "hidden": false,
                "depth": 0.01,
                "nestingDepth": 2,
                "dimension": {
                  "width": 0.36382407685356294,
                  "height": 0.08934652173913044
                },
                "position": {
                  "x": 0.24132043789457885,
                  "y": 0.7525369833649979
                }
              }
            },
            {
              "street": {
                "hidden": false,
                "depth": 0.01,
                "nestingDepth": 2,
                "dimension": {
                  "width": 0.08934652173913044,
                  "height": 0.20278975576543712
                },
                "position": {
                  "x": 0.19664717702501364,
                  "y": 0.594420488469126
                }
              }
            },
            {
              "building": {
                "name": "MiniMax",
                "hidden": false,
                "depth": 0.4538135593220338,
                "dimension": {
                  "width": 0.10351584272195886,
                  "height": 0.10351584272195886
                },
                "position": {
                  "x": 0.37147455496038084,
                  "y": 0.8468472007563023
                },
                "type": "JavaClass",
                "metrics": {
                  "sourceCode": "public final class MiniMax implements MoveStrategy {\n\n    private final BoardEvaluator evaluator;\n    private final int searchDepth;\n    private long boardsEvaluated;\n    private long executionTime;\n    private FreqTableRow[] freqTable;\n    private int freqTableIndex;\n\n    public MiniMax(final int searchDepth) {\n        this.evaluator = StandardBoardEvaluator.get();\n        this.boardsEvaluated = 0;\n        this.searchDepth = searchDepth;\n    }\n\n    @Override\n    public String toString() {\n        return \"MiniMax\";\n    }\n\n    @Override\n    public long getNumBoardsEvaluated() {\n        return this.boardsEvaluated;\n    }\n\n    public Move execute(final Board board) {\n        final long startTime = System.currentTimeMillis();\n        Move bestMove = MoveFactory.getNullMove();\n        int highestSeenValue = Integer.MIN_VALUE;\n        int lowestSeenValue = Integer.MAX_VALUE;\n        int currentValue;\n        System.out.println(board.currentPlayer() + \" THINKING with depth = \" +this.searchDepth);\n        this.freqTable = new FreqTableRow[board.currentPlayer().getLegalMoves().size()];\n        this.freqTableIndex = 0;\n        int moveCounter = 1;\n        final int numMoves = board.currentPlayer().getLegalMoves().size();\n        for (final Move move : board.currentPlayer().getLegalMoves()) {\n            final MoveTransition moveTransition = board.currentPlayer().makeMove(move);\n            if (moveTransition.getMoveStatus().isDone()) {\n                final FreqTableRow row = new FreqTableRow(move);\n                this.freqTable[this.freqTableIndex] = row;\n                currentValue = board.currentPlayer().getAlliance().isWhite() ?\n                                min(moveTransition.getToBoard(), this.searchDepth - 1) :\n                                max(moveTransition.getToBoard(), this.searchDepth - 1);\n                System.out.println(\"\\t\" + toString() + \" analyzing move (\" +moveCounter + \"/\" +numMoves+ \") \" + move +\n                                   \" scores \" + currentValue + \" \" +this.freqTable[this.freqTableIndex]);\n                this.freqTableIndex++;\n                if (board.currentPlayer().getAlliance().isWhite() &&\n                        currentValue >= highestSeenValue) {\n                    highestSeenValue = currentValue;\n                    bestMove = move;\n                } else if (board.currentPlayer().getAlliance().isBlack() &&\n                        currentValue <= lowestSeenValue) {\n                    lowestSeenValue = currentValue;\n                    bestMove = move;\n                }\n            } else {\n                System.out.println(\"\\t\" + toString() + \" can't execute move (\" +moveCounter+ \"/\" +numMoves+ \") \" + move);\n            }\n            moveCounter++;\n        }\n\n        this.executionTime = System.currentTimeMillis() - startTime;\n        System.out.printf(\"%s SELECTS %s [#boards = %d time taken = %d ms, rate = %.1f\\n\", board.currentPlayer(),\n                bestMove, this.boardsEvaluated, this.executionTime, (1000 * ((double)this.boardsEvaluated/this.executionTime)));\n        long total = 0;\n        for (final FreqTableRow row : this.freqTable) {\n            if(row != null) {\n                total += row.getCount();\n            }\n        }\n        if(this.boardsEvaluated != total) {\n            System.out.println(\"somethings wrong with the # of boards evaluated!\");\n        }\n        return bestMove;\n    }\n\n    private int min(final Board board,\n                    final int depth) {\n        if(depth == 0) {\n            this.boardsEvaluated++;\n            this.freqTable[this.freqTableIndex].increment();\n            return this.evaluator.evaluate(board, depth);\n        }\n        if(isEndGameScenario(board)) {\n            return this.evaluator.evaluate(board, depth);\n        }\n        int lowestSeenValue = Integer.MAX_VALUE;\n        for (final Move move : board.currentPlayer().getLegalMoves()) {\n            final MoveTransition moveTransition = board.currentPlayer().makeMove(move);\n            if (moveTransition.getMoveStatus().isDone()) {\n                final int currentValue = max(moveTransition.getToBoard(), depth - 1);\n                if (currentValue <= lowestSeenValue) {\n                    lowestSeenValue = currentValue;\n                }\n            }\n        }\n        return lowestSeenValue;\n    }\n\n    private int max(final Board board,\n                    final int depth) {\n        if(depth == 0) {\n            this.boardsEvaluated++;\n            this.freqTable[this.freqTableIndex].increment();\n            return this.evaluator.evaluate(board, depth);\n        }\n        if(isEndGameScenario(board)) {\n            return this.evaluator.evaluate(board, depth);\n        }\n        int highestSeenValue = Integer.MIN_VALUE;\n        for (final Move move : board.currentPlayer().getLegalMoves()) {\n            final MoveTransition moveTransition = board.currentPlayer().makeMove(move);\n            if (moveTransition.getMoveStatus().isDone()) {\n                final int currentValue = min(moveTransition.getToBoard(), depth - 1);\n                if (currentValue >= highestSeenValue) {\n                    highestSeenValue = currentValue;\n                }\n            }\n        }\n        return highestSeenValue;\n    }\n\n    private static boolean isEndGameScenario(final Board board) {\n        return board.currentPlayer().isInCheckMate() || board.currentPlayer().isInStaleMate();\n    }\n\n    private static class FreqTableRow {\n\n        private final Move move;\n        private final AtomicLong count;\n\n        FreqTableRow(final Move move) {\n            this.count = new AtomicLong();\n            this.move = move;\n        }\n\n        long getCount() {\n            return this.count.get();\n        }\n\n        void increment() {\n            this.count.incrementAndGet();\n        }\n\n        @Override\n        public String toString() {\n            return BoardUtils.INSTANCE.getPositionAtCoordinate(this.move.getCurrentCoordinate()) +\n                   BoardUtils.INSTANCE.getPositionAtCoordinate(this.move.getDestinationCoordinate()) + \" : \" +this.count;\n        }\n    }\n\n}",
                  "lineCount": 153,
                  "methodCount": 10,
                  "fieldCount": 6,
                  "modifiers": [
                    "public",
                    "final"
                  ],
                  "path": "com.chess.engine.classic.player.ai",
                  "containsMainMethod": false
                },
                "frontYards": [
                  {
                    "width": 0.08051716054406291,
                    "height": 0.10351584272195886,
                    "position": {
                      "x": 0.29095739441631796,
                      "y": 0.8468472007563023
                    },
                    "treeWidth": 0.09927391304347825
                  },
                  {
                    "width": 0.08051716054406291,
                    "height": 0.10351584272195886,
                    "position": {
                      "x": 0.4749903976823397,
                      "y": 0.8468472007563023
                    },
                    "treeWidth": 0.09927391304347825
                  }
                ]
              }
            },
            {
              "street": {
                "hidden": false,
                "depth": 0.01,
                "nestingDepth": 2,
                "dimension": {
                  "width": 0.08934652173913044,
                  "height": 0.20278975576543712
                },
                "position": {
                  "x": 0.19664717702501364,
                  "y": 0.7972102442345631
                }
              }
            },
            {
              "building": {
                "name": "MoveStrategy",
                "hidden": false,
                "depth": 0.02076271186440678,
                "dimension": {
                  "width": 0.07424218514822102,
                  "height": 0.07424218514822102
                },
                "position": {
                  "x": 0.654781471269881,
                  "y": 0.6652358788024255
                },
                "type": "JavaInterface",
                "metrics": {
                  "sourceCode": "public interface MoveStrategy {\n\n    long getNumBoardsEvaluated();\n\n    Move execute(Board board);\n\n}",
                  "lineCount": 7,
                  "methodCount": 2,
                  "fieldCount": 0,
                  "modifiers": [],
                  "path": "com.chess.engine.classic.player.ai",
                  "containsMainMethod": false
                },
                "frontYards": [
                  {
                    "width": 0.07424218514822102,
                    "height": 0.0211784338115604,
                    "position": {
                      "x": 0.654781471269881,
                      "y": 0.6440574449908651
                    },
                    "treeWidth": 0.09927391304347825
                  },
                  {
                    "width": 0.07424218514822102,
                    "height": 0.0211784338115604,
                    "position": {
                      "x": 0.654781471269881,
                      "y": 0.7394780639506465
                    },
                    "treeWidth": 0.09927391304347825
                  }
                ]
              }
            },
            {
              "street": {
                "hidden": false,
                "depth": 0.01,
                "nestingDepth": 2,
                "dimension": {
                  "width": 0.17351609819169928,
                  "height": 0.08934652173913044
                },
                "position": {
                  "x": 0.6051445147481418,
                  "y": 0.7656201934143808
                }
              }
            },
            {
              "street": {
                "hidden": false,
                "depth": 0.01,
                "nestingDepth": 2,
                "dimension": {
                  "width": 0.08934652173913044,
                  "height": 0.21587296581482007
                },
                "position": {
                  "x": 0.5604712538785765,
                  "y": 0.594420488469126
                }
              }
            },
            {
              "building": {
                "name": "BoardEvaluator",
                "hidden": false,
                "depth": 0.01483050847457627,
                "dimension": {
                  "width": 0.07424218514822105,
                  "height": 0.07424218514822105
                },
                "position": {
                  "x": 0.654781471269881,
                  "y": 0.8680256345678625
                },
                "type": "JavaInterface",
                "metrics": {
                  "sourceCode": "public interface BoardEvaluator {\n\n    int evaluate(Board board, int depth);\n\n}",
                  "lineCount": 5,
                  "methodCount": 1,
                  "fieldCount": 0,
                  "modifiers": [],
                  "path": "com.chess.engine.classic.player.ai",
                  "containsMainMethod": false
                },
                "frontYards": [
                  {
                    "width": 0.07424218514822105,
                    "height": 0.008095223762177348,
                    "position": {
                      "x": 0.654781471269881,
                      "y": 0.8599304108056852
                    },
                    "treeWidth": 0.09927391304347825
                  },
                  {
                    "width": 0.07424218514822105,
                    "height": 0.008095223762177348,
                    "position": {
                      "x": 0.654781471269881,
                      "y": 0.9422678197160835
                    },
                    "treeWidth": 0.09927391304347825
                  }
                ]
              }
            },
            {
              "street": {
                "hidden": false,
                "depth": 0.01,
                "nestingDepth": 2,
                "dimension": {
                  "width": 0.08934652173913044,
                  "height": 0.189706545716054
                },
                "position": {
                  "x": 0.5604712538785765,
                  "y": 0.8102934542839461
                }
              }
            }
          ]
        }
      },
      {
        "building": {
          "name": "Player",
          "hidden": false,
          "depth": 0.2788135593220339,
          "dimension": {
            "width": 0.12206547401668062,
            "height": 0.12206547401668062
          },
          "position": {
            "x": 0.8282975694615803,
            "y": 0.16717239119678795
          },
          "type": "JavaClass",
          "metrics": {
            "sourceCode": "public abstract class Player {\n\n    protected final Board board;\n    protected final King playerKing;\n    protected final Collection<Move> legalMoves;\n    protected final boolean isInCheck;\n\n    Player(final Board board,\n           final Collection<Move> playerLegals,\n           final Collection<Move> opponentLegals) {\n        this.board = board;\n        this.playerKing = establishKing();\n        this.isInCheck = !calculateAttacksOnTile(this.playerKing.getPiecePosition(), opponentLegals).isEmpty();\n        playerLegals.addAll(calculateKingCastles(playerLegals, opponentLegals));\n        this.legalMoves = Collections.unmodifiableCollection(playerLegals);\n    }\n\n    public boolean isInCheck() {\n        return this.isInCheck;\n    }\n\n    public boolean isInCheckMate() {\n       return this.isInCheck && !hasEscapeMoves();\n    }\n\n    public boolean isInStaleMate() {\n        return !this.isInCheck && !hasEscapeMoves();\n    }\n\n    public boolean isCastled() {\n        return this.playerKing.isCastled();\n    }\n\n    public boolean isKingSideCastleCapable() {\n        return this.playerKing.isKingSideCastleCapable();\n    }\n\n    public boolean isQueenSideCastleCapable() {\n        return this.playerKing.isQueenSideCastleCapable();\n    }\n\n    public King getPlayerKing() {\n        return this.playerKing;\n    }\n\n    private King establishKing() {\n        return (King) getActivePieces().stream()\n                                       .filter(piece -> piece.getPieceType() == KING)\n                                       .findAny()\n                                       .orElseThrow(RuntimeException::new);\n    }\n\n    private boolean hasEscapeMoves() {\n        return this.legalMoves.stream()\n                              .anyMatch(move -> makeMove(move)\n                              .getMoveStatus().isDone());\n    }\n\n    public Collection<Move> getLegalMoves() {\n        return this.legalMoves;\n    }\n\n    static Collection<Move> calculateAttacksOnTile(final int tile,\n                                                   final Collection<Move> moves) {\n        return moves.stream()\n                    .filter(move -> move.getDestinationCoordinate() == tile)\n                    .collect(collectingAndThen(Collectors.toList(), Collections::unmodifiableList));\n    }\n\n    public MoveTransition makeMove(final Move move) {\n        if (!this.legalMoves.contains(move)) {\n            return new MoveTransition(this.board, this.board, move, MoveStatus.ILLEGAL_MOVE);\n        }\n        final Board transitionedBoard = move.execute();\n        return transitionedBoard.currentPlayer().getOpponent().isInCheck() ?\n                new MoveTransition(this.board, this.board, move, MoveStatus.LEAVES_PLAYER_IN_CHECK) :\n                new MoveTransition(this.board, transitionedBoard, move, MoveStatus.DONE);\n    }\n\n    public MoveTransition unMakeMove(final Move move) {\n        return new MoveTransition(this.board, move.undo(), move, MoveStatus.DONE);\n    }\n\n    public abstract Collection<Piece> getActivePieces();\n    public abstract Alliance getAlliance();\n    public abstract Player getOpponent();\n    protected abstract Collection<Move> calculateKingCastles(Collection<Move> playerLegals,\n                                                             Collection<Move> opponentLegals);\n    protected boolean hasCastleOpportunities() {\n        return !this.isInCheck && !this.playerKing.isCastled() &&\n                (this.playerKing.isKingSideCastleCapable() || this.playerKing.isQueenSideCastleCapable());\n    }\n\n}",
            "lineCount": 94,
            "methodCount": 16,
            "fieldCount": 4,
            "modifiers": [
              "public",
              "abstract"
            ],
            "path": "com.chess.engine.classic.player",
            "containsMainMethod": false
          },
          "frontYards": [
            {
              "width": 0.12206547401668062,
              "height": 0.11753543467504882,
              "position": {
                "x": 0.8282975694615803,
                "y": 0.049636956521739134
              },
              "treeWidth": 0.09927391304347825
            },
            {
              "width": 0.12206547401668062,
              "height": 0.11753543467504882,
              "position": {
                "x": 0.8282975694615803,
                "y": 0.28923786521346856
              },
              "treeWidth": 0.09927391304347825
            }
          ]
        }
      },
      {
        "street": {
          "hidden": false,
          "depth": 0.01,
          "nestingDepth": 1,
          "dimension": {
            "width": 0.22133938706015888,
            "height": 0.09927391304347827
          },
          "position": {
            "x": 0.7786606129398411,
            "y": 0.4067732998885174
          }
        }
      },
      {
        "street": {
          "hidden": false,
          "depth": 0.01,
          "nestingDepth": 1,
          "dimension": {
            "width": 0.09927391304347827,
            "height": 0.4564102564102565
          },
          "position": {
            "x": 0.729023656418102,
            "y": 0
          }
        }
      },
      {
        "building": {
          "name": "BlackPlayer",
          "hidden": false,
          "depth": 0.21355932203389827,
          "dimension": {
            "width": 0.12206547401668062,
            "height": 0.12206547401668062
          },
          "position": {
            "x": 0.8282975694615803,
            "y": 0.5415313655557623
          },
          "type": "JavaClass",
          "metrics": {
            "sourceCode": "public final class BlackPlayer extends Player {\n\n    public BlackPlayer(final Board board,\n                       final Collection<Move> whiteStandardLegals,\n                       final Collection<Move> blackStandardLegals) {\n        super(board, blackStandardLegals, whiteStandardLegals);\n    }\n\n    @Override\n    protected Collection<Move> calculateKingCastles(final Collection<Move> playerLegals,\n                                                    final Collection<Move> opponentLegals) {\n\n        if (!hasCastleOpportunities()) {\n            return Collections.emptyList();\n        }\n\n        final List<Move> kingCastles = new ArrayList<>();\n\n        if (this.playerKing.isFirstMove() && this.playerKing.getPiecePosition() == 4 && !this.isInCheck) {\n            //blacks king side castle\n            if (this.board.getPiece(5) == null && this.board.getPiece(6) == null) {\n                final Piece kingSideRook = this.board.getPiece(7);\n                if (kingSideRook != null && kingSideRook.isFirstMove() &&\n                        Player.calculateAttacksOnTile(5, opponentLegals).isEmpty() &&\n                        Player.calculateAttacksOnTile(6, opponentLegals).isEmpty() &&\n                        kingSideRook.getPieceType() == ROOK) {\n                    if (!BoardUtils.isKingPawnTrap(this.board, this.playerKing, 12)) {\n                        kingCastles.add(\n                                new KingSideCastleMove(this.board, this.playerKing, 6, (Rook) kingSideRook, kingSideRook.getPiecePosition(), 5));\n\n                    }\n                }\n            }\n            //blacks queen side castle\n            if (this.board.getPiece(1) == null && this.board.getPiece(2) == null &&\n                    this.board.getPiece(3) == null) {\n                final Piece queenSideRook = this.board.getPiece(0);\n                if (queenSideRook != null && queenSideRook.isFirstMove() &&\n                        Player.calculateAttacksOnTile(2, opponentLegals).isEmpty() &&\n                        Player.calculateAttacksOnTile(3, opponentLegals).isEmpty() &&\n                        queenSideRook.getPieceType() == ROOK) {\n                    if (!BoardUtils.isKingPawnTrap(this.board, this.playerKing, 12)) {\n                        kingCastles.add(\n                                new QueenSideCastleMove(this.board, this.playerKing, 2, (Rook) queenSideRook, queenSideRook.getPiecePosition(), 3));\n                    }\n                }\n            }\n        }\n        return Collections.unmodifiableList(kingCastles);\n    }\n\n    @Override\n    public WhitePlayer getOpponent() {\n        return this.board.whitePlayer();\n    }\n\n    @Override\n    public Collection<Piece> getActivePieces() {\n        return this.board.getBlackPieces();\n    }\n\n    @Override\n    public Alliance getAlliance() {\n        return Alliance.BLACK;\n    }\n\n    @Override\n    public String toString() {\n        return Alliance.BLACK.toString();\n    }\n\n}",
            "lineCount": 72,
            "methodCount": 8,
            "fieldCount": 0,
            "modifiers": [
              "public",
              "final"
            ],
            "path": "com.chess.engine.classic.player",
            "containsMainMethod": false
          },
          "frontYards": [
            {
              "width": 0.12206547401668062,
              "height": 0.035484152623766745,
              "position": {
                "x": 0.8282975694615803,
                "y": 0.5060472129319956
              },
              "treeWidth": 0.09927391304347825
            },
            {
              "width": 0.12206547401668062,
              "height": 0.035484152623766745,
              "position": {
                "x": 0.8282975694615803,
                "y": 0.663596839572443
              },
              "treeWidth": 0.09927391304347825
            }
          ]
        }
      },
      {
        "street": {
          "hidden": false,
          "depth": 0.01,
          "nestingDepth": 1,
          "dimension": {
            "width": 0.22133938706015888,
            "height": 0.09927391304347827
          },
          "position": {
            "x": 0.7786606129398411,
            "y": 0.6990809921962098
          }
        }
      },
      {
        "street": {
          "hidden": false,
          "depth": 0.01,
          "nestingDepth": 1,
          "dimension": {
            "width": 0.09927391304347827,
            "height": 0.2923076923076924
          },
          "position": {
            "x": 0.729023656418102,
            "y": 0.4564102564102565
          }
        }
      },
      {
        "building": {
          "name": "WhitePlayer",
          "hidden": false,
          "depth": 0.20762711864406777,
          "dimension": {
            "width": 0.12206547401668065,
            "height": 0.12206547401668065
          },
          "position": {
            "x": 0.8282975694615803,
            "y": 0.8133262373506344
          },
          "type": "JavaClass",
          "metrics": {
            "sourceCode": "public final class WhitePlayer extends Player {\n\n    public WhitePlayer(final Board board,\n                       final Collection<Move> whiteStandardLegals,\n                       final Collection<Move> blackStandardLegals) {\n        super(board, whiteStandardLegals, blackStandardLegals);\n    }\n\n    @Override\n    protected Collection<Move> calculateKingCastles(final Collection<Move> playerLegals,\n                                                    final Collection<Move> opponentLegals) {\n\n        if(!hasCastleOpportunities()) {\n            return Collections.emptyList();\n        }\n\n        final List<Move> kingCastles = new ArrayList<>();\n\n        if(this.playerKing.isFirstMove() && this.playerKing.getPiecePosition() == 60 && !this.isInCheck()) {\n            //whites king side castle\n            if(this.board.getPiece(61) == null && this.board.getPiece(62) == null) {\n                final Piece kingSideRook = this.board.getPiece(63);\n                if(kingSideRook != null && kingSideRook.isFirstMove()) {\n                    if(Player.calculateAttacksOnTile(61, opponentLegals).isEmpty() &&\n                       Player.calculateAttacksOnTile(62, opponentLegals).isEmpty() &&\n                       kingSideRook.getPieceType() == ROOK) {\n                        if(!BoardUtils.isKingPawnTrap(this.board, this.playerKing, 52)) {\n                            kingCastles.add(new KingSideCastleMove(this.board, this.playerKing, 62, (Rook) kingSideRook, kingSideRook.getPiecePosition(), 61));\n                        }\n                    }\n                }\n            }\n            //whites queen side castle\n            if(this.board.getPiece(59) == null && this.board.getPiece(58) == null &&\n               this.board.getPiece(57) == null) {\n                final Piece queenSideRook = this.board.getPiece(56);\n                if(queenSideRook != null && queenSideRook.isFirstMove()) {\n                    if(Player.calculateAttacksOnTile(58, opponentLegals).isEmpty() &&\n                       Player.calculateAttacksOnTile(59, opponentLegals).isEmpty() && queenSideRook.getPieceType() == ROOK) {\n                        if(!BoardUtils.isKingPawnTrap(this.board, this.playerKing, 52)) {\n                            kingCastles.add(new QueenSideCastleMove(this.board, this.playerKing, 58, (Rook) queenSideRook, queenSideRook.getPiecePosition(), 59));\n                        }\n                    }\n                }\n            }\n        }\n        return Collections.unmodifiableList(kingCastles);\n    }\n\n    @Override\n    public BlackPlayer getOpponent() {\n        return this.board.blackPlayer();\n    }\n\n    @Override\n    public Collection<Piece> getActivePieces() {\n        return this.board.getWhitePieces();\n    }\n\n    @Override\n    public Alliance getAlliance() {\n        return Alliance.WHITE;\n    }\n\n    @Override\n    public String toString() {\n        return Alliance.WHITE.toString();\n    }\n\n}",
            "lineCount": 70,
            "methodCount": 6,
            "fieldCount": 0,
            "modifiers": [
              "public",
              "final"
            ],
            "path": "com.chess.engine.classic.player",
            "containsMainMethod": false
          },
          "frontYards": [
            {
              "width": 0.12206547401668065,
              "height": 0.014971332110946207,
              "position": {
                "x": 0.8282975694615803,
                "y": 0.7983549052396881
              },
              "treeWidth": 0.09927391304347825
            },
            {
              "width": 0.12206547401668065,
              "height": 0.014971332110946207,
              "position": {
                "x": 0.8282975694615803,
                "y": 0.935391711367315
              },
              "treeWidth": 0.09927391304347825
            }
          ]
        }
      },
      {
        "street": {
          "hidden": false,
          "depth": 0.01,
          "nestingDepth": 1,
          "dimension": {
            "width": 0.09927391304347827,
            "height": 0.25128205128205133
          },
          "position": {
            "x": 0.729023656418102,
            "y": 0.748717948717949
          }
        }
      }
    ]
  }
};
