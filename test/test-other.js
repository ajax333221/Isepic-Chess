function testDisambiguation(){
	var board, board_name, start_time, end_time, error_msg;
	
	error_msg="";
	board_name="board_testDis";
	start_time=new Date().getTime();
	
	//if(!error_msg){
		board=IsepicChess.initBoard({
			name : board_name,
			fen : "6k1/8/8/2B1B3/8/2BKB2r/8/8 w - - 0 1",
			isHidden : true,
			invalidFenStop : true
		});
		
		if(board===null){
			error_msg="Error [0] failed to initBoard("+board_name+")";
		}
	//}
	
	if(!error_msg){
		board.moveCaller("c3", "d4");
		board.moveCaller("h3", "g3");
		board.moveCaller("d4", "c3");
		board.moveCaller("g3", "h3");
		board.moveCaller("e5", "d4");
		board.moveCaller("h3", "f3");
		board.moveCaller("d4", "e5");
		board.moveCaller("f3", "g3");
		board.moveCaller("c5", "d4");
		
		if((board.MoveList[1].PGNmove+board.MoveList[5].PGNmove+board.MoveList[9].PGNmove)!=="B3d4Bed4Bc5d4"){
			error_msg="Error [1] "+(board.MoveList[1].PGNmove+board.MoveList[5].PGNmove+board.MoveList[9].PGNmove)+" !== B3d4Bed4Bc5d4";
		}
	}
	
	if(IsepicChess.selectBoard(board_name)!==null){
		IsepicChess.removeBoard(board_name);
	}
	
	end_time=new Date().getTime();
	
	return {
		testName : "testDisambiguation()",
		result : (error_msg || "Ok"),
		elapsedTime : ((end_time-start_time)+" ms"),
		passed : !error_msg
	};
}

function testBasicFunctionality(){
	var board, board_name, board_copy, board_copy_name, start_time, end_time, error_msg;
	
	error_msg="";
	board_name="board_testBas";
	board_copy_name="board_testBas_copy";
	start_time=new Date().getTime();
	
	//if(!error_msg){
		board=IsepicChess.initBoard({
			name : board_name,
			fen : "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
			isRotated : true,
			isHidden : true,
			invalidFenStop : true
		});
		
		if(board===null){
			error_msg="Error [0] failed to initBoard("+board_name+")";
		}
	//}
	
	if(!error_msg){
		board.moveCaller("e2", "e4");
		board.moveCaller("f7", "f5");
		board.moveCaller("d1", "h5");
		
		if(board.Active.checks!==1){
			error_msg="Error [1] checks";
		}
	}
	
	if(!error_msg){
		if(board.legalMoves("g7").join("")!=="2,6"){
			error_msg="Error [2] remove check via pawn blocking";
		}
	}
	
	if(!error_msg){
		if(JSON.stringify(board.MoveList)!=="[{\"Fen\":\"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1\",\"PGNmove\":\"\",\"PGNend\":\"\",\"FromBos\":\"\",\"ToBos\":\"\"},{\"Fen\":\"rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1\",\"PGNmove\":\"e4\",\"PGNend\":\"\",\"FromBos\":\"e2\",\"ToBos\":\"e4\"},{\"Fen\":\"rnbqkbnr/ppppp1pp/8/5p2/4P3/8/PPPP1PPP/RNBQKBNR w KQkq f6 0 2\",\"PGNmove\":\"f5\",\"PGNend\":\"\",\"FromBos\":\"f7\",\"ToBos\":\"f5\"},{\"Fen\":\"rnbqkbnr/ppppp1pp/8/5p1Q/4P3/8/PPPP1PPP/RNB1KBNR b KQkq - 1 2\",\"PGNmove\":\"Qh5+\",\"PGNend\":\"\",\"FromBos\":\"d1\",\"ToBos\":\"h5\"}]"){
			error_msg="Error [3] movelist format, enpassant, clocks";
		}
	}
	
	if(!error_msg){
		board.moveCaller("g7", "g6");
		board.moveCaller("h5", "g6");
		
		if(board.legalMoves("h7").join("")!=="2,6"){
			error_msg="Error [4] remove check via pawn capture";
		}
	}
	
	if(!error_msg){
		board.moveCaller("h7", "g6");
		board.moveCaller("f1", "b5");
		board.moveCaller("h8", "h2");
		board.moveCaller("b5", "d7");
		
		if((board.legalMoves("b8").join("")+board.legalMoves("c8").join("")+board.legalMoves("d8").join("")+board.legalMoves("e8").join(""))!=="1,31,31,31,51,3"){
			error_msg="Error [5] remove check via (knight, bishop, queen, king) capture and via (king) moving out of check";
		}
	}
	
	if(!error_msg){
		board.moveCaller("e8", "f7");
		board.moveCaller("e4", "f5");
		board.moveCaller("h2", "h6");
		board.moveCaller("g1", "f3");
		board.moveCaller("a7", "a5");
		board.moveCaller("f5", "g6");
		board.moveCaller("f7", "f6");
		board.moveCaller("g6", "g7");
		board.moveCaller("a8", "a6");
		board.moveCaller("d7", "e8");
		board.moveCaller("f6", "f5");
		board.moveCaller("e8", "f7");
		board.moveCaller("h6", "c6");
		
		board.setPromoteTo(4);
		
		board.moveCaller("g7", "f8");
		
		if(board.MoveList[board.MoveList.length-1].PGNmove!=="gxf8=R"){
			error_msg="Error [6] underpromote to rook";
		}
	}
	
	if(!error_msg){
		board.moveCaller("a5", "a4");
		board.moveCaller("f7", "g6");
		
		if(board.Active.checks!==2){
			error_msg="Error [7] 2 active checks via discovered check";
		}
	}
	
	if(!error_msg){
		board.moveCaller("f5", "g6");
		board.moveCaller("e1", "g1");
		
		if(board.legalMoves("a4").join("")!=="5,0"){
			error_msg="Error [8] prevent pawn capture moving forward";
		}
	}
	
	if(!error_msg){
		if(board.legalMoves("e4").join("")!==""){
			error_msg="Error [9] wrong legal moves for empty square";
		}
	}
	
	if(!error_msg){
		board.moveCaller("a6", "b6");
		
		if(board.MoveList[board.MoveList.length-1].PGNmove!=="Rab6"){
			error_msg="Error [10] pgn disambiguation";
		}
	}
	
	if(!error_msg){
		if(board.legalMoves("b2").join("")!=="5,14,1"){
			error_msg="Error [11] pawn can move two squares";
		}
	}
	
	if(!error_msg){
		board.moveCaller("b2", "b4");
		
		if(board.legalMoves("a4").join("")!=="5,05,1"){
			error_msg="Error [12] pawn can capture enpassant or move";
		}
	}
	
	if(!error_msg){
		board.moveCaller("c6", "f6");
		
		if(board.legalMoves("f8").join("")!=="0,40,31,52,50,6"){
			error_msg="Error [13] rook movement with capture";
		}
	}
	
	if(!error_msg){
		if(board.legalMoves("b1").join("")!=="5,25,0"){
			error_msg="Error [14] knight movement, prevent capture ally";
		}
	}
	
	if(!error_msg){
		board.moveCaller("a2", "a3");
		
		if(board.legalMoves("a4").join("")!==""){
			error_msg="Error [15] prevent pawn capture moving forward(again) and no enpassant";
		}
	}
	
	if(!error_msg){
		board.moveCaller("b6", "a6");
		
		if(board.MoveList[board.MoveList.length-1].PGNmove!=="Ra6"){
			error_msg="Error [16] no pgn disambiguation needed";
		}
	}
	
	if(!error_msg){
		if(board.legalMoves("b4").join("")!=="3,1"){
			error_msg="Error [17] pawn can only move one square forward";
		}
	}
	
	if(!error_msg){
		board=IsepicChess.initBoard({
			name : board_name,
			fen : "r3k2r/pppq1ppp/2npb3/2b1N3/2B1n3/2NPB3/PPPQ1PPP/R3K2R w KQkq - 4 9",
			isHidden : true,
			invalidFenStop : true
		});
		
		if(board===null){
			error_msg="Error [18] failed to initBoard("+board_name+")";
		}
	}
	
	if(!error_msg){
		board_copy=IsepicChess.initBoard({
			name : board_copy_name
		});
		
		if(board_copy===null){
			error_msg="Error [19] failed to initBoard("+board_copy_name+")";
		}
	}
	
	if(!error_msg){
		IsepicChess.cloneBoard(board_copy.BoardName, board.BoardName);
		
		if(!IsepicChess.boardExists(board_copy.BoardName)){
			error_msg="Error [20] failed to cloneBoard()";
		}
	}
	
	if(!error_msg){
		if((board_copy.WCastling+" "+board_copy.BCastling)!=="3 3"){
			error_msg="Error [21] incorrect castling values for KQkq";
		}
	}
	
	if(!error_msg){
		board_copy.moveCaller("h1", "g1");
		
		if((board_copy.WCastling+" "+board_copy.BCastling)!=="2 3"){
			error_msg="Error [22] incorrect castling values for Qkq";
		}
	}
	
	if(!error_msg){
		board_copy.moveCaller("h8", "g8");
		
		if((board_copy.WCastling+" "+board_copy.BCastling)!=="2 2"){
			error_msg="Error [23] incorrect castling values for Qq";
		}
	}
	
	if(!error_msg){
		board_copy.moveCaller("a1", "b1");
		
		if((board_copy.WCastling+" "+board_copy.BCastling)!=="0 2"){
			error_msg="Error [24] incorrect castling values for q";
		}
	}
	
	if(!error_msg){
		board_copy.moveCaller("a8", "b8");
		
		if((board_copy.WCastling+" "+board_copy.BCastling)!=="0 0"){
			error_msg="Error [25] incorrect castling values for no castling rights";
		}
	}
	
	if(!error_msg){
		IsepicChess.cloneBoard(board_copy.BoardName, board.BoardName);
		board_copy.moveCaller("e1", "e2");
		
		if((board_copy.WCastling+" "+board_copy.BCastling)!=="0 3"){
			error_msg="Error [26] incorrect castling values for no castling rights via white king move";
		}
	}
	
	if(!error_msg){
		IsepicChess.cloneBoard(board_copy.BoardName, board.BoardName);
		board_copy.moveCaller("a1", "d1");
		board_copy.moveCaller("e8", "e7");
		
		if((board_copy.WCastling+" "+board_copy.BCastling)!=="1 0"){
			error_msg="Error [27] incorrect castling values for no castling rights via black king move";
		}
	}
	
	if(!error_msg){
		IsepicChess.cloneBoard(board_copy.BoardName, board.BoardName);
		board_copy.moveCaller("e5", "d7");
		board_copy.moveCaller("e4", "g3");
		board_copy.moveCaller("d7", "b6");
		board_copy.moveCaller("g3", "h1");
		board_copy.moveCaller("b6", "a8");
		board_copy.moveCaller("h1", "g3");
		board_copy.moveCaller("a8", "b6");
		
		if((board_copy.WCastling+" "+board_copy.BCastling)!=="2 1"){
			error_msg="Error [28] castling values remained after rook capture";
		}
	}
	
	if(!error_msg){
		board=IsepicChess.initBoard({
			name : board_name,
			fen : "r3k2r/4p3/3B1P2/2NpN1N1/1Pn1n1n1/3b1p2/4P3/R3K2R w KQkq - 0 1",
			isHidden : true,
			invalidFenStop : true
		});
		
		IsepicChess.cloneBoard(board_copy.BoardName, board.BoardName);
		
		if(IsepicChess.mapToBos(board_copy.legalMoves(board_copy.Active.kingPos)).join()!=="f1,d1,g1,c1"){
			error_msg="Error [29] incorrect white castling moves";
		}
	}
	
	if(!error_msg){
		board_copy.moveCaller("b4", "b5");
		
		if(IsepicChess.mapToBos(board_copy.legalMoves(board_copy.Active.kingPos)).join()!=="f8,d8,g8,c8"){
			error_msg="Error [30] incorrect black castling moves";
		}
	}
	
	if(!error_msg){
		board_copy.moveCaller("c4", "d2");
		
		if(IsepicChess.mapToBos(board_copy.legalMoves(board_copy.Active.kingPos)).join()!=="d1,c1"){
			error_msg="Error [31] long castle incorrectly prevented by attack on b square";
		}
	}
	
	if(!error_msg){
		board_copy.moveCaller("d6", "e7");
		
		if(IsepicChess.mapToBos(board_copy.legalMoves(board_copy.Active.kingPos)).join()!==""){
			error_msg="Error [32] castle not being prevented via first square";
		}
	}
	
	if(!error_msg){
		board_copy.moveCaller("g4", "e3");
		
		if(IsepicChess.mapToBos(board_copy.legalMoves(board_copy.Active.kingPos)).join()!==""){
			error_msg="Error [33] castle not being prevented on d square";
		}
	}
	
	if(!error_msg){
		IsepicChess.utilityMisc.cloneBoardObjs(board_copy, board);
		board_copy.moveCaller("f6", "f7");
		
		if(IsepicChess.mapToBos(board_copy.legalMoves(board_copy.Active.kingPos)).join()!=="f8,d8"){
			error_msg="Error [34] black king trying to castle being at check";
		}
	}
	
	if(!error_msg){
		board_copy.cloneBoardFrom(board.BoardName);
		board_copy.moveCaller("b4", "b5");
		board_copy.moveCaller("c4", "a3");
		board_copy.moveCaller("b5", "b6");
		board_copy.moveCaller("a3", "c2");
		
		if(IsepicChess.mapToBos(board_copy.legalMoves(board_copy.Active.kingPos)).join()!=="f1,d1"){
			error_msg="Error [35] whie king trying to castle being at check";
		}
	}
	
	if(!error_msg){
		board=IsepicChess.initBoard({
			name : board_name,
			fen : "8/1k1PPPPP/8/8/8/8/1K1ppppp/5R2 w - - 0 1",
			isHidden : true,
			promoteTo : 4,
			invalidFenStop : true
		});
		
		board.cloneBoardTo(board_copy.BoardName);
		board_copy.setPromoteTo("B");
		
		board.moveCaller("h7", "h8");
		
		if(board.getValue("h8")!==4){
			error_msg="Error [36] incorrect promotion to wr";
		}
	}
	
	if(!error_msg){
		board_copy.moveCaller("h7", "h8");
		
		if(board_copy.getValue("h8")!==3){
			error_msg="Error [37] failed to setPromoteTo()";
		}
	}
	
	if(!error_msg){
		board_copy.moveCaller("e2", "f1");
		
		if(board_copy.getValue("f1")!==-3){
			error_msg="Error [38] wrong promotion color";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.isLegalMove("8/8/1k6/8/2pP4/8/8/6BK b - d3 0 1", "c4", "d3")){
			error_msg="Error [39] taking enpassant results in self check";
		}
	}
	
	if(!error_msg){
		if(!IsepicChess.isLegalMove("8/8/8/3k4/3pP3/8/8/7K b - e3 0 1", "d4", "e3")){
			error_msg="Error [40] missing option to remove check via enpassant";
		}
	}
	
	if(!error_msg){
		board=IsepicChess.initBoard({
			name : board_name,
			fen : "8/8/7k/6pP/5BKR/8/8/8 w - g6 0 1",
			isHidden : true,
			invalidFenStop : true
		});
		
		board.moveCaller("h5", "g6");
		
		if(board.countChecks()!==2){
			error_msg="Error [41] wrong double check to enpassant capture";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.toPos("A1").join()!=="7,0"){
			error_msg="Error [42] failed to qos.toLowerCase() in toBos()";
		}
	}
	
	if(!error_msg){
		board=IsepicChess.initBoard({
			name : board_name,
			fen : "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
			isHidden : true,
			invalidFenStop : true
		});
		
		if(board===null){
			error_msg="Error [43] failed to initBoard("+board_name+")";
		}
	}
	
	if(!error_msg){
		if(board.boardHash()!==-1421636911){
			error_msg="Error [44] wrong hash for default fen (+ isHidden prop)";
		}
	}
	
	if(!error_msg){
		board.moveCaller("a2", "a4");
		
		if(board.boardHash()!==741762933){
			error_msg="Error [45] wrong hash for board after a2-a4";
		}
	}
	
	if(!error_msg){
		IsepicChess.cloneBoard(board_copy.BoardName, board.BoardName);
		
		if(!board.isEqualBoard(board_copy_name)){
			error_msg="Error [46] wrong equal hashes";
		}
	}
	
	if(!error_msg){
		if(!IsepicChess.isEqualBoard(board.BoardName, board.BoardName)){
			error_msg="Error [47] board not showing positive equality to itself";
		}
	}
	
	if(!error_msg){
		if(!IsepicChess.isEqualBoard(board.BoardName, board_copy.BoardName)){
			error_msg="Error [48] two equal boards not showing positive equality";
		}
	}
	
	if(!error_msg){
		board.moveCaller("a7", "a6");
		
		if(IsepicChess.isEqualBoard(board.BoardName, board_copy.BoardName)){
			error_msg="Error [49] different boards returning positive equality";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.toPieceClass("b")!=="bb"){
			error_msg="Error [50] toPieceClass() b !== bb";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.toPieceClass("K")!=="wk"){
			error_msg="Error [51] toPieceClass() K !== wk";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.toPieceClass("*")!==""){
			error_msg="Error [52] toPieceClass() * !== empty_string";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.toPieceClass(-5)!=="bq"){
			error_msg="Error [53] toPieceClass() -5 !== bq";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.toPieceClass("err")!==""){
			error_msg="Error [54] toPieceClass() err !== empty_string";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.toPieceClass(99)!=="wk"){
			error_msg="Error [55] toPieceClass() 99 !== wk";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.toPieceClass(-99)!=="bk"){
			error_msg="Error [56] toPieceClass() -99 !== bk";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.toVal("b")!==-3){
			error_msg="Error [57] toVal() b !== -3";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.toVal("K")!==6){
			error_msg="Error [58] toVal() K !== 6";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.toVal("*")!==0){
			error_msg="Error [59] toVal() * !== 0";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.toVal(-5)!==-5){
			error_msg="Error [60] toVal() -5 !== -5";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.toVal("err")!==0){
			error_msg="Error [61] toVal() err !== 0";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.toVal(99)!==6){
			error_msg="Error [62] toVal() 99 !== 6";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.toVal(-99)!==-6){
			error_msg="Error [63] toVal() -99 !== -6";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.toAbsVal("b")!==3){
			error_msg="Error [64] toAbsVal() b !== 3";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.toAbsVal("K")!==6){
			error_msg="Error [65] toAbsVal() K !== 6";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.toAbsVal("*")!==0){
			error_msg="Error [66] toAbsVal() * !== 0";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.toAbsVal(-5)!==5){
			error_msg="Error [67] toAbsVal() -5 !== 5";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.toAbsVal("err")!==0){
			error_msg="Error [68] toAbsVal() err !== 0";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.toAbsVal(99)!==6){
			error_msg="Error [69] toAbsVal() 99 !== 6";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.toAbsVal(-99)!==6){
			error_msg="Error [70] toAbsVal() -99 !== 6";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.toBal(-3)!=="b"){
			error_msg="Error [71] toBal() -3 !== b";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.toBal(6)!=="K"){
			error_msg="Error [72] toBal() 6 !== K";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.toBal(0)!=="*"){
			error_msg="Error [73] toBal() 0 !== *";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.toBal("q")!=="q"){
			error_msg="Error [74] toBal() q !== q";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.toBal("err")!=="*"){
			error_msg="Error [75] toBal() err !== *";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.toBal(99)!=="K"){
			error_msg="Error [76] toBal() 99 !== K";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.toBal(-99)!=="k"){
			error_msg="Error [77] toBal() -99 !== k";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.toAbsBal(-3)!=="B"){
			error_msg="Error [78] toAbsBal() -3 !== B";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.toAbsBal(6)!=="K"){
			error_msg="Error [79] toAbsBal() 6 !== K";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.toAbsBal(0)!=="*"){
			error_msg="Error [80] toAbsBal() 0 !== *";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.toAbsBal("q")!=="Q"){
			error_msg="Error [81] toAbsBal() q !== Q";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.toAbsBal("err")!=="*"){
			error_msg="Error [82] toAbsBal() err !== *";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.toAbsBal(99)!=="K"){
			error_msg="Error [83] toAbsBal() 99 !== K";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.toAbsBal(-99)!=="K"){
			error_msg="Error [84] toAbsBal() -99 !== K";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.toBos([7, 0])!=="a1"){
			error_msg="Error [85] toBos() [7, 0] !== a1";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.toBos([0, 0])!=="a8"){
			error_msg="Error [86] toBos() [0, 0] !== a8";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.toBos([7, 7])!=="h1"){
			error_msg="Error [87] toBos() [7, 7] !== h1";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.toBos([0, 7])!=="h8"){
			error_msg="Error [88] toBos() [0, 7] !== h8";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.toBos("B2")!=="b2"){
			error_msg="Error [89] toBos() B2 !== b2";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.toPos("a1").join()!=="7,0"){
			error_msg="Error [90] toPos() a1 !== [7, 0]";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.toPos("a8").join()!=="0,0"){
			error_msg="Error [91] toPos() a8 !== [0, 0]";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.toPos("h1").join()!=="7,7"){
			error_msg="Error [92] toPos() h1 !== [7, 7]";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.toPos("h8").join()!=="0,7"){
			error_msg="Error [93] toPos() h8 !== [0, 7]";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.toPos([6, 1]).join()!=="6,1"){
			error_msg="Error [94] toPos() [6, 1] !== [6, 1]";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.getSign("q")!==-1){
			error_msg="Error [95] getSign() q !== -1";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.getSign("Q")!==1){
			error_msg="Error [96] getSign() Q !== 1";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.getSign(true)!==-1){
			error_msg="Error [97] getSign() true !== -1";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.getSign(false)!==1){
			error_msg="Error [98] getSign() false !== 1";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.getSign("err")!==-1){
			error_msg="Error [99] getSign() err !== -1";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.toVal(-0)!==0){
			error_msg="Error [100] toVal() -0 !== 0";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.toAbsVal(-0)!==0){
			error_msg="Error [101] toAbsVal() -0 !== 0";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.toAbsBal("")!==IsepicChess.toBal("").toUpperCase()){
			error_msg="Error [102] toAbsBal() !== toBal().toUpperCase()";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.toAbsBal("r")!==IsepicChess.toBal("r").toUpperCase()){
			error_msg="Error [103] toAbsBal() !== toBal().toUpperCase()";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.getRankPos("a1")!==7){
			error_msg="Error [104] getRankPos() a1 !== 7";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.getRankPos("a8")!==0){
			error_msg="Error [105] getRankPos() a8 !== 0";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.getRankPos("h1")!==7){
			error_msg="Error [106] getRankPos() h1 !== 7";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.getRankPos("h8")!==0){
			error_msg="Error [107] getRankPos() h8 !== 0";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.getRankPos([3, 6])!==3){
			error_msg="Error [108] getRankPos() [3, 6] !== 3";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.getRankPos([6, 3])!==6){
			error_msg="Error [109] getRankPos() [6, 3] !== 6";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.getFilePos("a1")!==0){
			error_msg="Error [110] getFilePos() a1 !== 0";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.getFilePos("a8")!==0){
			error_msg="Error [111] getFilePos() a8 !== 0";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.getFilePos("h1")!==7){
			error_msg="Error [112] getFilePos() h1 !== 7";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.getFilePos("h8")!==7){
			error_msg="Error [113] getFilePos() h8 !== 7";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.getFilePos([3, 6])!==6){
			error_msg="Error [114] getFilePos() [3, 6] !== 6";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.getFilePos([6, 3])!==3){
			error_msg="Error [115] getFilePos() [6, 3] !== 3";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.getRankBos("a1")!=="1"){
			error_msg="Error [116] getRankBos() a1 !== 1";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.getRankBos("a8")!=="8"){
			error_msg="Error [117] getRankBos() a8 !== 8";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.getRankBos("h1")!=="1"){
			error_msg="Error [118] getRankBos() h1 !== 1";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.getRankBos("h8")!=="8"){
			error_msg="Error [119] getRankBos() h8 !== 8";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.getRankBos([3, 6])!=="5"){
			error_msg="Error [120] getRankBos() [3, 6] !== 5";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.getRankBos([6, 3])!=="2"){
			error_msg="Error [121] getRankBos() [6, 3] !== 2";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.getFileBos("a1")!=="a"){
			error_msg="Error [122] getFileBos() a1 !== a";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.getFileBos("a8")!=="a"){
			error_msg="Error [123] getFileBos() a8 !== a";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.getFileBos("h1")!=="h"){
			error_msg="Error [124] getFileBos() h1 !== h";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.getFileBos("h8")!=="h"){
			error_msg="Error [125] getFileBos() h8 !== h";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.getFileBos([3, 6])!=="g"){
			error_msg="Error [126] getFileBos() [3, 6] !== g";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.getFileBos([6, 3])!=="d"){
			error_msg="Error [127] getFileBos() [6, 3] !== d";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.isInsideBoard("a1")!==true){
			error_msg="Error [128] isInsideBoard() a1 !== true";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.isInsideBoard("a9")!==false){
			error_msg="Error [129] isInsideBoard() a9 !== false";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.isInsideBoard("i3")!==false){
			error_msg="Error [130] isInsideBoard() i3 !== false";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.isInsideBoard([7, 7])!==true){
			error_msg="Error [131] isInsideBoard() [7, 7] !== true";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.isInsideBoard([8, 8])!==false){
			error_msg="Error [132] isInsideBoard() [8, 8] !== false";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.sameSquare("a1", "a1")!==true){
			error_msg="Error [133] sameSquare() a1, a1 !== true";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.sameSquare("d2", [6, 3])!==true){
			error_msg="Error [134] sameSquare() d2, [6, 3] !== true";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.sameSquare([4, 5], [5, 4])!==false){
			error_msg="Error [135] sameSquare() [4, 5], [5, 4] !== false";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.countChecks("8/k7/r7/8/8/2b5/8/K7 w - - 0 1")!==2){
			error_msg="Error [136] countChecks() [8/k7/r7/8/8/2b5/8/K7 w - - 0 1] !== 2";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.countChecks("8/kB4p1/8/2N2P2/8/8/8/K7 b - - 0 1")!==0){
			error_msg="Error [137] countChecks() [8/kB4p1/8/2N2P2/8/8/8/K7 b - - 0 1] !== 0";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.countChecks("r3k2r/8/8/8/8/3b4/8/R3K2R w KQkq - 0 1", "f1")!==1){
			error_msg="Error [138] countChecks() [r3k2r/8/8/8/8/3b4/8/R3K2R w KQkq - 0 1, f1] !== 1";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.countChecks("0invalidfen0")!==0){
			error_msg="Error [139] countChecks() [0invalidfen0] !== 0";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.isCheck("8/k7/r7/8/8/2b5/8/K7 w - - 0 1")!==true){
			error_msg="Error [140] isCheck() [8/k7/r7/8/8/2b5/8/K7 w - - 0 1] !== true";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.isCheck("8/kB4p1/8/2N2P2/8/8/8/K7 b - - 0 1")!==false){
			error_msg="Error [141] isCheck() [8/kB4p1/8/2N2P2/8/8/8/K7 b - - 0 1] !== false";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.isCheck("r3k2r/8/8/8/8/3b4/8/R3K2R w KQkq - 0 1", "f1")!==true){
			error_msg="Error [142] isCheck() [r3k2r/8/8/8/8/3b4/8/R3K2R w KQkq - 0 1, f1] !== true";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.isCheck("0invalidfen0")!==0){//this is subject to change
			error_msg="Error [143] isCheck() [0invalidfen0] !== 0";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.mapToBos(IsepicChess.legalMoves("8/8/8/4k3/8/8/r1R1K3/8 w - - 0 1", "c2")).join()!=="b2,a2,d2"){
			error_msg="Error [144] legalMoves() [8/8/8/4k3/8/8/r1R1K3/8 w - - 0 1, c2] !== b2,a2,d2";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.mapToBos(IsepicChess.legalMoves("8/8/8/4k3/8/8/r1R1K3/8 w - - 0 1", "a2")).join()!==""){
			error_msg="Error [145] legalMoves() [8/8/8/4k3/8/8/r1R1K3/8 w - - 0 1, a2] !== empty_string";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.mapToBos(IsepicChess.legalMoves("0invalidfen0", "a1")).join()!==""){
			error_msg="Error [146] legalMoves() [0invalidfen0] !== empty_string";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.isLegalMove("8/8/8/4k3/8/8/r1R1K3/8 w - - 0 1", "c2", "a2")!==true){
			error_msg="Error [147] isLegalMove() [8/8/8/4k3/8/8/r1R1K3/8 w - - 0 1, c2, a2] !== true";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.isLegalMove("8/8/8/4k3/8/8/r1R1K3/8 w - - 0 1", "a2", "c2")!==false){
			error_msg="Error [148] isLegalMove() [8/8/8/4k3/8/8/r1R1K3/8 w - - 0 1, a2, c2] !== false";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.isLegalMove("0invalidfen0", "a1", "a2")!==false){
			error_msg="Error [149] isLegalMove() [0invalidfen0, a1, a2] !== false";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.isLegalFen("8/8/8/8/8/1k6/8/1K1r4 w - - 0 1")!==true){
			error_msg="Error [150] isLegalFen() [8/8/8/8/8/1k6/8/1K1r4 w - - 0 1] !== true";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.isLegalFen("0invalidfen0")!==false){
			error_msg="Error [151] isLegalFen() [0invalidfen0] !== false";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.isLegalFen("rnbqkbnr/pppppppp/8/8/8/1P6/1PPPPPPP/RNBQKBNR w KQkq - 0 1")!==false){
			error_msg="Error [152] isLegalFen() [rnbqkbnr/pppppppp/8/8/8/1P6/1PPPPPPP/RNBQKBNR w KQkq - 0 1] !== false";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.isCheckmate("8/8/8/4b3/8/1k6/1B6/K1r5 w - - 0 1")!==true){
			error_msg="Error [153] isCheckmate() [8/8/8/4b3/8/1k6/1B6/K1r5 w - - 0 1] !== true";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.isCheckmate("8/8/8/8/8/1k6/1B6/K1r5 w - - 0 1")!==false){
			error_msg="Error [154] isCheckmate() [8/8/8/8/8/1k6/1B6/K1r5 w - - 0 1] !== false";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.isCheckmate("0invalidfen0")!==false){
			error_msg="Error [155] isCheckmate() [0invalidfen0] !== false";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.isStalemate("8/8/8/8/8/1k6/1r6/K7 w - - 0 1")!==true){
			error_msg="Error [156] isStalemate() [8/8/8/8/8/1k6/1r6/K7 w - - 0 1] !== true";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.isStalemate("8/8/8/4B3/8/1k6/1r6/K7 w - - 0 1")!==false){
			error_msg="Error [157] isStalemate() [8/8/8/4B3/8/1k6/1r6/K7 w - - 0 1] !== false";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.isStalemate("0invalidfen0")!==false){
			error_msg="Error [158] isStalemate() [0invalidfen0] !== false";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.mapToBos([[0, 7], [2, 2]]).join()!=="h8,c6"){
			error_msg="Error [159] mapToBos() [[0, 7], [2, 2]] !== h8,c6";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.mapToBos([[1, 1], "a2"]).join()!=="b7,a2"){
			error_msg="Error [160] mapToBos() [[1, 1], a2] !== b7,a2";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.mapToBos("err").join()!==""){
			error_msg="Error [161] mapToBos() [err] !== empty_array";
		}
	}
	
	if(IsepicChess.selectBoard(board_name)!==null){
		IsepicChess.removeBoard(board_name);
	}
	
	if(IsepicChess.selectBoard(board_copy_name)!==null){
		IsepicChess.removeBoard(board_copy_name);
	}
	
	end_time=new Date().getTime();
	
	/*ver que PGNmove de checkmate sea # + lo de PGNend stalemate, win, etc*/
	
	return {
		testName : "testBasicFunctionality()",
		result : (error_msg || "Ok"),
		elapsedTime : ((end_time-start_time)+" ms"),
		passed : !error_msg
	};
}

function testFenPositions(){
	var i, len, invalid_positions, start_time, end_time, error_msg;
	
	error_msg="";
	
	invalid_positions=["",
	"hi",
	"8/rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
	"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR x KQkq - 0 1",
	"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KkQq - 0 1",
	"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w kqKQ - 0 1",
	"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w Kqky - 0 1",
	"rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e4 0 1",
	"rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e9 0 1",
	"rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq x5 0 1",
	"rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNRw KQkq - 0 1",
	"rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR wKQkq - 0 1",
	"rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq- 0 1",
	"8/8/8/8/8/8/8/8 b - - 0 1",
	"8/7k/8/8/8/8/8/8 b - - 0 1",
	"8/7K/8/8/8/8/8/8 b - - 0 1",
	"8/K6K/8/8/8/7k/8/8 b - - 0 1",
	"8/k6k/8/8/8/7K/8/8 b - - 0 1",
	"P7/8/7K/8/8/7k/8/8 b - - 0 1",
	"p7/8/7K/8/8/7k/8/8 b - - 0 1",
	"8/8/7K/8/8/7k/8/p7 b - - 0 1",
	"8/8/7K/8/8/7k/8/P7 b - - 0 1",
	"p7/8/7K/8/8/7k/8/P7 b - - 0 1",
	"P7/8/7K/8/8/7k/8/p7 b - - 0 1",
	"8/8/61K/8/8/7k/8/8 b - - 0 1",
	"8/8/K32P1/8/8/7k/8/8 b - - 0 1",
	"8/8/1K51/8/8/7k/8/8 b - - 0 1",
	"8/8/8K/8/8/7k/8/8 b - - 0 1",
	"8/8/K8/8/8/7k/8/8 b - - 0 1",
	"R7R/8/K7/8/8/7k/8/8 b - - 0 1",
	"rnbqkbnr/pppp1ppp/8/4p3/1P6/P7/1PPPPPPP/RNBQKBNR w KQkq - 0 1",
	"rnbqkbnr/pppp1ppp/8/4p3/1p6/P7/1PPPPPPP/RNBQKBNR w KQkq - 0 1",
	"rnbqkbnr/pppppppp/8/8/8/R7/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
	"rnbqkbnr/pppppppp/8/8/8/r7/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
	"rnbqkbnr/pppp1ppp/8/4p3/7B/P7/1PPPPPPP/RNBQKBNR w KQkq - 0 1",
	"rnbqkbnr/pppp1ppp/8/4p3/7b/P7/1PPPPPPP/RNBQKBNR w KQkq - 0 1",
	"rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPPNPPP/RNBQKBNR w KQkq - 0 1",
	"rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPPnPPP/RNBQKBNR w KQkq - 0 1",
	"rnbqkbnr/1ppppppp/p7/8/7Q/P7/1PPPPPPP/RNBQKBNR w KQkq - 0 1",
	"rnbqkbnr/1ppppppp/p7/8/7q/P7/1PPPPPPP/RNBQKBNR w KQkq - 0 1",
	"4k3/2pppppp/8/8/8/B7/BBBPPPPP/1B2KRRR w - - 0 1",
	"4k3/2pppppp/8/8/8/B7/BBBPPPPP/1B2KRQQ w - - 0 1",
	"rnbqkbnr/pppp1ppp/8/4p3/8/PP6/1NPRPPBR/RNBQKBNR w KQkq - 0 1",
	"8/8/4R3/2K5/3N2B1/8/4k3/8 b - - 0 1",
	"8/7q/8/1k1p4/4K3/6n1/8/8 w - - 0 1",
	"8/7q/5n2/1k1p4/4K3/6n1/8/4r3 w - - 0 1",
	"8/8/8/1K6/5k2/6P1/8/8 w - - 0 1",
	"8/8/8/1K6/1r3k2/8/8/8 b - - 0 1",
	"8/8/8/1K6/1r3k2/6P1/8/8 b - - 0 1",
	"8/8/8/1K6/1r3k2/6P1/8/8 w - - 0 1",
	"8/8/4N3/1K6/5k2/8/8/8 w - - 0 1",
	"8/8/4K3/4k3/8/8/8/8 w - - 0 1",
	"8/8/2K5/8/6P1/2k5/8/8 w - g3 0 1",
	"8/8/2K5/6p1/6P1/2k5/8/8 b - g6 0 1",
	"8/8/2K5/8/8/2k5/8/8 w - g6 0 1",
	"8/8/2K3N1/6p1/8/2k5/8/8 w - g6 0 1",
	"8/8/2K3N1/6p1/6P1/2k3n1/8/8 b - g3 0 1",
	"8/8/2K5/8/6p1/2k5/8/8 w - g3 0 1",
	"8/8/2K5/8/6p1/2k5/8/8 b - g3 0 1",
	"8/8/2K5/6P1/8/2k5/8/8 w - g6 0 1",
	"8/8/2K5/6P1/8/2k5/8/8 b - g6 0 1",
	"8/7P/2k4P/7P/7P/2K4P/7P/8 w - - 0 1",
	"8/P7/P1k5/P7/P7/P1K5/P7/8 w - - 0 1",
	"3knbnr/2pppppp/8/P7/P7/P3K3/P7/8 w - - 0 1",
	"8/7p/2k4p/7p/7p/7p/PPPPPP2/K7 w - - 0 1",
	"rnbq1rk1/ppppppbp/5np1/8/8/4P3/PPPPP1PP/4K3 w - - 0 1",
	"rnbq1rk1/1pppppbp/5np1/8/4P3/4P3/PPP1P1PP/4K3 w - - 0 1",
	"rnbq1rk1/3pppbp/5np1/4P3/4P3/4P3/PP2P1PP/4K3 w - - 0 1",
	"4K3/8/8/8/8/4k3/8/8 w KQ - 0 1",
	"8/4K3/8/8/8/8/8/4k3 w kq - 0 1",
	"8/8/2k5/8/8/8/8/4K2R w Q - 0 1",
	"8/8/2k5/8/8/8/8/r3K3 w K - 0 1",
	"8/8/2k5/8/8/8/8/4K3 w K - 0 1",
	"8/8/2k5/8/8/8/8/4K3 w Q - 0 1",
	"8/8/2k5/8/8/8/8/4K3 w KQ - 0 1",
	"4K3/8/2k5/8/8/8/8/R6R w KQ - 0 1",
	"r6r/8/8/8/2K5/8/8/4k3 w kq - 0 1",
	"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w - - 0 0",
	"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w - - 1 1",
	"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w - - 00 1",
	"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w - - 5 3",
	"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -0 1",
	"rnbqkb1r/pppppppp/8/8/3N1n2/8/PPPPPPPP/RNBQKB1R b KQkq - 8 4",
	"rnbqkb1r/pppppppp/8/5N2/5n2/8/PPPPPPPP/RNBQKB1R w KQkq - 7 4"];
	
	start_time=new Date().getTime();
	
	for(i=0, len=invalid_positions.length; i<len; i++){
		if(IsepicChess.isLegalFen(invalid_positions[i])){
			error_msg="Error ["+i+"] \""+invalid_positions[i]+"\" wasn't caught";
			break;
		}
	}
	
	end_time=new Date().getTime();
	
	return {
		testName : "testFenPositions()",
		result : (error_msg || "Ok"),
		elapsedTime : ((end_time-start_time)+" ms"),
		passed : !error_msg
	};
}

function testUtilityMisc(){
	var board, board_name, board_copy, board_copy_name, start_time, end_time, error_msg;
	
	error_msg="";
	board_name="board_testUtil";
	board_copy_name="board_testUtil_copy";
	start_time=new Date().getTime();
	
	//if(!error_msg){
		if(IsepicChess.utilityMisc.castlingChars(0)!==""){
			error_msg="Error [48] castlingChars[0]";
		}
	//}
	
	if(!error_msg){
		if(IsepicChess.utilityMisc.castlingChars(2)!=="q"){
			error_msg="Error [49] castlingChars[1]";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.utilityMisc.castlingChars(9)!=="kq"){
			error_msg="Error [50] castlingChars[2]";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.utilityMisc.castlingChars(-1)!==""){
			error_msg="Error [51] castlingChars[3]";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.utilityMisc.castlingChars("1")!=="k"){
			error_msg="Error [52] castlingChars[4]";
		}
	}
	
	if(!error_msg){
		board=IsepicChess.initBoard({
			name : board_name,
			fen : "r1bqkbnr/pppppppp/2n5/8/8/2N5/PPPPPPPP/R1BQKBNR w KQkq - 2 2"
		});
		
		if(board===null){
			error_msg="Error [53] failed to initBoard("+board_name+")";
		}
	}
	
	if(!error_msg){
		board_copy=IsepicChess.initBoard({
			name : board_copy_name
		});
		
		if(board_copy===null){
			error_msg="Error [54] failed to initBoard("+board_copy_name+")";
		}
	}
	
	if(!error_msg){
		board.moveCaller("c3", "e4");
		board_copy.moveCaller("g2", "g3");
		board_copy.moveCaller("h7", "h6");
		board_copy.moveCaller("f1", "g2");
		board_copy.moveCaller("h6", "h5");
		board_copy.moveCaller("g2", "e4");
		IsepicChess.utilityMisc.cloneBoardObjs(board_copy, board);
		
		if(board_copy.MoveList[1].PGNmove+!!board_copy.MoveList[2]+board_copy.Squares["e4"]!=="Ne4false2"){
			error_msg="Error [55] cloneBoardObjs[0]";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.utilityMisc.basicFenTest("").substring(0, 9)!=="Error [0]"){
			error_msg="Error [56] basicFenTest[0] empty string";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.utilityMisc.basicFenTest("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR x KQkq - 0 1").substring(0, 9)!=="Error [1]"){
			error_msg="Error [57] basicFenTest[1] color need to be w or b";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.utilityMisc.basicFenTest("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w kqkq - 0 1").substring(0, 9)!=="Error [1]"){
			error_msg="Error [58] basicFenTest[2] kqkq";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.utilityMisc.basicFenTest("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w kqKQ - 0 1").substring(0, 9)!=="Error [1]"){
			error_msg="Error [59] basicFenTest[3] kqKQ";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.utilityMisc.basicFenTest("rnbqkbnr/xppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w kqKQ - 0 1").substring(0, 9)!=="Error [1]"){
			error_msg="Error [60] basicFenTest[4] wrong piece char";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.utilityMisc.basicFenTest("pnbqkbnr/1ppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w kqKQ - 0 1").substring(0, 9)!=="Error [1]"){
			error_msg="Error [61] basicFenTest[5] pawn on 8th rank";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.utilityMisc.basicFenTest("rnbqkbnr/pppppppp/8/8/8/8/1PPPPPPP/PNBQKBNR w kqKQ - 0 1").substring(0, 9)!=="Error [1]"){
			error_msg="Error [62] basicFenTest[6] pawn on 1st rank";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.utilityMisc.basicFenTest("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w - a2 0 1").substring(0, 9)!=="Error [1]"){
			error_msg="Error [63] basicFenTest[7] bad enpassant square not caught";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.utilityMisc.basicFenTest("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 0").substring(0, 9)!=="Error [2]"){
			error_msg="Error [64] basicFenTest[8] full move at 0";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.utilityMisc.basicFenTest("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 01 1").substring(0, 9)!=="Error [2]"){
			error_msg="Error [65] basicFenTest[9] half move with 0X";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.utilityMisc.basicFenTest("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 2 02").substring(0, 9)!=="Error [2]"){
			error_msg="Error [66] basicFenTest[10] full move with 0X";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.utilityMisc.basicFenTest("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - a 1").substring(0, 9)!=="Error [2]"){
			error_msg="Error [67] basicFenTest[11] half move non numeric";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.utilityMisc.basicFenTest("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 1 a").substring(0, 9)!=="Error [2]"){
			error_msg="Error [68] basicFenTest[12] full move non numeric";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.utilityMisc.basicFenTest("rnbqkbnr/pppppppp/44/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1").substring(0, 9)!=="Error [3]"){
			error_msg="Error [69] basicFenTest[13] consecutive numbers";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.utilityMisc.basicFenTest("rnbqkbn1/ppppppppr/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1").substring(0, 9)!=="Error [4]"){
			error_msg="Error [70] basicFenTest[14] not exactly 8 columns (9)";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.utilityMisc.basicFenTest("rnbqkbn1/3r3/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1").substring(0, 9)!=="Error [4]"){
			error_msg="Error [71] basicFenTest[15] not exactly 8 columns (7)";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.utilityMisc.basicFenTest("k7/8/8/8/8/8/8/8 w KQkq - 0 1").substring(0, 9)!=="Error [5]"){
			error_msg="Error [72] basicFenTest[16] missing wk";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.utilityMisc.basicFenTest("K7/8/8/8/8/8/8/8 w KQkq - 0 1").substring(0, 9)!=="Error [5]"){
			error_msg="Error [73] basicFenTest[17] missing bk";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.utilityMisc.basicFenTest("k6k/8/8/8/8/8/8/K7 w KQkq - 0 1").substring(0, 9)!=="Error [5]"){
			error_msg="Error [74] basicFenTest[18] more than one bk";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.utilityMisc.basicFenTest("K6K/8/8/8/8/8/8/k7 w KQkq - 0 1").substring(0, 9)!=="Error [5]"){
			error_msg="Error [75] basicFenTest[19] more than one wk";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.utilityMisc.basicFenTest("rnbqkbnr/pppppppp/p7/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1").substring(0, 9)!=="Error [6]"){
			error_msg="Error [76] basicFenTest[20] more than 8 bp";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.utilityMisc.basicFenTest("rnbqkbnr/pppppppp/8/8/8/P7/PPPPPPPP/RNBQKBNR w KQkq - 0 1").substring(0, 9)!=="Error [6]"){
			error_msg="Error [77] basicFenTest[21] more than 8 wp";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.utilityMisc.basicFenTest("rrbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1").substring(0, 9)!=="Error [7]"){
			error_msg="Error [78] basicFenTest[22] more promoted pieces than possible (b)";
		}
	}
	
	if(!error_msg){
		if(IsepicChess.utilityMisc.basicFenTest("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBRR w KQkq - 0 1").substring(0, 9)!=="Error [7]"){
			error_msg="Error [79] basicFenTest[23] more promoted pieces than possible (w)";
		}
	}
	
	if(IsepicChess.selectBoard(board_name)!==null){
		IsepicChess.removeBoard(board_name);
	}
	
	if(IsepicChess.selectBoard(board_copy_name)!==null){
		IsepicChess.removeBoard(board_copy_name);
	}
	
	end_time=new Date().getTime();
	
	return {
		testName : "testUtilityMisc()",
		result : (error_msg || "Ok"),
		elapsedTime : ((end_time-start_time)+" ms"),
		passed : !error_msg
	};
}
