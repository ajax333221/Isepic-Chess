/** Copyright (c) 2021 Ajax Isepic (ajax333221) Licensed MIT */

/* jshint quotmark:double, undef:true, unused:true, jquery:false, curly:true, latedef:nofunc, bitwise:false, eqeqeq:true, esversion:9 */

/* globals exports, define */

(function(windw, expts, defin){
	var Ic=(function(_WIN){
		var _VERSION="6.5.1";
		
		var _SILENT_MODE=true;
		var _BOARDS={};
		
		var _EMPTY_SQR=0;
		var _PAWN=1;
		var _KNIGHT=2;
		var _BISHOP=3;
		var _ROOK=4;
		var _QUEEN=5;
		var _KING=6;
		
		var _DIRECTION_TOP=1;
		var _DIRECTION_TOP_RIGHT=2;
		var _DIRECTION_RIGHT=3;
		var _DIRECTION_BOTTOM_RIGHT=4;
		var _DIRECTION_BOTTOM=5;
		var _DIRECTION_BOTTOM_LEFT=6;
		var _DIRECTION_LEFT=7;
		var _DIRECTION_TOP_LEFT=8;
		
		var _SHORT_CASTLE=1;
		var _LONG_CASTLE=2;
		
		var _DEFAULT_FEN="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
		
		var _MUTABLE_KEYS=["w", "b", "activeColor", "nonActiveColor", "fen", "enPassantBos", "halfMove", "fullMove", "moveList", "currentMove", "isRotated", "checks", "isCheck", "isCheckmate", "isStalemate", "isThreefold", "isInsufficientMaterial", "isFiftyMove", "inDraw", "promoteTo", "manualResult", "isHidden", "legalUci", "legalUciTree", "squares"];
		
		//---------------- helpers
		
		function _promoteValHelper(qal){
			return _toInt((toAbsVal(qal) || _QUEEN), _KNIGHT, _QUEEN);
		}
		
		function _pgnResultHelper(str){
			var rtn;
			
			rtn="";
			
			str=(""+str).replace(/\s/g, "").replace(/o/gi, "0").replace(/½/g, "1/2");
			
			if(str==="*" || str==="1-0" || str==="0-1" || str==="1/2-1/2"){
				rtn=str;
			}
			
			return rtn;
		}
		
		function _strToValHelper(str){
			var temp, pc_exec, rtn;
			
			rtn=0;
			str=_trimSpaces(str);
			pc_exec=/^([wb])([pnbrqk])$/.exec(str.toLowerCase());
			
			if(!str){
				rtn=str;
			}else if(pc_exec){
				rtn=("*pnbrqk".indexOf(pc_exec[2])*getSign(pc_exec[1]==="b"));
			}else if(/^[pnbrqk]$/i.test(str)){
				temp=str.toLowerCase();
				rtn=(("pnbrqk".indexOf(temp)+1)*getSign(str===temp));
			}else if(_isIntOrStrInt(str)){
				rtn=str;
			}
			
			return _toInt(rtn, -_KING, _KING);//_toInt() removes sign on negative zero
		}
		
		function _strToBosHelper(str){
			var rtn;
			
			rtn=null;
			str=_trimSpaces(str);
			
			if(str && /^[a-h][1-8]$/i.test(str)){
				rtn=str.toLowerCase();
			}
			
			return rtn;
		}
		
		function _arrToPosHelper(arr){
			var rank_pos, file_pos, rtn;
			
			rtn=null;
			
			if(_isArray(arr) && arr.length===2){
				rank_pos=_toInt(arr[0]);
				file_pos=_toInt(arr[1]);
				
				if((rank_pos<=7 && rank_pos>=0) && (file_pos<=7 && file_pos>=0)){
					rtn=[rank_pos, file_pos];
				}
			}
			
			return rtn;
		}
		
		function _pgnParserHelper(str){
			var g, temp, rgxp, mtch, meta_tags, move_list, game_result, last_index, keep_going, rtn;
			
			rtn=null;
			keep_going=true;
			
			//if(keep_going){
				if(!_isNonBlankStr(str)){
					keep_going=false;
				}
			//}
			
			if(keep_going){
				meta_tags={};
				last_index=-1;
				rgxp=/\[\s*(\w+)\s+\"([^\"]*)\"\s*\]/g;
				
				str=str.replace(/“|”/g, "\"");
				
				while(mtch=rgxp.exec(str)){
					last_index=rgxp.lastIndex;
					
					meta_tags[_trimSpaces(mtch[1])]=_trimSpaces(mtch[2]);
				}
				
				if(last_index===-1){
					last_index=0;
				}
				
				g=(" "+_cleanSan(str.slice(last_index)));
				
				move_list=[];
				last_index=-1;
				rgxp=/\s+\d*\s*\.*\s*\.*\s*([^\s]+)/g;
				
				while(mtch=rgxp.exec(g)){
					last_index=rgxp.lastIndex;
					
					temp=mtch[0];
					move_list.push(mtch[1]);
				}
				
				if(last_index===-1){
					keep_going=false;
				}
			}
			
			if(keep_going){
				game_result="*";
				
				temp=_pgnResultHelper(temp);
				
				if(temp){
					move_list.pop();
					
					game_result=temp;
				}
				
				if(meta_tags.Result){
					temp=_pgnResultHelper(meta_tags.Result);
					
					if(temp){
						meta_tags.Result=temp;
						
						game_result=temp;
					}
				}
				
				rtn={
					tags : meta_tags,
					sanMoves : move_list,
					result : game_result
				};
			}
			
			return rtn;
		}
		
		function _uciParserHelper(str){
			var keep_going, rtn;
			
			rtn=null;
			keep_going=true;
			
			//if(keep_going){
				if(!_isNonBlankStr(str)){
					keep_going=false;
				}
			//}
			
			if(keep_going){
				str=_trimSpaces(str).replace(/[^a-h1-8 nrq]/gi, "").toLowerCase();
				
				if(!str){
					keep_going=false;
				}
			}
			
			if(keep_going){
				rtn=str.split(" ");
			}
			
			return rtn;
		}
		
		function _uciWrapmoveHelper(mov){
			var temp, possible_promote, keep_going, rtn;
			
			rtn=null;
			keep_going=true;
			
			//if(keep_going){
				if(!_isNonBlankStr(mov)){
					keep_going=false;
				}
			//}
			
			if(keep_going){
				mov=_trimSpaces(mov);
				
				if(mov.length!==4 && mov.length!==5){
					keep_going=false;
				}
			}
			
			if(keep_going){
				temp=_fromToWrapmoveHelper([mov.slice(0, 2), mov.slice(2, 4)]);
				
				if(temp===null){
					keep_going=false;
				}
			}
			
			if(keep_going){
				possible_promote=(mov.charAt(4) || "");
				
				rtn=[temp, possible_promote];
			}
			
			return rtn;
		}
		
		//p = {delimiter}
		function _joinedWrapmoveHelper(mov, p){
			var temp, keep_going, rtn;
			
			rtn=null;
			p=_unreferenceP(p);
			keep_going=true;
			
			//if(keep_going){
				p.delimiter=(_isNonEmptyStr(p.delimiter) ? p.delimiter : "-");
				p.delimiter=p.delimiter.charAt(0);
				
				if(!_isNonBlankStr(mov)){
					keep_going=false;
				}
			//}
			
			if(keep_going){
				mov=_trimSpaces(mov);
				
				if(mov.length!==5 || mov.charAt(2)!==p.delimiter){
					keep_going=false;
				}
			}
			
			if(keep_going){
				temp=_fromToWrapmoveHelper(mov.split(p.delimiter));
				
				if(temp===null){
					keep_going=false;
				}
			}
			
			if(keep_going){
				rtn=temp;
			}
			
			return rtn;
		}
		
		function _fromToWrapmoveHelper(mov){
			var keep_going, rtn;
			
			rtn=null;
			keep_going=true;
			
			//if(keep_going){
				if(!_isArray(mov) || mov.length!==2){
					keep_going=false;
				}
			//}
			
			if(keep_going){
				if(!isInsideBoard(mov[0]) || !isInsideBoard(mov[1])){
					keep_going=false;
				}
			}
			
			if(keep_going){
				rtn=[toBos(mov[0]), toBos(mov[1])];
			}
			
			return rtn;
		}
		
		function _moveWrapmoveHelper(mov){
			var possible_promote, keep_going, rtn;
			
			rtn=null;
			keep_going=true;
			
			//if(keep_going){
				if(!_isMove(mov)){
					keep_going=false;
				}
			//}
			
			if(keep_going){
				possible_promote=(mov.promotion || "");
				
				rtn=[[mov.fromBos, mov.toBos], possible_promote];
			}
			
			return rtn;
		}
		
		function _nullboardHelper(board_name){
			var i, j, temp, current_pos, current_bos, target;
			
			target=getBoard(board_name);
			
			if(target===null){
				_BOARDS[board_name]={
					boardName : board_name,
					getSquare : _getSquare,
					setSquare : _setSquare,
					countAttacks : _countAttacks,
					toggleActiveNonActive : _toggleActiveNonActive,
					toggleIsRotated : _toggleIsRotated,
					setPromoteTo : _setPromoteTo,
					setManualResult : _setManualResult,
					setCurrentMove : _setCurrentMove,
					readValidatedFen : _readValidatedFen,
					updateFenAndMisc : _updateFenAndMisc,
					refinedFenTest : _refinedFenTest,
					testCollision : _testCollision,
					isLegalMove : _isLegalMove,
					legalMovesHelper : _legalMovesHelper,
					legalMoves : _legalMoves,
					legalSanMoves : _legalSanMoves,
					legalUciMoves : _legalUciMoves,
					pgnExport : _pgnExport,
					uciExport : _uciExport,
					ascii : _ascii,
					boardHash : _boardHash,
					isEqualBoard : _isEqualBoard,
					cloneBoardFrom : _cloneBoardFrom,
					cloneBoardTo : _cloneBoardTo,
					countLightDarkBishops : _countLightDarkBishops,
					sanWrapmoveHelper : _sanWrapmoveHelper,
					getWrappedMove : _getWrappedMove,
					draftMove : _draftMove,
					playMove : _playMove,
					navFirst : _navFirst,
					navPrevious : _navPrevious,
					navNext : _navNext,
					navLast : _navLast,
					navLinkMove : _navLinkMove,
					refreshUi : _refreshUi
				};
				
				target=_BOARDS[board_name];
			}
			
			target.w={
				//static
				isBlack : false,
				sign : 1,
				firstRankPos : 7,
				secondRankPos : 6,
				lastRankPos : 0,
				singlePawnRankShift : -1,
				pawn : _PAWN,
				knight : _KNIGHT,
				bishop : _BISHOP,
				rook : _ROOK,
				queen : _QUEEN,
				king : _KING,
				
				//mutable
				kingBos : null,
				castling : null,
				materialDiff : null
			};
			
			target.b={
				//static
				isBlack : true,
				sign : -1,
				firstRankPos : 0,
				secondRankPos : 1,
				lastRankPos : 7,
				singlePawnRankShift : 1,
				pawn : -_PAWN,
				knight : -_KNIGHT,
				bishop : -_BISHOP,
				rook : -_ROOK,
				queen : -_QUEEN,
				king : -_KING,
				
				//mutable
				kingBos : null,
				castling : null,
				materialDiff : null
			};
			
			target.activeColor=null;
			target.nonActiveColor=null;
			target.fen=null;
			target.enPassantBos=null;
			target.halfMove=null;
			target.fullMove=null;
			target.moveList=null;
			target.currentMove=null;
			target.isRotated=null;
			target.checks=null;
			target.isCheck=null;
			target.isCheckmate=null;
			target.isStalemate=null;
			target.isThreefold=null;
			target.isInsufficientMaterial=null;
			target.isFiftyMove=null;
			target.inDraw=null;
			target.promoteTo=null;
			target.manualResult=null;
			target.isHidden=null;
			target.legalUci=null;
			target.legalUciTree=null;
			target.squares={};
			
			for(i=0; i<8; i++){//0...7
				for(j=0; j<8; j++){//0...7
					current_pos=[i, j];
					current_bos=toBos(current_pos);
					
					target.squares[current_bos]={};
					temp=target.squares[current_bos];
					
					//static
					temp.pos=current_pos;
					temp.bos=current_bos;
					temp.rankPos=getRankPos(current_pos);
					temp.filePos=getFilePos(current_pos);
					temp.rankBos=getRankBos(current_pos);
					temp.fileBos=getFileBos(current_pos);
					
					//mutable
					temp.bal=null;
					temp.absBal=null;
					temp.val=null;
					temp.absVal=null;
					temp.className=null;
					temp.sign=null;
					temp.isEmptySquare=null;
					temp.isPawn=null;
					temp.isKnight=null;
					temp.isBishop=null;
					temp.isRook=null;
					temp.isQueen=null;
					temp.isKing=null;
				}
			}
			
			return target;
		}
		
		//---------------- utilities
		
		function _consoleLog(msg){
			var rtn;
			
			rtn=false;
			
			if(!_SILENT_MODE){
				rtn=true;
				console.log(msg);
			}
			
			return rtn;
		}
		
		function _isObject(obj){
			return ((typeof obj)==="object" && obj!==null && !_isArray(obj));
		}
		
		function _isArray(arr){
			return (Object.prototype.toString.call(arr)==="[object Array]");
		}
		
		function _isSquare(obj){
			return (_isObject(obj) && (typeof obj.bos)==="string");
		}
		
		function _isBoard(obj){
			return (_isObject(obj) && (typeof obj.boardName)==="string");
		}
		
		function _isMove(obj){
			return (_isObject(obj) && (typeof obj.fromBos)==="string" && (typeof obj.toBos)==="string");
		}
		
		function _trimSpaces(str){
			return (""+str).replace(/^\s+|\s+$/g, "").replace(/\s\s+/g, " ");
		}
		
		function _formatName(str){
			return _trimSpaces(str).replace(/[^a-z0-9]/gi, "_").replace(/__+/g, "_");
		}
		
		function _strContains(str, str_to_find){
			return ((""+str).indexOf(str_to_find)!==-1);
		}
		
		function _occurrences(str, str_rgxp){
			var rtn;
			
			rtn=0;
			
			if(_isNonEmptyStr(str) && _isNonEmptyStr(str_rgxp)){
				rtn=(str.match(RegExp(str_rgxp, "g")) || []).length;
			}
			
			return rtn;
		}
		
		function _toInt(num, min_val, max_val){
			num=((num*1) || 0);
			num=(num<0 ? Math.ceil(num) : Math.floor(num));
			
			min_val*=1;
			max_val*=1;
			
			/*NO remove default 0, (-0 || 0) = 0*/
			min_val=((Number.isNaN(min_val) ? -Infinity : min_val) || 0);
			max_val=((Number.isNaN(max_val) ? Infinity : max_val) || 0);
			
			return Math.min(Math.max(num, min_val), max_val);
		}
		
		function _isIntOrStrInt(num){
			return ((""+_toInt(num))===(""+num));
		}
		
		function _isNonEmptyStr(val){
			return !!((typeof val)==="string" && val);
		}
		
		function _isNonBlankStr(val){
			return !!((typeof val)==="string" && _trimSpaces(val));
		}
		
		function _hashCode(val){
			var i, len, hash;
			
			hash=0;
			val=(_isNonEmptyStr(val) ? val : "");
			
			for(i=0, len=val.length; i<len; i++){//0<len
				hash=((hash<<5)-hash)+val.charCodeAt(i);
				hash|=0;//to 32bit integer
			}
			
			return hash;
		}
		
		function _castlingChars(num){
			return ["", "k", "q", "kq"][_toInt(num, 0, 3)];
		}
		
		function _unreferenceP(p, changes){
			var i, len, rtn;
			
			rtn=(_isObject(p) ? {...p} : {});
			
			if(_isArray(changes)){
				for(i=0, len=changes.length; i<len; i++){
					if(!_isArray(changes[i]) || changes[i].length!==2 || !_isNonBlankStr(changes[i][0])){
						_consoleLog("Error[_unreferenceP]: unexpected format");
						
						continue;
					}
					
					rtn[_trimSpaces(changes[i][0])]=changes[i][1];
				}
			}
			
			return rtn;
		}
		
		function _cleanSan(rtn){
			rtn=(_isNonBlankStr(rtn) ? rtn : "");
			
			if(rtn){
				while(rtn!==(rtn=rtn.replace(/\{[^{}]*\}/g, "\n")));/*to-do: keep comment*/
				while(rtn!==(rtn=rtn.replace(/\([^()]*\)/g, "\n")));
				while(rtn!==(rtn=rtn.replace(/\<[^<>]*\>/g, "\n")));
				
				rtn=rtn.replace(/(\t)|(\r?\n)|(\r\n?)/g, "\n");
				
				rtn=rtn.replace(/;+[^\n]*(\n|$)/g, "\n");/*to-do: keep comment*/
				
				rtn=rtn.replace(/^%.*\n?/gm, "").replace(/^\n+|\n+$/g, "").replace(/\n/g, " ");
				
				rtn=rtn.replace(/\$\d+/g, " ");/*to-do: keep NAG*/
				rtn=rtn.replace(/[^a-h0-8nrqkxo /½=-]/gi, "");//no planned support for P and e.p.
				rtn=rtn.replace(/\s*\-+\s*/g, "-");
				rtn=rtn.replace(/0-0-0/g, "w").replace(/0-0/g, "v");
				rtn=rtn.replace(/o-o-o/gi, "w").replace(/o-o/gi, "v");
				rtn=rtn.replace(/o/gi, "0").replace(/½/g, "1/2");
				rtn=rtn.replace(/1\-0/g, " i ").replace(/0\-1/g, " j ").replace(/1\/2\-1\/2/g, " z ");
				
				rtn=rtn.replace(/\-/g, " ");
				rtn=rtn.replace(/w/g, "O-O-O").replace(/v/g, "O-O");
				rtn=rtn.replace(/i/g, "1-0").replace(/j/g, "0-1").replace(/z/g, "1/2-1/2");
				
				rtn=_trimSpaces(rtn);
			}
			
			return rtn;
		}
		
		function _cloneBoardObjs(to_board, from_board){
			var i, j, k, len, len2, len3, current_key, current_sub_from, sub_keys, sub_sub_keys, to_prop, from_prop;
			
			if(to_board!==from_board){
				to_board.moveList=[];
				to_board.legalUci=[];
				to_board.legalUciTree={};
				
				for(i=0, len=_MUTABLE_KEYS.length; i<len; i++){//0<len
					current_key=_MUTABLE_KEYS[i];
					to_prop=to_board[current_key];
					from_prop=from_board[current_key];
					
					//primitive data type
					if(!_isObject(from_prop) && !_isArray(from_prop)){
						to_board[current_key]=from_board[current_key];//can't use to_prop, it's not a reference here
						
						continue;
					}
					
					if(current_key==="legalUci"){
						to_board.legalUci=from_board.legalUci.slice(0);
						
						continue;
					}
					
					if(current_key==="w" || current_key==="b"){
						//object or array data type
						to_prop.materialDiff=from_prop.materialDiff.slice(0);
						
						//primitive data type
						to_prop.kingBos=from_prop.kingBos;
						to_prop.castling=from_prop.castling;
						
						continue;
					}
					
					sub_keys=Object.keys(from_prop);
					
					for(j=0, len2=sub_keys.length; j<len2; j++){//0<len2
						current_sub_from=from_prop[sub_keys[j]];
						
						//primitive data type
						if(!_isObject(current_sub_from) && !_isArray(current_sub_from)){
							_consoleLog("Error[_cloneBoardObjs]: unexpected primitive data type");
							
							continue;
						}
						
						if(current_key==="legalUciTree"){
							//["legalUciTree"] object of (0-64), array of (0-N)
							
							to_prop[sub_keys[j]]=current_sub_from.slice(0);
							
							continue;
						}
						
						if(current_key==="squares"){
							//["squares"] object of (64), object of (6 static + 13 mutables = 19) Note: pos is array
							
							//object or array data type
							//(none)
							
							//primitive data type
							to_prop[sub_keys[j]].bal=current_sub_from.bal;
							to_prop[sub_keys[j]].absBal=current_sub_from.absBal;
							to_prop[sub_keys[j]].val=current_sub_from.val;
							to_prop[sub_keys[j]].absVal=current_sub_from.absVal;
							to_prop[sub_keys[j]].className=current_sub_from.className;
							to_prop[sub_keys[j]].sign=current_sub_from.sign;
							to_prop[sub_keys[j]].isEmptySquare=current_sub_from.isEmptySquare;
							to_prop[sub_keys[j]].isPawn=current_sub_from.isPawn;
							to_prop[sub_keys[j]].isKnight=current_sub_from.isKnight;
							to_prop[sub_keys[j]].isBishop=current_sub_from.isBishop;
							to_prop[sub_keys[j]].isRook=current_sub_from.isRook;
							to_prop[sub_keys[j]].isQueen=current_sub_from.isQueen;
							to_prop[sub_keys[j]].isKing=current_sub_from.isKing;
							
							continue;
						}
						
						sub_sub_keys=Object.keys(current_sub_from);
						
						if(current_key==="moveList"){
							to_prop[sub_keys[j]]={};
							
							/*NO put a "continue" in here*/
						}
						
						for(k=0, len3=sub_sub_keys.length; k<len3; k++){//0<len3
							//object or array data type
							if(_isObject(current_sub_from[sub_sub_keys[k]]) || _isArray(current_sub_from[sub_sub_keys[k]])){
								_consoleLog("Error[_cloneBoardObjs]: unexpected type in key \""+sub_sub_keys[k]+"\"");
								
								continue;
							}
							
							//primitive data type
							to_prop[sub_keys[j]][sub_sub_keys[k]]=current_sub_from[sub_sub_keys[k]];
						}
					}
				}
			}
		}
		
		function _basicFenTest(fen){
			var i, j, len, temp, optional_clocks, last_is_num, current_is_num, fen_board, fen_board_arr, total_files_in_current_rank, rtn_msg;
			
			rtn_msg="";
			
			//if(!rtn_msg){
				if(!_isNonBlankStr(fen)){
					rtn_msg="Error [0] falsy value after trim";
				}
			//}
			
			if(!rtn_msg){
				fen=_trimSpaces(fen);
				
				optional_clocks=fen.replace(/^([rnbqkRNBQK1-8]+\/)([rnbqkpRNBQKP1-8]+\/){6}([rnbqkRNBQK1-8]+)\s[bw]\s(-|K?Q?k?q?)\s(-|[a-h][36])($|\s)/, "");
				
				if(fen.length===optional_clocks.length){
					rtn_msg="Error [1] invalid fen structure";
				}
			}
			
			if(!rtn_msg){
				if(optional_clocks.length){
					if(!(/^(0|[1-9][0-9]*)\s([1-9][0-9]*)$/.test(optional_clocks))){
						rtn_msg="Error [2] invalid half/full move";
					}
				}
			}
			
			if(!rtn_msg){
				fen_board=fen.split(" ")[0];
				fen_board_arr=fen_board.split("/");
				
				outer:
				for(i=0; i<8; i++){//0...7
					total_files_in_current_rank=0;
					last_is_num=false;
					
					for(j=0, len=fen_board_arr[i].length; j<len; j++){//0<len
						temp=(fen_board_arr[i].charAt(j)*1);
						current_is_num=!!temp;
						
						if(last_is_num && current_is_num){
							rtn_msg="Error [3] two consecutive numeric values";
							break outer;
						}
						
						last_is_num=current_is_num;
						total_files_in_current_rank+=(temp || 1);
					}
					
					if(total_files_in_current_rank!==8){
						rtn_msg="Error [4] rank without exactly 8 columns";
						break;
					}
				}
			}
			
			if(!rtn_msg){
				if(_occurrences(fen_board, "K")!==1){
					rtn_msg="Error [5] board without exactly one white king";
				}
			}
			
			if(!rtn_msg){
				if(_occurrences(fen_board, "k")!==1){
					rtn_msg="Error [6] board without exactly one black king";
				}
			}
			
			return rtn_msg;
		}
		
		function _perft(woard, depth, ply, specific_uci){
			var i, len, board, count, keep_going, rtn;
			
			rtn=1;
			keep_going=true;
			
			//if(keep_going){
				if(depth<1){
					keep_going=false;
				}
			//}
			
			if(keep_going){
				board=getBoard(woard);
				
				if(board===null){
					keep_going=false;
				}
			}
			
			if(keep_going){
				count=0;
				
				for(i=0, len=board.legalUci.length; i<len; i++){//0<len
					if(specific_uci && specific_uci!==board.legalUci[i]){
						continue;
					}
					
					if(depth===1){
						count++;
					}else{
						board.playMove(board.legalUci[i], {isLegalMove : true});
						count+=_perft(board, (depth-1), (ply+1));
						board.navLinkMove(ply-1);
					}
				}
				
				rtn=count;
			}
			
			return rtn;
		}
		
		//---------------- board
		
		//p = {rankShift, fileShift, isUnreferenced}
		function _getSquare(qos, p){
			var that, temp_pos, pre_validated_pos, rtn;
			
			that=this;
			
			function _squareHelper(my_square, is_unreferenced){//uses: that
				var temp, rtn_square;
				
				rtn_square=my_square;
				
				if(is_unreferenced){
					temp={};
					
					temp.pos=toPos(my_square.pos);//unreference
					temp.bos=my_square.bos;
					temp.rankPos=getRankPos(my_square.pos);
					temp.filePos=getFilePos(my_square.pos);
					temp.rankBos=getRankBos(my_square.pos);
					temp.fileBos=getFileBos(my_square.pos);
					
					temp.bal=my_square.bal;
					temp.absBal=my_square.absBal;
					temp.val=my_square.val;
					temp.absVal=my_square.absVal;
					temp.className=my_square.className;
					temp.sign=my_square.sign;
					temp.isEmptySquare=my_square.isEmptySquare;
					temp.isPawn=my_square.isPawn;
					temp.isKnight=my_square.isKnight;
					temp.isBishop=my_square.isBishop;
					temp.isRook=my_square.isRook;
					temp.isQueen=my_square.isQueen;
					temp.isKing=my_square.isKing;
					
					rtn_square=temp;
				}
				
				return rtn_square;
			}
			
			rtn=null;
			p=_unreferenceP(p);
			temp_pos=toPos(qos);
			
			p.isUnreferenced=(p.isUnreferenced===true);
			
			if(temp_pos!==null){
				pre_validated_pos=[(temp_pos[0]+_toInt(p.rankShift)), (temp_pos[1]+_toInt(p.fileShift))];
				
				if(isInsideBoard(pre_validated_pos)){
					rtn=_squareHelper(that.squares[toBos(pre_validated_pos)], p.isUnreferenced);
				}
			}
			
			return rtn;
		}
		
		//p = {rankShift, fileShift}
		function _setSquare(qos, new_qal, p){
			var that, target_square, new_val, new_abs_val, rtn_set;
			
			that=this;
			
			rtn_set=false;
			target_square=that.getSquare(qos, _unreferenceP(p, [["isUnreferenced", false]]));
			
			if(target_square!==null){
				rtn_set=true;
				
				new_val=toVal(new_qal);
				new_abs_val=toAbsVal(new_val);
				
				target_square.bal=toBal(new_val);
				target_square.absBal=toAbsBal(new_val);
				target_square.val=new_val;
				target_square.absVal=new_abs_val;
				target_square.className=toClassName(new_val);
				target_square.sign=getSign(new_val);
				target_square.isEmptySquare=(new_abs_val===_EMPTY_SQR);
				target_square.isPawn=(new_abs_val===_PAWN);
				target_square.isKnight=(new_abs_val===_KNIGHT);
				target_square.isBishop=(new_abs_val===_BISHOP);
				target_square.isRook=(new_abs_val===_ROOK);
				target_square.isQueen=(new_abs_val===_QUEEN);
				target_square.isKing=(new_abs_val===_KING);
			}
			
			return rtn_set;
		}
		
		function _countAttacks(target_qos, early_break){
			var i, j, that, as_knight, active_side, rtn_total_checks;
			
			that=this;
			
			function _isAttacked(qos, piece_direction, as_knight){//uses: that
				return that.testCollision(2, qos, piece_direction, as_knight, null, null, null).isAttacked;
			}
			
			rtn_total_checks=0;
			
			active_side=that[that.activeColor];
			target_qos=(target_qos || active_side.kingBos);
			
			outer:
			for(i=0; i<2; i++){//0...1
				as_knight=!!i;
				
				for(j=1; j<9; j++){//1...8
					if(_isAttacked(target_qos, j, as_knight)){
						rtn_total_checks++;
						
						if(early_break){
							break outer;
						}
					}
				}
			}
			
			return rtn_total_checks;
		}
		
		function _toggleActiveNonActive(new_active){
			var that, temp, rtn_changed;
			
			that=this;
			
			rtn_changed=false;
			temp=((typeof new_active)==="boolean" ? new_active : !that[that.activeColor].isBlack);
			
			if((temp ? "b" : "w")!==that.activeColor || (!temp ? "b" : "w")!==that.nonActiveColor){
				rtn_changed=true;
				
				that.activeColor=(temp ? "b" : "w");
				that.nonActiveColor=(!temp ? "b" : "w");
			}
			
			return rtn_changed;
		}
		
		function _toggleIsRotated(new_is_rotated){
			var that, temp, rtn_changed;
			
			that=this;
			
			rtn_changed=false;
			temp=((typeof new_is_rotated)==="boolean" ? new_is_rotated : !that.isRotated);
			
			if(temp!==that.isRotated){
				rtn_changed=true;
				
				that.isRotated=temp;
				
				that.refreshUi(0);//autorefresh
			}
			
			return rtn_changed;
		}
		
		function _setPromoteTo(qal){
			var that, temp, rtn_changed;
			
			that=this;
			
			rtn_changed=false;
			temp=_promoteValHelper(qal);
			
			if(temp!==that.promoteTo){
				rtn_changed=true;
				
				that.promoteTo=temp;
				
				that.refreshUi(0);//autorefresh
			}
			
			return rtn_changed;
		}
		
		function _setManualResult(str){
			var that, temp, rtn_changed;
			
			that=this;
			
			rtn_changed=false;
			temp=(_pgnResultHelper(str) || "*");
			
			if(temp!==that.manualResult){
				rtn_changed=true;
				
				that.manualResult=temp;
				
				that.refreshUi(0);//autorefresh
			}
			
			return rtn_changed;
		}
		
		function _setCurrentMove(num, is_goto){
			var len, that, temp, diff, keep_going, rtn_changed;
			
			that=this;
			
			rtn_changed=false;
			keep_going=true;
			
			//if(keep_going){
				len=that.moveList.length;
				
				if(len<2){
					keep_going=false;
				}
			//}
			
			if(keep_going){
				if((typeof is_goto)!=="boolean"){
					num=_toInt(num, 0, (len-1));
					diff=(num-that.currentMove);
					is_goto=(Math.abs(diff)!==1);
					
					num=(is_goto ? num : diff);
				}
				
				num=_toInt(num);
				
				temp=_toInt((is_goto ? num : (num+that.currentMove)), 0, (len-1));
				
				if(temp===that.currentMove){
					keep_going=false;
				}
			}
			
			if(keep_going){
				rtn_changed=true;
				
				that.currentMove=temp;
				that.readValidatedFen(that.moveList[temp].fen);
				
				that.refreshUi(is_goto ? 0 : num);//autorefresh
			}
			
			return rtn_changed;
		}
		
		function _navFirst(){
			var that;
			
			that=this;
			
			return that.setCurrentMove(0);//autorefresh (sometimes)
		}
		
		function _navPrevious(){
			var that;
			
			that=this;
			
			return that.setCurrentMove(that.currentMove-1);//autorefresh (sometimes)
		}
		
		function _navNext(){
			var that;
			
			that=this;
			
			return that.setCurrentMove(that.currentMove+1);//autorefresh (sometimes)
		}
		
		function _navLast(){
			var that;
			
			that=this;
			
			return that.setCurrentMove(that.moveList.length-1);//autorefresh (sometimes)
		}
		
		function _navLinkMove(move_index){
			var that;
			
			that=this;
			
			return that.setCurrentMove(move_index);//autorefresh (sometimes)
		}
		
		function _readValidatedFen(fen){
			var i, j, len, that, fen_parts, current_file, current_char, fen_board_arr, skip_files;
			
			that=this;
			
			for(i=0; i<8; i++){//0...7
				for(j=0; j<8; j++){//0...7
					that.setSquare([i, j], _EMPTY_SQR);
				}
			}
			
			fen=_trimSpaces(fen);
			
			fen_parts=fen.split(" ");
			fen_board_arr=fen_parts[0].split("/");
			
			for(i=0; i<8; i++){//0...7
				current_file=0;
				
				for(j=0, len=fen_board_arr[i].length; j<len; j++){//0<len
					current_char=fen_board_arr[i].charAt(j);
					skip_files=(current_char*1);
					
					if(!skip_files){
						that.setSquare([i, current_file], current_char);
					}
					
					current_file+=(skip_files || 1);
				}
			}
			
			that.w.castling=((_strContains(fen_parts[2], "K") ? _SHORT_CASTLE : 0)+(_strContains(fen_parts[2], "Q") ? _LONG_CASTLE : 0));
			that.b.castling=((_strContains(fen_parts[2], "k") ? _SHORT_CASTLE : 0)+(_strContains(fen_parts[2], "q") ? _LONG_CASTLE : 0));
			
			that.enPassantBos=fen_parts[3].replace("-", "");
			
			that.toggleActiveNonActive(fen_parts[1]==="b");
			
			that.halfMove=((fen_parts[4]*1) || 0);
			that.fullMove=((fen_parts[5]*1) || 1);
			
			that.updateFenAndMisc();
		}
		
		function _updateFenAndMisc(){
			var i, j, k, len, that, temp, current_square, current_diff, total_pieces, consecutive_empty_squares, new_fen_board, clockless_fen, times_found, bishop_count, at_least_one_light, at_least_one_dark, current_side;
			
			that=this;
			
			new_fen_board="";
			
			for(i=0; i<8; i++){//0...7
				consecutive_empty_squares=0;
				
				for(j=0; j<8; j++){//0...7
					current_square=that.getSquare([i, j]);
					
					if(!current_square.isEmptySquare){
						if(current_square.isKing){
							current_side=(current_square.sign===that[that.activeColor].sign ? that[that.activeColor] : that[that.nonActiveColor]);
							
							current_side.kingBos=current_square.bos;
						}
						
						new_fen_board+=((consecutive_empty_squares || "")+current_square.bal);
						consecutive_empty_squares=-1;
					}
					
					consecutive_empty_squares++;
				}
				
				new_fen_board+=((consecutive_empty_squares || "")+(i!==7 ? "/" : ""));
			}
			
			that.checks=that.countAttacks(null);
			that.isCheck=!!that.checks;/*NO move below legalMovesHelper()*/
			
			that.legalUci=[];
			that.legalUciTree={};
			
			for(i=0; i<8; i++){//0...7
				for(j=0; j<8; j++){//0...7
					temp=that.legalMovesHelper([i, j]).uciMoves;
					
					if(!temp.length){
						continue;
					}
					
					that.legalUciTree[toBos([i, j])]=temp.slice(0);
					
					for(k=0, len=temp.length; k<len; k++){//0<len
						that.legalUci.push(temp[k]);
					}
				}
			}
			
			that.isCheckmate=(that.isCheck && !that.legalUci.length);
			that.isStalemate=(!that.isCheck && !that.legalUci.length);
			
			clockless_fen=(new_fen_board+" "+that.activeColor+" "+((_castlingChars(that.w.castling).toUpperCase()+""+_castlingChars(that.b.castling)) || "-")+" "+(that.enPassantBos || "-"));
			
			that.fen=(clockless_fen+" "+that.halfMove+" "+that.fullMove);
			
			that.isThreefold=false;
			
			if(that.currentMove>7 && that.halfMove>7){
				times_found=1;
				
				for(i=(that.currentMove-1); i>=0; i--){//(len-1)...0
					temp=that.moveList[i].fen.split(" ");
					
					if(temp.slice(0, 4).join(" ")===clockless_fen){
						times_found++;
						
						if(times_found>2){
							that.isThreefold=true;
							break;
						}
					}
					
					if(temp[4]==="0"){
						break;
					}
				}
			}
			
			total_pieces=countPieces(clockless_fen);
			that.isInsufficientMaterial=false;
			
			if(!(total_pieces.w.p+total_pieces.b.p+total_pieces.w.r+total_pieces.b.r+total_pieces.w.q+total_pieces.b.q)){
				if(total_pieces.w.n+total_pieces.b.n){
					that.isInsufficientMaterial=((total_pieces.w.n+total_pieces.b.n+total_pieces.w.b+total_pieces.b.b)===1);//k vs kn
				}else if(total_pieces.w.b+total_pieces.b.b){
					bishop_count=that.countLightDarkBishops();
					
					at_least_one_light=!!(bishop_count.w.lightSquaredBishops+bishop_count.b.lightSquaredBishops);
					at_least_one_dark=!!(bishop_count.w.darkSquaredBishops+bishop_count.b.darkSquaredBishops);
					
					that.isInsufficientMaterial=(at_least_one_light!==at_least_one_dark);//k(b*x) vs k(b*x)
				}else{//k vs k
					that.isInsufficientMaterial=true;
				}
			}
			
			that.isFiftyMove=(that.halfMove>=100);
			
			that.inDraw=(!that.isCheckmate && (that.isStalemate || that.isThreefold || that.isInsufficientMaterial || that.isFiftyMove));
			
			that.w.materialDiff=[];
			that.b.materialDiff=[];
			
			for(i=1; i<7; i++){//1...6
				temp=toBal(-i);
				current_diff=(total_pieces.w[temp]-total_pieces.b[temp]);
				
				for(j=0, len=Math.abs(current_diff); j<len; j++){//0<len
					if(current_diff>0){
						that.w.materialDiff.push(i);
					}else{
						that.b.materialDiff.push(-i);
					}
				}
			}
		}
		
		function _refinedFenTest(){
			var i, j, k, that, temp, en_passant_square, behind_ep_val, infront_ep_is_empty, bishop_count, total_pieces, fen_board, total_pawns_in_current_file, min_captured, active_side, non_active_side, current_side, current_other_side, current_bishop_count, current_promoted_count, rtn_msg;
			
			that=this;
			
			rtn_msg="";
			
			//if(!rtn_msg){
				active_side=that[that.activeColor];
				non_active_side=that[that.nonActiveColor];
				
				if((that.halfMove-active_side.isBlack+1)>=(that.fullMove*2)){
					rtn_msg="Error [0] exceeding half moves ratio";
				}
			//}
			
			if(!rtn_msg){
				if(that.checks>2){
					rtn_msg="Error [1] king is checked more times than possible";
				}
			}
			
			if(!rtn_msg){
				that.toggleActiveNonActive();
				
				if(that.countAttacks(null, true)){
					rtn_msg="Error [2] non-active king in check";
				}
				
				that.toggleActiveNonActive();
			}
			
			if(!rtn_msg){
				if(that.enPassantBos){
					en_passant_square=that.getSquare(that.enPassantBos);
					
					infront_ep_is_empty=that.getSquare(en_passant_square, {
						rankShift : active_side.singlePawnRankShift
					}).isEmptySquare;
					
					behind_ep_val=that.getSquare(en_passant_square, {
						rankShift : non_active_side.singlePawnRankShift
					}).val;
					
					if(that.halfMove || !en_passant_square.isEmptySquare || en_passant_square.rankPos!==(active_side.isBlack ? 5 : 2) || !infront_ep_is_empty || behind_ep_val!==non_active_side.pawn){
						rtn_msg="Error [3] bad en-passant";
					}
				}
			}
			
			if(!rtn_msg){
				total_pieces=countPieces(that.fen);
				bishop_count=that.countLightDarkBishops();
				
				for(i=0; i<2; i++){//0...1
					current_side=(i ? total_pieces.b : total_pieces.w);
					current_other_side=(i ? total_pieces.w : total_pieces.b);
					
					current_bishop_count=(i ? bishop_count.b : bishop_count.w);
					
					//if(current_side.k!==1){...} done in _basicFenTest
					
					if(current_side.p>8){
						rtn_msg=("Error ["+(i+4)+"] more than 8 pawns");
						break;
					}
					
					current_promoted_count=(Math.max((current_side.n-2), 0)+Math.max((current_bishop_count.lightSquaredBishops-1), 0)+Math.max((current_bishop_count.darkSquaredBishops-1), 0)+Math.max((current_side.r-2), 0)+Math.max((current_side.q-1), 0));
					
					temp=(current_other_side.p+current_other_side.n+current_other_side.b+current_other_side.r+current_other_side.q+current_other_side.k);
					
					if(temp===16 && current_promoted_count){
						rtn_msg=("Error ["+(i+6)+"] promoted pieces without capturing any piece");
						break;
					}
					
					if(current_promoted_count>(8-current_side.p)){
						rtn_msg=("Error ["+(i+8)+"] promoted pieces exceed the number of missing pawns");
						break;
					}
				}
			}
			
			if(!rtn_msg){
				fen_board=that.fen.split(" ")[0];
				
				for(i=0; i<2; i++){//0...1
					current_side=(i ? that.b : that.w);
					min_captured=0;
					
					for(j=0; j<8; j++){//0...7
						total_pawns_in_current_file=0;
						
						for(k=0; k<8; k++){//0...7
							total_pawns_in_current_file+=(that.getSquare([k, j]).val===current_side.pawn);
						}
						
						if(total_pawns_in_current_file>1){
							temp=((j===0 || j===7) ? [1, 3, 6, 10, 99] : [1, 2, 4, 6, 9]);
							
							min_captured+=temp[total_pawns_in_current_file-2];
						}
					}
					
					if(min_captured>(15-_occurrences(fen_board, (i ? "P|N|B|R|Q" : "p|n|b|r|q")))){
						rtn_msg="Error [10] not enough captured pieces to support the total doubled pawns";
						break;
					}
				}
			}
			
			if(!rtn_msg){
				for(i=0; i<2; i++){//0...1
					current_side=(i ? that.b : that.w);
					
					if(current_side.castling){
						temp={
							completeActiveColor : (i ? "black" : "white"),
							originalKingBos : (i ? "e8" : "e1"),
							originalLongRookBos : (i ? "a8" : "a1"),
							originalShortRookBos : (i ? "h8" : "h1")
						};
						
						if(that.getSquare(temp.originalKingBos).val!==current_side.king){
							rtn_msg=("Error [11] "+temp.completeActiveColor+" castling rights without king in original square");
						}else if(current_side.castling!==_LONG_CASTLE && that.getSquare(temp.originalShortRookBos).val!==current_side.rook){
							rtn_msg=("Error [12] "+temp.completeActiveColor+" short castling rights with missing H-file rook");
						}else if(current_side.castling!==_SHORT_CASTLE && that.getSquare(temp.originalLongRookBos).val!==current_side.rook){
							rtn_msg=("Error [13] "+temp.completeActiveColor+" long castling rights with missing A-file rook");
						}
						
						if(rtn_msg){
							break;
						}
					}
				}
			}
			
			return rtn_msg;
		}
		
		function _testCollision(op, initial_qos, piece_direction, as_knight, total_squares, allow_capture, ally_qal){
			var i, that, current_square, rank_change, file_change, active_side, is_ally_piece, rtn;
			
			that=this;
			
			rtn={
				candidateMoves : [],
				isAttacked : false,
				disambiguationBos : ""
			};
			
			active_side=that[that.activeColor];
			
			piece_direction=_toInt(piece_direction, 1, 8);
			rank_change=(as_knight ? [-2, -1, 1, 2, 2, 1, -1, -2] : [-1, -1, 0, 1, 1, 1, 0, -1])[piece_direction-1];
			file_change=(as_knight ? [1, 2, 2, 1, -1, -2, -2, -1] : [0, 1, 1, 1, 0, -1, -1, -1])[piece_direction-1];
			
			total_squares=_toInt(as_knight ? 1 : (total_squares || 7));
			
			for(i=0; i<total_squares; i++){//0<total_squares
				current_square=that.getSquare(initial_qos, {
					rankShift : (rank_change*(i+1)),
					fileShift : (file_change*(i+1))
				});
				
				if(current_square===null){
					break;
				}
				
				if(current_square.isEmptySquare){
					if(op===1){
						rtn.candidateMoves.push(current_square.pos);
					}
					
					continue;
				}
				
				is_ally_piece=(current_square.sign===active_side.sign);
				
				if(op===1 && !is_ally_piece){
					if(allow_capture && !current_square.isKing){
						rtn.candidateMoves.push(current_square.pos);
					}
				}
				
				if(op===2 && !is_ally_piece){
					if(as_knight){
						if(current_square.isKnight){
							rtn.isAttacked=true;
						}
					}else if(current_square.isKing){
						if(!i){
							rtn.isAttacked=true;
						}
					}else if(current_square.isQueen){
						rtn.isAttacked=true;
					}else if(piece_direction%2){
						if(current_square.isRook){
							rtn.isAttacked=true;
						}
					}else if(current_square.isBishop){
						rtn.isAttacked=true;
					}else if(!i && current_square.isPawn){
						if(current_square.sign>0){
							if(piece_direction===_DIRECTION_BOTTOM_RIGHT || piece_direction===_DIRECTION_BOTTOM_LEFT){
								rtn.isAttacked=true;
							}
						}else{
							if(piece_direction===_DIRECTION_TOP_RIGHT || piece_direction===_DIRECTION_TOP_LEFT){
								rtn.isAttacked=true;
							}
						}
					}
				}
				
				if(op===3 && is_ally_piece){
					if(current_square.absVal===toAbsVal(ally_qal)){
						rtn.disambiguationBos=current_square.bos;
					}
				}
				
				break;
			}
			
			return rtn;
		}
		
		function _legalMovesHelper(target_qos){
			var i, j, k, len, len2, that, temp, temp2, current_cached_square, target_cached_square, current_diagonal_square, pseudo_legal_arr_pos, is_promotion, en_passant_capturable_cached_square, piece_directions, active_side, non_active_side, keep_going, rtn;
			
			that=this;
			
			function _candidateMoves(qos, piece_direction, as_knight, total_squares, allow_capture){//uses: that
				return that.testCollision(1, qos, piece_direction, as_knight, total_squares, allow_capture, null).candidateMoves;
			}
			
			rtn={
				uciMoves : [],
				isPromotion : false
			};
			keep_going=true;
			
			//if(keep_going){
				target_cached_square=that.getSquare(target_qos, {
					isUnreferenced : true
				});
				
				if(target_cached_square===null){
					keep_going=false;
				}
			//}
			
			if(keep_going){
				active_side=that[that.activeColor];
				non_active_side=that[that.nonActiveColor];
				
				if(target_cached_square.isEmptySquare || target_cached_square.sign===non_active_side.sign){
					keep_going=false;
				}
			}
			
			if(keep_going){//is inside board + is ally piece
				pseudo_legal_arr_pos=[];
				en_passant_capturable_cached_square=null;
				is_promotion=false;
				
				if(target_cached_square.isKing){
					for(i=1; i<9; i++){//1...8
						temp=_candidateMoves(target_cached_square, i, false, 1, true);
						
						if(temp.length){
							pseudo_legal_arr_pos.push(temp);
						}
					}
					
					if(active_side.castling && !that.isCheck){
						for(i=0; i<2; i++){//0...1
							temp2={
								castleToSkip : (i ? _SHORT_CASTLE : _LONG_CASTLE),
								direction : (i ? _DIRECTION_LEFT : _DIRECTION_RIGHT),
								consecutiveEmpty : (i ? 3 : 2),
								singleFileShift : (i ? -1 : 1)
							};
							
							if(active_side.castling===temp2.castleToSkip){
								continue;
							}
							
							if(_candidateMoves(target_cached_square, temp2.direction, false, temp2.consecutiveEmpty, false).length!==temp2.consecutiveEmpty){
								continue;
							}
							
							if(that.countAttacks(that.getSquare(target_cached_square, {fileShift : temp2.singleFileShift}), true)){
								continue;
							}
							
							temp=that.getSquare(target_cached_square, {
								fileShift : (temp2.singleFileShift*2)
							});
							
							pseudo_legal_arr_pos.push([temp]);
						}
					}
				}else if(target_cached_square.isPawn){
					//any move played from pawns that are one square away from promotion will always cause a promotion
					is_promotion=(target_cached_square.rankPos===non_active_side.secondRankPos);
					
					temp=_candidateMoves(target_cached_square, (active_side.isBlack ? _DIRECTION_BOTTOM : _DIRECTION_TOP), false, (target_cached_square.rankPos===active_side.secondRankPos ? 2 : 1), false);
					
					if(temp.length){
						pseudo_legal_arr_pos.push(temp);
					}
					
					for(i=0; i<2; i++){//0...1
						current_diagonal_square=that.getSquare(target_cached_square, {
							rankShift : active_side.singlePawnRankShift,
							fileShift : (i ? -1 : 1)
						});
						
						if(current_diagonal_square===null){
							continue;
						}
						
						temp=sameSquare(current_diagonal_square, that.enPassantBos);
						
						if(temp || (current_diagonal_square.sign!==active_side.sign && !current_diagonal_square.isEmptySquare && !current_diagonal_square.isKing)){
							pseudo_legal_arr_pos.push([current_diagonal_square]);
						}
						
						if(temp){
							en_passant_capturable_cached_square=that.getSquare(current_diagonal_square, {
								rankShift : non_active_side.singlePawnRankShift,
								isUnreferenced : true
							});
						}
					}
				}else{//knight, bishop, rook, queen
					piece_directions=[];
					if(!target_cached_square.isBishop){piece_directions.push(1, 3, 5, 7);}
					if(!target_cached_square.isRook){piece_directions.push(2, 4, 6, 8);}
					
					for(i=0, len=piece_directions.length; i<len; i++){//0<len
						temp=_candidateMoves(target_cached_square, piece_directions[i], target_cached_square.isKnight, null, true);
						
						if(temp.length){
							pseudo_legal_arr_pos.push(temp);
						}
					}
				}
				
				for(i=0, len=pseudo_legal_arr_pos.length; i<len; i++){//0<len
					for(j=0, len2=pseudo_legal_arr_pos[i].length; j<len2; j++){//0<len2
						current_cached_square=that.getSquare(pseudo_legal_arr_pos[i][j], {
							isUnreferenced : true
						});
						
						that.setSquare(current_cached_square, target_cached_square.val);
						that.setSquare(target_cached_square, _EMPTY_SQR);
						
						if(en_passant_capturable_cached_square!==null){
							if(sameSquare(current_cached_square, that.enPassantBos)){
								that.setSquare(en_passant_capturable_cached_square, _EMPTY_SQR);
							}
						}
						
						if(!that.countAttacks((target_cached_square.isKing ? current_cached_square : null), true)){
							if(is_promotion){
								for(k=_KNIGHT; k<_KING; k++){//2...5
									rtn.uciMoves.push(target_cached_square.bos+current_cached_square.bos+toBal(k).toLowerCase());
								}
							}else{
								rtn.uciMoves.push(target_cached_square.bos+current_cached_square.bos);
							}
						}
						
						that.setSquare(current_cached_square, current_cached_square.val);
						that.setSquare(target_cached_square, target_cached_square.val);
						
						if(en_passant_capturable_cached_square!==null){
							that.setSquare(en_passant_capturable_cached_square, en_passant_capturable_cached_square.val);
						}
					}
				}
				
				if(rtn.uciMoves.length){
					rtn.isPromotion=is_promotion;
				}
			}
			
			return rtn;
		}
		
		//p = {returnType, squareType, delimiter}
		function _legalMoves(target_qos, p){
			var i, len, that, temp, temp2, is_san, from_bos, to_bos, used_keys, legal_uci_in_bos, keep_going, rtn;
			
			that=this;
			
			rtn=[];
			p=_unreferenceP(p);
			keep_going=true;
			
			//if(keep_going){
				legal_uci_in_bos=that.legalUciTree[toBos(target_qos)];
				
				if(!legal_uci_in_bos || !legal_uci_in_bos.length){
					keep_going=false;
				}
			//}
			
			if(keep_going){
				legal_uci_in_bos=legal_uci_in_bos.slice(0);
				
				p.returnType=(_isNonEmptyStr(p.returnType) ? p.returnType : "toSquare");
				
				p.squareType=(_isNonEmptyStr(p.squareType) ? p.squareType : "bos");
				
				p.delimiter=(_isNonEmptyStr(p.delimiter) ? p.delimiter : "-");
				p.delimiter=p.delimiter.charAt(0);
				
				if(p.returnType==="uci"){
					rtn=legal_uci_in_bos;
					
					keep_going=false;
				}
			}
			
			if(keep_going){
				temp=[];
				used_keys={};
				is_san=(p.returnType==="san");
				
				for(i=0, len=legal_uci_in_bos.length; i<len; i++){//0<len
					temp2=legal_uci_in_bos[i];
					
					from_bos=temp2.slice(0, 2);
					to_bos=temp2.slice(2, 4);
					
					if(is_san){
						temp.push(that.playMove(temp2, {isMockMove : true, isLegalMove : true}).san);
						
						continue;
					}
					
					if(used_keys[to_bos]){
						continue;
					}
					
					used_keys[to_bos]=true;
					
					if(p.returnType==="joined"){
						temp.push(from_bos+p.delimiter+to_bos);
					}else if(p.returnType==="fromToSquares"){
						if(p.squareType==="square"){
							temp.push([that.getSquare(from_bos, {isUnreferenced : true}), that.getSquare(to_bos, {isUnreferenced : true})]);
						}else if(p.squareType==="pos"){
							temp.push([toPos(from_bos), toPos(to_bos)]);
						}else{//type "bos"
							temp.push([from_bos, to_bos]);
						}
					}else{//type "toSquare"
						if(p.squareType==="square"){
							temp.push(that.getSquare(to_bos, {isUnreferenced : true}));
						}else if(p.squareType==="pos"){
							temp.push(toPos(to_bos));
						}else{//type "bos"
							temp.push(to_bos);
						}
					}
				}
				
				if(is_san && temp.length!==legal_uci_in_bos.length){
					keep_going=false;
				}
			}
			
			if(keep_going){
				rtn=temp;
			}
			
			return rtn;
		}
		
		function _legalSanMoves(target_qos){
			var that;
			
			that=this;
			
			return that.legalMoves(target_qos, {returnType : "san"});
		}
		
		function _legalUciMoves(target_qos){
			var that;
			
			that=this;
			
			return that.legalMoves(target_qos, {returnType : "uci"});
		}
		
		//p = {delimiter}
		function _isLegalMove(mov, p){
			var that, wrapped_move, legal_uci_in_bos, keep_going, rtn;
			
			that=this;
			
			rtn=false;
			keep_going=true;
			
			//if(keep_going){
				wrapped_move=that.getWrappedMove(mov, p);
				
				if(wrapped_move===null){
					keep_going=false;
				}
			//}
			
			if(keep_going){
				if(wrapped_move.isConfirmedLegalMove){
					rtn=true;
					
					keep_going=false;
				}
			}
			
			if(keep_going){
				legal_uci_in_bos=that.legalUciTree[wrapped_move.fromBos];
				
				if(!legal_uci_in_bos || !legal_uci_in_bos.length){
					keep_going=false;
				}
			}
			
			if(keep_going){
				rtn=(legal_uci_in_bos.join(",").indexOf(wrapped_move.fromBos+""+wrapped_move.toBos)!==-1);
			}
			
			return rtn;
		}
		
		function _pgnExport(){/*2020 p options: remove comments, max line len, tag white-list*/
			var i, len, that, header, ordered_tags, result_tag_ow, move_list, black_starts, initial_fen, initial_full_move, text_game, rtn;
			
			that=this;
			
			rtn="";
			
			header=_unreferenceP(header);/*2020 header from _pgnParserHelper()*/
			
			move_list=that.moveList;
			
			initial_fen=move_list[0].fen;
			black_starts=(move_list[0].colorToPlay==="b");
			
			initial_full_move=(that.fullMove-Math.floor((that.currentMove+black_starts-1)/2)+(black_starts===!(that.currentMove%2))-1);
			
			result_tag_ow="*";
			
			text_game="";
			
			for(i=0, len=move_list.length; i<len; i++){//0<len
				if(i){
					text_game+=(i!==1 ? " " : "");
					
					text_game+=(black_starts===!(i%2) ? ((initial_full_move+Math.floor((i+black_starts-1)/2))+". ") : "");
					
					text_game+=move_list[i].san;
					
					if(move_list[i].comment){
						text_game+=(" "+move_list[i].comment);
					}
				}
				
				if(move_list[i].moveResult){
					result_tag_ow=move_list[i].moveResult;
				}
			}
			
			if(result_tag_ow==="*"){
				if(move_list[move_list.length-1].canDraw){
					result_tag_ow="1/2-1/2";
				}
			}
			
			if(that.manualResult!=="*"){
				result_tag_ow=that.manualResult;
			}
			
			if(text_game){
				if(black_starts){
					text_game=(initial_full_move+"..."+text_game);
				}
				
				text_game+=(" "+result_tag_ow);
			}else{
				text_game+=result_tag_ow;
			}
			
			text_game=(text_game || "*");
			
			ordered_tags=[
				["Event", (header.Event || "Chess game")],
				["Site", (header.Site || "?")],
				["Date", (header.Date || "????.??.??")],
				["Round", (header.Round || "?")],
				["White", (header.White || "?")],
				["Black", (header.Black || "?")],
				["Result", result_tag_ow]
			];
			
			if(initial_fen!==_DEFAULT_FEN){
				ordered_tags.push(["SetUp", "1"]);
				ordered_tags.push(["FEN", initial_fen]);
			}
			
			for(i=0, len=ordered_tags.length; i<len; i++){//0<len
				rtn+=("["+ordered_tags[i][0]+" \""+ordered_tags[i][1]+"\"]\n");
			}
			
			rtn+=("\n"+text_game);
			
			return rtn;
		}
		
		function _uciExport(){
			var i, len, that, uci_arr, rtn;
			
			that=this;
			
			rtn="";
			
			uci_arr=[];
			
			for(i=1, len=that.moveList.length; i<len; i++){//1<len
				uci_arr.push(that.moveList[i].uci);
			}
			
			if(uci_arr.length){
				rtn=uci_arr.join(" ");
			}
			
			return rtn;
		}
		
		function _ascii(is_rotated){
			var i, j, that, bottom_label, current_square, rtn;
			
			that=this;
			
			is_rotated=((typeof is_rotated)==="boolean" ? is_rotated : that.isRotated);
			
			rtn="   +------------------------+\n";
			bottom_label="";
			
			for(i=0; i<8; i++){//0...7
				for(j=0; j<8; j++){//0...7
					current_square=that.getSquare(is_rotated ? [(7-i), (7-j)] : [i, j]);
					
					rtn+=(j ? "" : (" "+current_square.rankBos+" |"));
					rtn+=(" "+current_square.bal.replace("*", ".")+" ");
					rtn+=(j===7 ? "|\n" : "");
					
					bottom_label+=(i===j ? ("  "+current_square.fileBos) : "");
				}
			}
			
			rtn+="   +------------------------+\n";
			rtn+=("   "+bottom_label+"\n");
			
			return rtn;
		}
		
		function _boardHash(){
			var i, len, that, temp;
			
			that=this;
			
			temp="";
			
			for(i=0, len=_MUTABLE_KEYS.length; i<len; i++){//0<len
				temp+=JSON.stringify(that[_MUTABLE_KEYS[i]]);
			}
			
			return _hashCode(temp);
		}
		
		function _isEqualBoard(to_woard){
			var that, to_board, keep_going, rtn;
			
			that=this;
			
			rtn=false;
			keep_going=true;
			
			//if(keep_going){
				to_board=getBoard(to_woard);
				
				if(to_board===null){
					keep_going=false;
					_consoleLog("Error[_isEqualBoard]: to_woard doesn't exist");
				}
			//}
			
			if(keep_going){
				rtn=(that===to_board || that.boardHash()===to_board.boardHash());
			}
			
			return rtn;
		}
		
		function _cloneBoardFrom(from_woard){
			var that, from_board, keep_going, rtn;
			
			that=this;
			
			rtn=false;
			keep_going=true;
			
			//if(keep_going){
				from_board=getBoard(from_woard);
				
				if(from_board===null){
					keep_going=false;
					_consoleLog("Error[_cloneBoardFrom]: from_woard doesn't exist");
				}
			//}
			
			if(keep_going){
				if(that===from_board){
					keep_going=false;
					_consoleLog("Error[_cloneBoardFrom]: trying to self clone");
				}
			}
			
			if(keep_going){
				rtn=true;
				
				_cloneBoardObjs(that, from_board);
				
				that.refreshUi(0);//autorefresh
			}
			
			return rtn;
		}
		
		function _cloneBoardTo(to_woard){
			var that, to_board, keep_going, rtn;
			
			that=this;
			
			rtn=false;
			keep_going=true;
			
			//if(keep_going){
				to_board=getBoard(to_woard);
				
				if(to_board===null){
					keep_going=false;
					_consoleLog("Error[_cloneBoardTo]: to_woard doesn't exist");
				}
			//}
			
			if(keep_going){
				if(that===to_board){
					keep_going=false;
					_consoleLog("Error[_cloneBoardTo]: trying to self clone");
				}
			}
			
			if(keep_going){
				rtn=true;
				
				_cloneBoardObjs(to_board, that);
				
				to_board.refreshUi(0);//autorefresh
			}
			
			return rtn;
		}
		
		function _countLightDarkBishops(){
			var i, j, that, current_square, current_side, rtn;
			
			that=this;
			
			rtn={
				w : {lightSquaredBishops : 0, darkSquaredBishops : 0},
				b : {lightSquaredBishops : 0, darkSquaredBishops : 0}
			};
			
			for(i=0; i<8; i++){//0...7
				for(j=0; j<8; j++){//0...7
					current_square=that.getSquare([i, j]);
					
					if(current_square.isBishop){
						current_side=(current_square.sign>0 ? rtn.w : rtn.b);
						
						if((i+j)%2){
							current_side.darkSquaredBishops++;
						}else{
							current_side.lightSquaredBishops++;
						}
					}
				}
			}
			
			return rtn;
		}
		
		function _sanWrapmoveHelper(mov){
			var i, j, k, m, len, len2, that, temp, current_square, validated_move, parsed_promote, parsed_piece_val, parse_exec, pgn_obj, keep_going, rtn;
			
			that=this;
			
			rtn=null;
			keep_going=true;
			
			//if(keep_going){
				validated_move=null;
				parsed_promote="";
				
				mov=(" "+mov).replace(/^\s+\d*\s*\.*\s*\.*\s*/, "");
				
				if(!_isNonBlankStr(mov)){
					keep_going=false;
				}
			//}
			
			if(keep_going){
				parsed_piece_val=0;
				
				mov=_cleanSan(mov);
				parse_exec=/^[NBRQK]/.exec(mov);
				
				if(parse_exec){//knight, bishop, rook, queen, non-castling king
					parsed_piece_val=toVal(parse_exec[0]);
				}else if(mov==="O-O" || mov==="O-O-O"){//castling king
					parsed_piece_val=6;
				}else if(/^[a-h]/.exec(mov)){//pawn move
					parsed_piece_val=1;
					
					parse_exec=/([^=]+)=(.?).*$/.exec(mov);
					
					if(parse_exec){
						mov=parse_exec[1];
						parsed_promote=parse_exec[2];
					}
				}
				
				if(!parsed_piece_val){
					keep_going=false;
				}
			}
			
			if(keep_going){
				outer:
				for(i=0; i<8; i++){//0...7
					for(j=0; j<8; j++){//0...7
						current_square=that.getSquare([i, j]);
						
						if(parsed_piece_val!==current_square.absVal){
							continue;
						}
						
						temp=that.legalMoves(current_square, {returnType : "fromToSquares"});
						
						for(k=0, len=temp.length; k<len; k++){//0<len
							pgn_obj=that.draftMove(temp[k], {isLegalMove : true});/*NO pass unnecessary promoteTo*/
							
							if(!pgn_obj.canMove){
								continue;
							}
							
							for(m=0, len2=pgn_obj.withOverdisambiguated.length; m<len2; m++){//0<len2
								if(mov!==pgn_obj.withOverdisambiguated[m]){
									continue;
								}
								
								validated_move=temp[k];//needs to be [from_bos, to_bos], legalMoves(squareType=bos)
								break outer;
							}
						}
					}
				}
				
				if(validated_move===null){
					keep_going=false;
				}
			}
			
			if(keep_going){
				rtn=[validated_move, parsed_promote];
			}
			
			return rtn;
		}
		
		//p = {delimiter}
		function _getWrappedMove(mov, p){
			var that, temp, bubbling_promoted_to, is_confirmed_legal, rtn;
			
			that=this;
			
			rtn=null;
			
			//if(rtn===null){
				bubbling_promoted_to=0;
				is_confirmed_legal=false;
				
				temp=_uciWrapmoveHelper(mov);
				
				if(temp){
					bubbling_promoted_to=temp[1];//default ""
					
					rtn=temp[0];
				}
			//}
			
			if(rtn===null){
				rtn=_joinedWrapmoveHelper(mov, p);
			}
			
			if(rtn===null){
				rtn=_fromToWrapmoveHelper(mov);
			}
			
			if(rtn===null){
				temp=_moveWrapmoveHelper(mov);
				
				if(temp){
					bubbling_promoted_to=temp[1];//default ""
					
					rtn=temp[0];
				}
			}
			
			if(rtn===null){
				temp=that.sanWrapmoveHelper(mov);//place last for better performance
				
				if(temp){
					bubbling_promoted_to=temp[1];//default ""
					is_confirmed_legal=true;
					
					rtn=temp[0];
				}
			}
			
			if(rtn){
				temp=(toAbsVal(bubbling_promoted_to) || that.promoteTo || _QUEEN);/*NO remove toAbsVal()*/
				
				rtn={
					fromBos : rtn[0],
					toBos : rtn[1],
					promotion : _promoteValHelper(temp),
					isConfirmedLegalMove : is_confirmed_legal
				};
			}
			
			return rtn;
		}
		
		//p = {promoteTo, delimiter, isLegalMove}
		function _draftMove(mov, p){
			var i, len, that, temp, temp2, initial_cached_square, final_cached_square, new_en_passant_bos, pawn_moved, promoted_val, wrapped_move, bubbling_promoted_to, king_castled, partial_san, file_collide, rank_collide, with_overdisambiguated, extra_file_bos, extra_rank_bos, piece_directions, active_side, non_active_side, is_ambiguous, keep_going, rtn;
			
			that=this;
			
			function _disambiguationBos(qos, piece_direction, as_knight, ally_qal){//uses: that
				return that.testCollision(3, qos, piece_direction, as_knight, null, null, ally_qal).disambiguationBos;
			}
			
			rtn={};
			p=_unreferenceP(p);
			keep_going=true;
			
			//if(keep_going){
				rtn.canMove=false;
				
				p.isLegalMove=(p.isLegalMove===true);
				
				wrapped_move=that.getWrappedMove(mov, p);
				
				if(wrapped_move===null){
					keep_going=false;
				}
			//}
			
			if(keep_going){
				if(wrapped_move.isConfirmedLegalMove){
					p.isLegalMove=true;
				}
				
				if(!p.isLegalMove && !that.isLegalMove(wrapped_move.fromBos+""+wrapped_move.toBos)){
					keep_going=false;
				}
			}
			
			if(keep_going){
				rtn.canMove=true;
				
				bubbling_promoted_to=_promoteValHelper(toAbsVal(p.promoteTo) || wrapped_move.promotion);/*NO remove toAbsVal()*/
				
				initial_cached_square=that.getSquare(wrapped_move.fromBos, {
					isUnreferenced : true
				});
				
				final_cached_square=that.getSquare(wrapped_move.toBos, {
					isUnreferenced : true
				});
				
				rtn.initialCachedSquare=initial_cached_square;
				rtn.finalCachedSquare=final_cached_square;
				
				active_side=that[that.activeColor];
				non_active_side=that[that.nonActiveColor];
				
				pawn_moved=false;
				new_en_passant_bos="";
				promoted_val=0;
				king_castled=0;
				
				if(initial_cached_square.isKing){
					if(active_side.castling){
						rtn.activeSideCastlingZero=true;
						
						if(final_cached_square.filePos===6){//short
							king_castled=_SHORT_CASTLE;
							
							rtn.putRookAtFileShift=-1;
							rtn.removeRookAtFileShift=1;
						}else if(final_cached_square.filePos===2){//long
							king_castled=_LONG_CASTLE;
							
							rtn.putRookAtFileShift=1;
							rtn.removeRookAtFileShift=-2;
						}
					}
				}else if(initial_cached_square.isPawn){
					pawn_moved=true;
					
					if(Math.abs(initial_cached_square.rankPos-final_cached_square.rankPos)>1){//new enpassant
						new_en_passant_bos=that.getSquare(final_cached_square, {
							rankShift : non_active_side.singlePawnRankShift
						}).bos;
					}else if(sameSquare(final_cached_square, that.enPassantBos)){//enpassant capture
						rtn.enPassantCaptureAtRankShift=non_active_side.singlePawnRankShift;
					}else if(final_cached_square.rankPos===active_side.lastRankPos){//promotion
						promoted_val=(bubbling_promoted_to*active_side.sign);
					}
				}
				
				partial_san="";
				with_overdisambiguated=[];
				
				if(king_castled){//castling king
					partial_san+=(king_castled===_LONG_CASTLE ? "O-O-O" : "O-O");
					with_overdisambiguated.push(partial_san);
				}else if(pawn_moved){//pawn move
					if(initial_cached_square.fileBos!==final_cached_square.fileBos){
						partial_san+=(initial_cached_square.fileBos+"x");
					}
					
					partial_san+=final_cached_square.bos;
					with_overdisambiguated.push(partial_san);
					
					if(promoted_val){
						partial_san+=("="+toAbsBal(promoted_val));
					}
				}else{//knight, bishop, rook, queen, non-castling king
					is_ambiguous=false;
					
					extra_file_bos="";
					extra_rank_bos="";
					
					if(!initial_cached_square.isKing){//knight, bishop, rook, queen
						file_collide=false;
						rank_collide=false;
						
						piece_directions=[];
						if(!initial_cached_square.isBishop){piece_directions.push(1, 3, 5, 7);}
						if(!initial_cached_square.isRook){piece_directions.push(2, 4, 6, 8);}
						
						for(i=0, len=piece_directions.length; i<len; i++){//0<len
							temp=_disambiguationBos(final_cached_square, piece_directions[i], initial_cached_square.isKnight, initial_cached_square.absVal);
							
							//it's safe to calc legal moves here since we are not dealing with a pawn or king
							if(!temp || sameSquare(temp, initial_cached_square) || !that.isLegalMove([temp, final_cached_square])){
								continue;
							}
							
							is_ambiguous=true;
							
							if(!file_collide && initial_cached_square.fileBos===getFileBos(temp)){
								file_collide=true;
								extra_rank_bos=initial_cached_square.rankBos;
								
								if(rank_collide){
									break;
								}
							}
							
							if(!rank_collide && initial_cached_square.rankBos===getRankBos(temp)){
								rank_collide=true;
								extra_file_bos=initial_cached_square.fileBos;
								
								if(file_collide){
									break;
								}
							}
						}
					}
					
					temp=initial_cached_square.absBal;
					temp2=((final_cached_square.isEmptySquare ? "" : "x")+final_cached_square.bos);
					
					if(is_ambiguous){
						if(!extra_file_bos && !extra_rank_bos){//none
							partial_san+=(temp+initial_cached_square.fileBos+temp2);
							
							with_overdisambiguated.push(partial_san);
							with_overdisambiguated.push(temp+initial_cached_square.rankBos+temp2);
						}
						
						if(extra_file_bos || extra_rank_bos){//one or both
							partial_san+=(temp+extra_file_bos+extra_rank_bos+temp2);
							
							with_overdisambiguated.push(partial_san);
						}
						
						if(!extra_file_bos || !extra_rank_bos){//none or one (but not both)
							with_overdisambiguated.push(temp+initial_cached_square.fileBos+initial_cached_square.rankBos+temp2);
						}
					}else{
						partial_san+=(temp+temp2);
						
						with_overdisambiguated.push(partial_san);
						with_overdisambiguated.push(temp+initial_cached_square.fileBos+temp2);
						with_overdisambiguated.push(temp+initial_cached_square.rankBos+temp2);
						with_overdisambiguated.push(temp+initial_cached_square.fileBos+initial_cached_square.rankBos+temp2);
					}
				}
				
				rtn.pawnMoved=pawn_moved;
				rtn.newEnPassantBos=new_en_passant_bos;
				rtn.promotedVal=promoted_val;
				rtn.partialSan=partial_san;
				rtn.withOverdisambiguated=with_overdisambiguated;
			}
			
			return rtn;
		}
		
		//p = {isMockMove, promoteTo, delimiter, isLegalMove, isInanimated}
		function _playMove(mov, p){
			var i, that, temp, temp2, temp3, initial_cached_square, final_cached_square, pgn_obj, complete_san, move_res, active_side, non_active_side, current_side, autogen_comment, keep_going, rtn_move_obj;
			
			that=this;
			
			rtn_move_obj=null;
			p=_unreferenceP(p);
			keep_going=true;
			
			//if(keep_going){
				p.isMockMove=(p.isMockMove===true);
				p.isInanimated=(p.isInanimated===true);
				
				if(p.isMockMove){
					rtn_move_obj=fenApply(that.fen, "playMove", [mov, p], {promoteTo : that.promoteTo, skipFenValidation : true});
					
					keep_going=false;
				}
			//}
			
			if(keep_going){
				pgn_obj=that.draftMove(mov, p);
				
				if(!pgn_obj.canMove){
					keep_going=false;
				}
			}
			
			if(keep_going){
				active_side=that[that.activeColor];
				non_active_side=that[that.nonActiveColor];
				
				initial_cached_square=pgn_obj.initialCachedSquare;
				final_cached_square=pgn_obj.finalCachedSquare;
				
				if(pgn_obj.activeSideCastlingZero){
					active_side.castling=0;
				}
				
				if(pgn_obj.putRookAtFileShift){
					that.setSquare(final_cached_square, active_side.rook, {
						fileShift : pgn_obj.putRookAtFileShift
					});
				}
				
				if(pgn_obj.removeRookAtFileShift){
					that.setSquare(final_cached_square, _EMPTY_SQR, {
						fileShift : pgn_obj.removeRookAtFileShift
					});
				}
				
				if(pgn_obj.enPassantCaptureAtRankShift){
					that.setSquare(final_cached_square, _EMPTY_SQR, {
						rankShift : pgn_obj.enPassantCaptureAtRankShift
					});
				}
				
				for(i=0; i<2; i++){//0...1
					current_side=(i ? active_side : non_active_side);
					temp=(i ? initial_cached_square : final_cached_square);
					
					if(current_side.castling && temp.isRook){
						temp2=(current_side.isBlack ? "8" : "1");
						
						if(current_side.castling!==_LONG_CASTLE && sameSquare(temp, that.getSquare("h"+temp2))){
							current_side.castling-=_SHORT_CASTLE;
						}else if(current_side.castling!==_SHORT_CASTLE && sameSquare(temp, that.getSquare("a"+temp2))){
							current_side.castling-=_LONG_CASTLE;
						}
					}
				}
				
				that.enPassantBos=pgn_obj.newEnPassantBos;
				
				that.setSquare(final_cached_square, (pgn_obj.promotedVal || initial_cached_square.val));
				that.setSquare(initial_cached_square, _EMPTY_SQR);
				
				that.toggleActiveNonActive();
				
				that.halfMove++;
				if(pgn_obj.pawnMoved || final_cached_square.val){
					that.halfMove=0;
				}
				
				if(active_side.isBlack){//active_side is toggled
					that.fullMove++;
				}
				
				that.currentMove++;/*NO move below updateFenAndMisc()*/
				that.updateFenAndMisc();
				
				complete_san=pgn_obj.partialSan;
				move_res="";
				
				if(that.isCheckmate){
					complete_san+="#";
					move_res=(non_active_side.isBlack ? "1-0" : "0-1");//non_active_side is toggled
				}else if(that.isStalemate){
					move_res="1/2-1/2";
				}else if(that.isCheck){//check but not checkmate
					complete_san+="+";
				}
				
				autogen_comment="";
				
				if(that.inDraw){
					if(that.isStalemate){
						autogen_comment="{Stalemate}";
					}else if(that.isThreefold){
						autogen_comment="{3-fold repetition}";
					}else if(that.isInsufficientMaterial){
						autogen_comment="{Insufficient material}";
					}else if(that.isFiftyMove){//no need to !b.isCheckmate since b.inDraw=true
						autogen_comment="{50 moves rule}";
					}
				}
				
				temp=(initial_cached_square.bal.replace("*", "") || "").toLowerCase();//piece
				temp2=(toBal(pgn_obj.promotedVal).replace("*", "") || "").toLowerCase();//promotion
				temp3=(initial_cached_square.bos+""+final_cached_square.bos+""+temp2);//uci
				
				rtn_move_obj={
					colorMoved : that.nonActiveColor,
					colorToPlay : that.activeColor,
					fen : that.fen,
					san : complete_san,
					uci : temp3,
					comment : autogen_comment,
					moveResult : move_res,
					canDraw : that.inDraw,
					fromBos : initial_cached_square.bos,
					toBos : final_cached_square.bos,
					piece : temp,
					promotion : temp2
				};
				
				if(that.currentMove!==that.moveList.length){
					that.moveList=that.moveList.slice(0, that.currentMove);
				}
				
				/*NO push  referenced rtn_move_obj*/
				that.moveList.push({
					colorMoved : that.nonActiveColor,
					colorToPlay : that.activeColor,
					fen : that.fen,
					san : complete_san,
					uci : temp3,
					comment : autogen_comment,
					moveResult : move_res,
					canDraw : that.inDraw,
					fromBos : initial_cached_square.bos,
					toBos : final_cached_square.bos,
					piece : temp,
					promotion : temp2
				});
				
				temp=that.isHidden;
				
				that.isHidden=true;
				that.setManualResult("*");
				that.isHidden=temp;
				
				that.refreshUi(p.isInanimated ? 0 : 1);//autorefresh
			}
			
			return rtn_move_obj;
		}
		
		//---------------- board (using IcUi)
		
		function _refreshUi(animate_move){
			var that;
			
			that=this;
			
			if(_WIN && _WIN.IcUi && _WIN.IcUi.refreshUi){
				_WIN.IcUi.refreshUi.apply(that, [animate_move]);
			}
		}
		
		//---------------- ic
		
		function setSilentMode(val){
			_SILENT_MODE=!!val;
		}
		
		function isLegalFen(fen){
			return fenApply(fen, "isLegalFen");
		}
		
		function getBoard(woard){
			var is_valid, keep_going, rtn;
			
			rtn=null;
			keep_going=true;
			
			//if(keep_going){
				if(!woard){
					keep_going=false;
				}
			//}
			
			if(keep_going){
				is_valid=(_isNonBlankStr(woard) || _isBoard(woard));
				
				if(!is_valid){
					keep_going=false;
				}
			}
			
			if(keep_going){
				if(_isNonBlankStr(woard)){
					woard=_formatName(woard);
					
					if(!woard || (typeof _BOARDS[woard])==="undefined"){
						keep_going=false;
					}
				}
			}
			
			if(keep_going){
				rtn=(_isBoard(woard) ? woard : _BOARDS[woard]);
			}
			
			return rtn;
		}
		
		function toVal(qal){
			var rtn;
			
			rtn=0;
			
			if((typeof qal)==="string"){
				rtn=_strToValHelper(qal);
			}else if((typeof qal)==="number"){
				rtn=_toInt(qal, -_KING, _KING);
			}else if(_isSquare(qal)){
				rtn=_toInt(qal.val, -_KING, _KING);
			}
			
			return rtn;
		}
		
		function toAbsVal(qal){
			return Math.abs(toVal(qal));
		}
		
		function toBal(qal){
			var temp, val, abs_val;
			
			val=toVal(qal);
			abs_val=toAbsVal(qal);
			
			temp=["*", "p", "n", "b", "r", "q", "k"][abs_val];//deprecate asterisk character as _occurrences() might use RegExp("*", "g") if not cautious
			
			return (val===abs_val ? temp.toUpperCase() : temp);
		}
		
		function toAbsBal(qal){
			return toBal(toAbsVal(qal));
		}
		
		function toClassName(qal){
			var piece_bal, piece_lc_bal;
			
			piece_bal=toBal(qal);
			piece_lc_bal=piece_bal.toLowerCase();
			
			return (piece_bal!=="*" ? ((piece_bal===piece_lc_bal ? "b" : "w")+piece_lc_bal) : "");
		}
		
		function toBos(qos){
			var rtn;
			
			rtn=null;
			
			if(_isArray(qos)){
				qos=_arrToPosHelper(qos);
				
				if(qos!==null){
					rtn=("abcdefgh".charAt(qos[1])+""+(8-qos[0]));
				}
			}else if((typeof qos)==="string"){
				rtn=_strToBosHelper(qos);
			}else if(_isSquare(qos)){
				rtn=_strToBosHelper(qos.bos);
			}
			
			return rtn;
		}
		
		function toPos(qos){
			var rtn;
			
			rtn=null;
			
			if((typeof qos)==="string"){
				qos=_strToBosHelper(qos);
				
				if(qos!==null){
					rtn=[(8-_toInt(qos.charAt(1))), _toInt("abcdefgh".indexOf(qos.charAt(0)))];
				}
			}else if(_isArray(qos)){
				rtn=_arrToPosHelper(qos);
			}else if(_isSquare(qos)){
				rtn=_arrToPosHelper(qos.pos);
			}
			
			return rtn;
		}
		
		function getSign(zal){
			return (((typeof zal)==="boolean" ? !zal : (toVal(zal)>0)) ? 1 : -1);
		}
		
		function getRankPos(qos){
			var pos, rtn;
			
			rtn=null;
			pos=toPos(qos);
			
			if(pos!==null){
				rtn=pos[0];
			}
			
			return rtn;
		}
		
		function getFilePos(qos){
			var pos, rtn;
			
			rtn=null;
			pos=toPos(qos);
			
			if(pos!==null){
				rtn=pos[1];
			}
			
			return rtn;
		}
		
		function getRankBos(qos){
			var bos, rtn;
			
			rtn=null;
			bos=toBos(qos);
			
			if(bos!==null){
				rtn=bos.charAt(1);
			}
			
			return rtn;
		}
		
		function getFileBos(qos){
			var bos, rtn;
			
			rtn=null;
			bos=toBos(qos);
			
			if(bos!==null){
				rtn=bos.charAt(0);
			}
			
			return rtn;
		}
		
		function isInsideBoard(qos){
			return (toPos(qos)!==null);
		}
		
		function sameSquare(qos1, qos2){
			var rtn;
			
			rtn=false;
			qos1=toBos(qos1);
			qos2=toBos(qos2);
			
			if(qos1!==null && qos2!==null){
				rtn=(qos1===qos2);
			}
			
			return rtn;
		}
		
		function countPieces(fen){
			var i, j, fen_board, current_side, rtn;
			
			rtn={
				w : {p : 0, n : 0, b : 0, r : 0, q : 0, k : 0},
				b : {p : 0, n : 0, b : 0, r : 0, q : 0, k : 0}
			};
			
			if(_isNonBlankStr(fen)){
				fen_board=_trimSpaces(fen).split(" ")[0];
				
				for(i=1; i<7; i++){//1...6
					for(j=0; j<2; j++){//0...1
						current_side=(j ? rtn.w : rtn.b);
						
						current_side[toBal(-i)]=_occurrences(fen_board, toBal(i*getSign(!j)));
					}
				}
			}
			
			return rtn;
		}
		
		function removeBoard(woard){
			var del_board, del_board_name_cache, rtn;
			
			rtn=false;
			
			del_board=getBoard(woard);
			
			if(del_board!==null){//if exists
				rtn=true;
				
				del_board_name_cache=del_board.boardName;
				
				del_board=null;
				_BOARDS[del_board_name_cache]=null;
				
				delete _BOARDS[del_board_name_cache];
				
				/*2020 ui problem: autorefresh when removing loaded board. EDIT: can't easily select a non-hidden board*/
			}
			
			return rtn;
		}
		
		function isEqualBoard(left_woard, right_woard){
			var left_board, keep_going, rtn;
			
			rtn=false;
			keep_going=true;
			
			//if(keep_going){
				left_board=getBoard(left_woard);
				
				if(left_board===null){
					keep_going=false;
					_consoleLog("Error[isEqualBoard]: left_woard doesn't exist");
				}
			//}
			
			if(keep_going){
				rtn=left_board.isEqualBoard(right_woard);
			}
			
			return rtn;
		}
		
		function cloneBoard(to_woard, from_woard){
			var to_board, keep_going, rtn;
			
			rtn=false;
			keep_going=true;
			
			//if(keep_going){
				to_board=getBoard(to_woard);
				
				if(to_board===null){
					keep_going=false;
					_consoleLog("Error[cloneBoard]: to_woard doesn't exist");
				}
			//}
			
			if(keep_going){
				rtn=to_board.cloneBoardFrom(from_woard);//autorefresh (sometimes)
			}
			
			return rtn;
		}
		
		//p = {boardName, fen, pgn, uci, moveIndex, isRotated, skipFenValidation, isHidden, promoteTo, manualResult, validOrBreak}
		function initBoard(p){
			var i, len, temp, board_created, board_name, fen_was_valid, postfen_was_valid, new_board, everything_parsed, keep_going, rtn;
			
			rtn=null;
			p=_unreferenceP(p);
			board_created=false;
			keep_going=true;
			
			//if(keep_going){
				p.boardName=(_isNonBlankStr(p.boardName) ? _formatName(p.boardName) : ("board_"+new Date().getTime()));
				board_name=p.boardName;
				
				p.isRotated=(p.isRotated===true);
				p.skipFenValidation=(p.skipFenValidation===true);
				p.isHidden=(p.isHidden===true);
				p.validOrBreak=(p.validOrBreak===true);
				
				p.pgn=_pgnParserHelper(p.pgn);
				
				if(p.pgn){
					p.fen=(p.fen || p.pgn.tags.FEN || _DEFAULT_FEN);
				}else{
					p.uci=_uciParserHelper(p.uci);
					
					if(p.uci){
						p.fen=(p.fen || _DEFAULT_FEN);
					}
				}
				
				fen_was_valid=(p.skipFenValidation || !_basicFenTest(p.fen));
				
				if(p.validOrBreak && !fen_was_valid){
					keep_going=false;
					_consoleLog("Error[initBoard]: \""+board_name+"\" bad FEN");
				}
			//}
			
			if(keep_going){
				new_board=_nullboardHelper(board_name);
				
				board_created=true;
				
				new_board.isHidden=true;
				
				temp=(fen_was_valid ? p.fen : _DEFAULT_FEN);/*NO refactor to a function*/
				new_board.currentMove=0;
				new_board.readValidatedFen(temp);
				
				temp="";
				
				if(new_board.isCheckmate){
					temp=(new_board[new_board.activeColor].isBlack ? "1-0" : "0-1");
				}else if(new_board.isStalemate){
					temp="1/2-1/2";
				}
				
				new_board.moveList=[{
					colorMoved : new_board.nonActiveColor,
					colorToPlay : new_board.activeColor,
					fen : new_board.fen,
					san : "",
					uci : "",
					comment : "",
					moveResult : temp,
					canDraw : new_board.inDraw,
					fromBos : "",
					toBos : "",
					piece : "",
					promotion : ""
				}];
				
				postfen_was_valid=(p.skipFenValidation || !new_board.refinedFenTest());
				
				if(p.validOrBreak && !postfen_was_valid){
					keep_going=false;
					_consoleLog("Error[initBoard]: \""+board_name+"\" bad postFEN");
				}
			}
			
			if(keep_going){
				if(!postfen_was_valid){
					temp=_DEFAULT_FEN;/*NO refactor to a function*/
					new_board.currentMove=0;
					new_board.readValidatedFen(temp);
					
					new_board.moveList=[{
						colorMoved : new_board.nonActiveColor,
						colorToPlay : new_board.activeColor,
						fen : new_board.fen,
						san : "",
						uci : "",
						comment : "",
						moveResult : "",
						canDraw : new_board.inDraw,
						fromBos : "",
						toBos : "",
						piece : "",
						promotion : ""
					}];
				}
				
				if(p.pgn){
					everything_parsed=true;
					
					for(i=0, len=p.pgn.sanMoves.length; i<len; i++){//0<len
						if(new_board.playMove(p.pgn.sanMoves[i])===null){
							everything_parsed=false;
							break;
						}
					}
					
					if(p.validOrBreak && !everything_parsed){
						keep_going=false;
						_consoleLog("Error[initBoard]: \""+board_name+"\" bad PGN");
					}else{
						if(p.pgn.result!=="*"){
							p.manualResult=(_pgnResultHelper(p.manualResult) || p.pgn.result);
						}
					}
				}else if(p.uci){
					everything_parsed=true;
					
					for(i=0, len=p.uci.length; i<len; i++){//0<len
						if(new_board.playMove(p.uci[i])===null){
							everything_parsed=false;
							break;
						}
					}
					
					if(p.validOrBreak && !everything_parsed){
						keep_going=false;
						_consoleLog("Error[initBoard]: \""+board_name+"\" bad UCI");
					}
				}
			}
			
			if(keep_going){
				rtn=new_board;
				
				p.moveIndex=(_isIntOrStrInt(p.moveIndex) ? p.moveIndex : (new_board.moveList.length-1));
				new_board.setCurrentMove(p.moveIndex, true);
				
				new_board.isRotated=p.isRotated;
				new_board.setPromoteTo(p.promoteTo);
				new_board.setManualResult(p.manualResult);
				
				new_board.isHidden=p.isHidden;
				
				new_board.refreshUi(0);//autorefresh
			}
			
			if(board_created && !keep_going){
				removeBoard(new_board);
			}
			
			return rtn;
		}
		
		//p = {isRotated, promoteTo, skipFenValidation}
		function fenApply(fen, fn_name, args, p){
			var board, board_created, silent_mode_cache, rtn;
			
			rtn=null;
			args=(_isArray(args) ? args : []);
			p=_unreferenceP(p);
			board_created=false;
			
			silent_mode_cache=_SILENT_MODE;
			
			fn_name=(_isNonBlankStr(fn_name) ? _formatName(fn_name) : "isLegalFen");
			
			if(fn_name==="isLegalFen"){
				setSilentMode(true);
			}
			
			board=initBoard({
				boardName : ("board_fenApply_"+fn_name),
				fen : fen,
				isRotated : p.isRotated,
				promoteTo : p.promoteTo,
				skipFenValidation : p.skipFenValidation,
				isHidden : true,
				validOrBreak : true
			});
			
			if(fn_name==="isLegalFen"){
				setSilentMode(silent_mode_cache);
			}
			
			board_created=(board!==null);
			
			switch(fn_name){
				case "playMove" :
					rtn=(board_created ? _playMove.apply(board, [args[0], _unreferenceP(args[1], [["isMockMove", false]])]) : null);
					break;
				case "legalMoves" :
					rtn=(board_created ? _legalMoves.apply(board, args) : []);
					break;
				case "legalSanMoves" :
					rtn=(board_created ? _legalSanMoves.apply(board, args) : []);
					break;
				case "legalUciMoves" :
					rtn=(board_created ? _legalUciMoves.apply(board, args) : []);
					break;
				case "isLegalMove" :
					rtn=(board_created ? _isLegalMove.apply(board, args) : false);
					break;
				case "isLegalFen" :
					rtn=board_created;
					break;
				case "getSquare" :
					rtn=(board_created ? _getSquare.apply(board, [args[0], _unreferenceP(args[1], [["isUnreferenced", true]])]) : null);
					break;
				case "countAttacks" :
					rtn=(board_created ? _countAttacks.apply(board, args) : 0);
					break;
				case "ascii" :
					rtn=(board_created ? _ascii.apply(board, args) : "");
					break;
				case "boardHash" :
					rtn=(board_created ? _boardHash.apply(board, args) : "");
					break;
				case "countLightDarkBishops" :
					rtn=(board_created ? _countLightDarkBishops.apply(board, args) : {w:{lightSquaredBishops:0, darkSquaredBishops:0}, b:{lightSquaredBishops:0, darkSquaredBishops:0}});
					break;
				default :
					_consoleLog("Error[fenApply]: invalid function name \""+fn_name+"\"");
			}
			
			if(board_created){
				removeBoard(board);
			}
			
			return rtn;
		}
		
		//p = {skipFenValidation}
		function fenGet(fen, props, p){
			var i, j, len, len2, board, board_created, board_keys, current_key, invalid_key, keep_going, rtn_pre, rtn;
			
			rtn=null;
			p=_unreferenceP(p);
			board_created=false;
			keep_going=true;
			
			//if(keep_going){
				board=initBoard({
					boardName : "board_fenGet",
					fen : fen,
					skipFenValidation : p.skipFenValidation,
					isHidden : true,
					validOrBreak : true
				});
				
				if(board===null){
					keep_going=false;
					_consoleLog("Error[fenGet]: invalid FEN");
				}
			//}
			
			if(keep_going){
				board_created=true;
				
				board_keys=[];
				
				if(_isArray(props)){
					board_keys=props;
				}else if(_isNonBlankStr(props)){
					board_keys=_trimSpaces(props).split(" ");
				}
				
				if(!board_keys.length){
					board_keys=_MUTABLE_KEYS.slice(0);
				}
				
				rtn_pre={};
				
				for(i=0, len=board_keys.length; i<len; i++){//0<len
					current_key=_formatName(board_keys[i]);
					
					if(current_key && (typeof rtn_pre[current_key])==="undefined"){
						invalid_key=true;
						
						for(j=0, len2=_MUTABLE_KEYS.length; j<len2; j++){//0<len2
							if(current_key===_MUTABLE_KEYS[j]){
								invalid_key=false;
								rtn_pre[current_key]=board[current_key];
								
								break;
							}
						}
						
						if(invalid_key){
							keep_going=false;
							_consoleLog("Error[fenGet]: invalid property name \""+current_key+"\"");
							
							break;
						}
					}
				}
			}
			
			if(keep_going){
				rtn=rtn_pre;
			}
			
			if(board_created){
				removeBoard(board);
			}
			
			return rtn;
		}
		
		function getBoardNames(){
			return Object.keys(_BOARDS);
		}
		
		return {
			version : _VERSION,
			setSilentMode : setSilentMode,
			isLegalFen : isLegalFen,
			getBoard : getBoard,
			toVal : toVal,
			toAbsVal : toAbsVal,
			toBal : toBal,
			toAbsBal : toAbsBal,
			toClassName : toClassName,
			toBos : toBos,
			toPos : toPos,
			getSign : getSign,
			getRankPos : getRankPos,
			getFilePos : getFilePos,
			getRankBos : getRankBos,
			getFileBos : getFileBos,
			isInsideBoard : isInsideBoard,
			sameSquare : sameSquare,
			countPieces : countPieces,
			removeBoard : removeBoard,
			isEqualBoard : isEqualBoard,
			cloneBoard : cloneBoard,
			initBoard : initBoard,
			fenApply : fenApply,
			fenGet : fenGet,
			getBoardNames : getBoardNames,
			utilityMisc : {
				consoleLog : _consoleLog,
				isObject : _isObject,
				isArray : _isArray,
				isSquare : _isSquare,
				isBoard : _isBoard,
				isMove : _isMove,
				trimSpaces : _trimSpaces,
				formatName : _formatName,
				strContains : _strContains,
				occurrences : _occurrences,
				toInt : _toInt,
				isIntOrStrInt : _isIntOrStrInt,
				isNonEmptyStr : _isNonEmptyStr,
				isNonBlankStr : _isNonBlankStr,
				hashCode : _hashCode,
				castlingChars : _castlingChars,
				unreferenceP : _unreferenceP,
				cleanSan : _cleanSan,
				cloneBoardObjs : _cloneBoardObjs,
				basicFenTest : _basicFenTest,
				perft : _perft
			}
		};
	})(windw);
	
	//Browser
	if(windw!==null){
		if(!windw.Ic){
			windw.Ic=Ic;
		}
	}
	
	//Node.js or any CommonJS
	if(expts!==null){
		if(!expts.Ic){
			expts.Ic=Ic;
		}
	}
	
	//RequireJS environment
	if((typeof defin)==="function" && defin.amd){
		defin(function(){
			return Ic;
		});
	}
})(((typeof window)!=="undefined" ? window : null), ((typeof exports)!=="undefined" ? exports : null), ((typeof define)!=="undefined" ? define : null));
