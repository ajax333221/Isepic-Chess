/** Copyright (c) 2012 Ajax Isepic (ajax333221) Licensed MIT */var AbcLabels="abcdefgh";var PiecesNames="*pnbrqk";//W=(p:1)(n:2)(b:3)(r:4)(q:5)(k:6), B=(...)*-1var DefaultFen="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";var ChessBoard,Fen;var ActiveColor;//(f:white)(t:black)var ActiveChecks;//(num:checks)var WCastling,BCastling;//(0:no avility)(1:short)(2:long)(3:both)var EnPassantBos;//("":empty)("a1":square)var HalfMove,FullMove;//(num)var WKingPos,BKingPos;//([0-7,0-7])var FromBos;function preFenValidation(complete_fen){	var i,j,len,rexp,ranks,piece_char,num_pieces,fen_parts,fen_first,fen_len,num_files,promotion_ranks,keep_going,rtn_is_legal;		rtn_is_legal=false;		if(complete_fen){		fen_parts=complete_fen.split(" ",6);				if(fen_parts.length>3){			fen_first=fen_parts[0];			ranks=fen_first.split("/");						if(ranks.length==8){				fen_len=fen_first.length;								if(((fen_len-fen_first.replace(/K/g,"").length)==1)&&((fen_len-fen_first.replace(/k/g,"").length)==1)){					promotion_ranks=ranks[0]+""+ranks[7];										if(promotion_ranks.replace(/p/gi,"").length==promotion_ranks.length){						keep_going=true;												for(i=8;i--;){//7...0							num_files=0;														for(j=0,len=ranks[i].length;j<len;j++){//0<len								num_files+=(ranks[i].charAt(j)*1)||1;							}														if(num_files!=8){								keep_going=false;								break;							}						}												if(keep_going){							for(i=2;i--;){//1...0								num_pieces=new Array(5);																for(j=5;j--;){//4...0									piece_char=PiecesNames.charAt(j+1);									if(i){piece_char=piece_char.toUpperCase();}																		rexp=new RegExp(piece_char,"g");									num_pieces[j]=fen_len-(fen_first.replace(rexp,"").length);								}																if(!((num_pieces[0]<9)&&((Math.max(num_pieces[1]-2,0)+Math.max(num_pieces[2]-2,0)+Math.max(num_pieces[3]-2,0)+Math.max(num_pieces[4]-1,0))<=(8-num_pieces[0])))){									keep_going=false;									break;								}							}														if(keep_going){								rtn_is_legal=true;							}						}					}				}			}		}	}		return rtn_is_legal;}function postFenValidation(){	var i,j,k,temp,temp2,temp3,keep_going,enpass_pos,castling_availity,king_rank,enpass_rank,enpass_file,fen_first,num_pawns,missing_capturables,min_captured,min_captured_holder,castle_holder,rtn_is_legal;		rtn_is_legal=false;		if(WKingPos&&BKingPos){		if((getValue(WKingPos)==6)&&(getValue(BKingPos)==-6)){			if(ActiveChecks<3){				toggleActiveColor();				keep_going=!countChecks(true);				toggleActiveColor();								if(keep_going){					if(EnPassantBos){						keep_going=false;						enpass_pos=bosToPos(EnPassantBos);						enpass_rank=enpass_pos[0];						enpass_file=enpass_pos[1];												if(!getValue(enpass_pos)){							if(ActiveColor){								temp=5;								temp2=1;							}else{								temp=2;								temp2=-1;							}														if(enpass_rank==temp&&!getValue([enpass_rank+temp2,enpass_file])&&(getValue([enpass_rank+(-temp2),enpass_file])==temp2)){								keep_going=true;							}						}					}										if(keep_going){						fen_first=Fen.split(" ")[0];												for(i=2;i--;){//1...0							missing_capturables=15-(fen_first.length-(fen_first.replace((i?/p|n|b|r|q/g:/P|N|B|R|Q/g),"").length));							min_captured=0;														for(j=8;j--;){//7...0								min_captured_holder=((j==7)||!j)?[1,3,6,10,99]:[1,2,4,6,9];								temp3="..";																for(k=8;k--;){//7...0									temp3+=(getValue([k,j])||"")+"..";								}																num_pawns=temp3.match(i?/\.1\./g:/\.-1\./g);								num_pawns=(num_pawns?num_pawns.length:0);																if(num_pawns>1){									min_captured+=min_captured_holder[num_pawns-2];								}							}														if(min_captured>missing_capturables){								keep_going=false;								break;							}						}												if(keep_going){							for(i=2;i--;){//1...0								castle_holder=i?[0,-6,-4,BCastling]:[7,6,4,WCastling];								king_rank=castle_holder[0];								castling_availity=castle_holder[3];																if(castling_availity){									if(getValue([king_rank,4])!=castle_holder[1]){										keep_going=false;									}else if((castling_availity==1||castling_availity==3)&&(getValue([king_rank,7])!=castle_holder[2])){										keep_going=false;									}else if((castling_availity>1)&&(getValue([king_rank,0])!=castle_holder[2])){										keep_going=false;									}								}																if(!keep_going){									break;								}							}														if(keep_going){								rtn_is_legal=true;							}						}					}				}			}		}	}		return rtn_is_legal;}function countChecks(early_break){	var i,j,rtn_num_checks;		rtn_num_checks=0;		outer:	for(i=2;i--;){//1...0		for(j=9;--j;){//8...1			if(testCollision((ActiveColor?BKingPos:WKingPos),j,null,!i,true,true,null)[1]){				rtn_num_checks++;								if(early_break){					break outer;				}			}		}	}		return rtn_num_checks;}function setKingPos(new_pos){	//updates: (W/B)KingPos	if(ActiveColor){		BKingPos=new_pos;	}else{		WKingPos=new_pos;	}}function toggleActiveColor(){	//updates: ActiveColor	ActiveColor=!ActiveColor;}function bosToPos(bos){	return [Math.abs((bos.charAt(1)*1)-8),AbcLabels.indexOf(bos.charAt(0))];}function posToBos(pos){	return (AbcLabels.charAt(pos[1])+""+Math.abs(pos[0]-8));}function getValue(pos){	return ChessBoard[pos[0]][pos[1]];}function setValue(pos,new_val){	ChessBoard[pos[0]][pos[1]]=new_val;}function insideBoard(pos){	return ((pos[0]<8&&pos[0]>-1)&&(pos[1]<8&&pos[1]>-1));}function emptyBoard(){	//updates: ChessBoard	var i;		ChessBoard=new Array(8);		for(i=8;i--;){//7...0		ChessBoard[i]=[0,0,0,0,0,0,0,0];	}}function writeBoard(complete_fen){	var i,j,square_color,html_board;		if(!$("#xchessboard").length){		html_board="<div id='xchessboard'><table cellpadding='0' cellspacing='0'><tbody>";		square_color=true;				for(i=0;i<8;i++){//0...7			html_board+="<tr>";						for(j=0;j<8;j++){//0...7				html_board+="<td class='"+(square_color?"w":"b")+"s' id='"+posToBos([i,j])+"'></td>";				square_color=!square_color;			}						square_color=!square_color;			html_board+="</tr>";		}				html_board+="</tbody></table><input id='xfen' type='text' /><textarea id='xpgn'></textarea>promote to:<select id='xpromote'><option selected='selected' value='5'>queen</option><option value='4'>rook</option><option value='3'>bishop</option><option value='2'>knight</option></select></div>";				$("body").append(html_board);	}		setFEN(complete_fen);}function setFEN(complete_fen){	//updates: ChessBoard, ActiveColor, (W/B)Castling, EnPassantBos, (Half/Full)Move	var i,j,len,temp,temp2,ranks,current_file,skip_files,piece_char,fen_parts;		emptyBoard();		complete_fen=preFenValidation(complete_fen)?complete_fen:DefaultFen;	fen_parts=complete_fen.split(" ");	ranks=fen_parts[0].split("/");		for(i=8;i--;){//7...0		current_file=0;				for(j=0,len=ranks[i].length;j<len;j++){//0<len			temp=ranks[i].charAt(j);			skip_files=temp*1;						if(skip_files){				current_file+=skip_files;			}else{				piece_char=temp.toLowerCase();				setValue([i,current_file],(PiecesNames.indexOf(piece_char)*(temp==piece_char?-1:1)));				current_file++;			}		}	}		ActiveColor=(fen_parts[1]=="b");		temp2=fen_parts[2];	WCastling=(~temp2.indexOf("K")?1:0)+(~temp2.indexOf("Q")?2:0);	BCastling=(~temp2.indexOf("k")?1:0)+(~temp2.indexOf("q")?2:0);		EnPassantBos=fen_parts[3].replace("-","");		HalfMove=(fen_parts[4]*1)||0;	FullMove=(fen_parts[5]*1)||1;		refreshBoard();		if(!postFenValidation()){		setFEN(null);	}}function refreshBoard(){	//updates: Fen, (W/B)KingPos, ActiveChecks	var i,j,piece_char,current_pos,current_val,current_abs_val,current_square_elm,empty_squares,new_fen,castling_holder,multi_holder,mini_holder;		castling_holder=["","k","q","kq"];	multi_holder=ActiveColor?[" dra","","b"]:[""," dra","w"];	new_fen="";	WKingPos=null;	BKingPos=null;		for(i=0;i<8;i++){//0...7		empty_squares=0;				for(j=0;j<8;j++){//0...7			current_pos=[i,j];						current_val=getValue(current_pos);			current_abs_val=Math.abs(current_val);			current_square_elm=$("#"+posToBos(current_pos));						if(current_val){				mini_holder=(current_val<0)?["b",multi_holder[0],false]:["w",multi_holder[1],true];								if(empty_squares){					new_fen+=""+empty_squares;					empty_squares=0;				}								if(current_abs_val==6){					if(mini_holder[2]){						WKingPos=current_pos;					}else{						BKingPos=current_pos;					}				}								piece_char=PiecesNames.charAt(current_abs_val);				current_square_elm.html("<div class='"+mini_holder[0]+piece_char+""+mini_holder[1]+"'></div>");				new_fen+=""+(mini_holder[2]?piece_char.toUpperCase():piece_char);			}else{				current_square_elm.html("");				empty_squares++;			}		}				if(empty_squares){			new_fen+=""+empty_squares;		}				new_fen+="/";	}		Fen=new_fen.slice(0,-1)+" "+multi_holder[2]+" "+((castling_holder[WCastling].toUpperCase()+""+castling_holder[BCastling])||"-")+" "+(EnPassantBos||"-")+" "+HalfMove+" "+FullMove;		ActiveChecks=countChecks(false);		createDraggables();		$("#xfen").val(Fen);}function testCollision(initial_pos,piece_direction,num_squares,is_knight,prevent_capture,request_is_attacked,ally_val){	var i,temp,current_rank,current_file,current_pos,current_val,current_abs_val,move_rank_by,move_file_by,movement_holder,rtn_arr_pos,rtn_is_attacked,rtn_ally_pos;		rtn_arr_pos=[];	rtn_is_attacked=false;	rtn_ally_pos=[];	num_squares=(is_knight?1:(num_squares||7));		movement_holder=is_knight?[[-2,1],[-1,2],[1,2],[2,1],[2,-1],[1,-2],[-1,-2],[-2,-1]]:[[-1,0],[-1,1],[0,1],[1,1],[1,0],[1,-1],[0,-1],[-1,-1]];		temp=movement_holder[piece_direction-1];	move_rank_by=temp[0];	move_file_by=temp[1];		current_rank=initial_pos[0];	current_file=initial_pos[1];		for(i=0;i<num_squares;i++){//0<num_squares		current_rank+=move_rank_by;		current_file+=move_file_by;		current_pos=[current_rank,current_file];				if(!insideBoard(current_pos)){			break;		}				current_val=getValue(current_pos);		current_abs_val=Math.abs(current_val);				if(current_val){			if((ActiveColor&&current_val>0)||(!ActiveColor&&current_val<0)){				if(request_is_attacked){					if(is_knight){						if(current_abs_val==2){//knight							rtn_is_attacked=true;						}					}else if(current_abs_val==5){//queen						rtn_is_attacked=true;					}else if(current_abs_val==6){//king						if(!i){							rtn_is_attacked=true;						}					}else if(piece_direction%2){						if(current_abs_val==4){//rook							rtn_is_attacked=true;						}					}else if(current_abs_val==3){//bishop						rtn_is_attacked=true;					}else if(!i&&current_abs_val==1){						if(~current_val){//w_pawn							if(piece_direction==4||piece_direction==6){								rtn_is_attacked=true;							}						}else{//b_pawn							if(piece_direction==2||piece_direction==8){								rtn_is_attacked=true;							}						}					}				}								if(!prevent_capture&&current_abs_val!=6){					rtn_arr_pos.push(current_pos);				}			}else if(Math.abs(ally_val)==current_abs_val){				rtn_ally_pos=current_pos;			}						break;		}else{			rtn_arr_pos.push(current_pos);		}	}		return [rtn_arr_pos,rtn_is_attacked,rtn_ally_pos];}function legalMoves(piece_pos,piece_val){	var i,j,len,len2,temp,facing_rank,current_adjacent_file,piece_abs_val,backup_val,current_pos,diagonal_pawn_pos,current_val,enpass_pos,pre_validated_arr_pos,castling_availity,can_castle,castle_holder,loop_holder,pawn_holder,rtn_validated_arr_pos;		pre_validated_arr_pos=[];	rtn_validated_arr_pos=[];	piece_abs_val=Math.abs(piece_val);		if(piece_abs_val==6){//king		for(i=9;--i;){//8...1			if((temp=testCollision(piece_pos,i,1,false,false,false,null)[0]).length){pre_validated_arr_pos.push(temp);}		}				castle_holder=ActiveColor?[BCastling,8,0,BKingPos]:[WCastling,1,7,WKingPos];		castling_availity=castle_holder[0];				if(castling_availity&&!ActiveChecks&&posToBos(piece_pos)==("e"+castle_holder[1])){			for(i=2;i--;){//1...0				loop_holder=i?[2,7,3,4,2]:[1,3,2,7,6];								if(castling_availity==3||castling_availity==loop_holder[0]){					if(testCollision(piece_pos,loop_holder[1],loop_holder[2],false,true,false,null)[0].length==loop_holder[2]){						can_castle=true;												for(j=loop_holder[3]-2;j<loop_holder[3];j++){//5...6 or 2...3							setKingPos([castle_holder[2],j]);														if(countChecks(true)){								can_castle=false;								break;							}						}												if(can_castle){							pre_validated_arr_pos.push([[castle_holder[2],loop_holder[4]]]);						}					}				}			}						setKingPos(castle_holder[3]);		}	}else if(piece_abs_val==5){//queen		for(i=9;--i;){//8...1			if((temp=testCollision(piece_pos,i,null,false,false,false,null)[0]).length){pre_validated_arr_pos.push(temp);}		}	}else if(piece_abs_val==4){//rook		for(i=9;--i;){//7,5,3,1			if((temp=testCollision(piece_pos,--i,null,false,false,false,null)[0]).length){pre_validated_arr_pos.push(temp);}		}	}else if(piece_abs_val==3){//bishop		for(i=9;--i;){//8,6,4,2			if((temp=testCollision(piece_pos,i--,null,false,false,false,null)[0]).length){pre_validated_arr_pos.push(temp);}		}	}else if(piece_abs_val==2){//knight		for(i=9;--i;){//8...1			if((temp=testCollision(piece_pos,i,null,true,false,false,null)[0]).length){pre_validated_arr_pos.push(temp);}		}	}else{//pawn		pawn_holder=ActiveColor?[1,5,1,5]:[6,1,-1,2];				if((temp=testCollision(piece_pos,pawn_holder[1],((piece_pos[0]==pawn_holder[0])?2:1),false,true,false,null)[0]).length){pre_validated_arr_pos.push(temp);}				facing_rank=(piece_pos[0]+pawn_holder[2]);				for(i=2;i--;){//1...0			current_adjacent_file=piece_pos[1]+(i?1:-1);			diagonal_pawn_pos=[facing_rank,current_adjacent_file];						if(insideBoard(diagonal_pawn_pos)){				current_val=getValue(diagonal_pawn_pos)*pawn_holder[2];								if(current_val>0&&current_val!=6){					pre_validated_arr_pos.push([diagonal_pawn_pos]);				}else if(facing_rank==pawn_holder[3]&&EnPassantBos){					enpass_pos=bosToPos(EnPassantBos);										if(enpass_pos[0]==facing_rank&&enpass_pos[1]==current_adjacent_file){						pre_validated_arr_pos.push([diagonal_pawn_pos]);					}				}			}		}	}		for(i=0,len=pre_validated_arr_pos.length;i<len;i++){//0<len		for(j=0,len2=pre_validated_arr_pos[i].length;j<len2;j++){//0<len2			current_pos=pre_validated_arr_pos[i][j];			backup_val=getValue(current_pos);						setValue(piece_pos,0);			setValue(current_pos,piece_val);						if(piece_abs_val==6){				setKingPos(current_pos);			}						if(!countChecks(true)){				rtn_validated_arr_pos.push(current_pos);			}						setValue(piece_pos,piece_val);			setValue(current_pos,backup_val);						if(piece_abs_val==6){				setKingPos(piece_pos);			}		}	}		return rtn_validated_arr_pos;}function draggableStart(){	//updates: FromBos	var i,len,initial_pos,candidates;		FromBos=$(this).parent().attr("id");	initial_pos=bosToPos(FromBos);	candidates=legalMoves(initial_pos,getValue(initial_pos));		for(i=0,len=candidates.length;i<len;i++){//0<len		$("#"+posToBos(candidates[i])).droppable({			drop:function(ev,ui){				var destination_square_elm,capturable_piece_elm;								destination_square_elm=$(this);				capturable_piece_elm=$("#"+destination_square_elm.attr("id")+" div");								if(capturable_piece_elm.length){					capturable_piece_elm.remove();				}								ui.draggable.removeAttr("style").appendTo(destination_square_elm);			}		}).addClass("highlight");	}}function draggableStop(){	//updates: ChessBoard, (W/B)Castling, EnPassantBos, (Half/Full)Move	var pgn_string_num,pgn_move,pawn_moved,promoted_val,piece_moved,piece_moved_class,piece_val,from_pos,to_pos,destination_bos,destination_file_char,destination_rank_char,new_enpass_bos,new_active_castling_availity,new_nonactive_castling_availity,king_castled,pawn_promoted,multi_holder;		$("td.highlight").droppable("destroy").removeClass("highlight");		piece_moved=$(this);	piece_moved_class=" "+piece_moved.attr("class")+" ";	destination_bos=piece_moved.parent().attr("id");		if(destination_bos!=FromBos){		pawn_moved=false;		pawn_promoted=false;		promoted_val=null;		multi_holder=ActiveColor?["b",8,[0,3],[0,5],-4,[0,0],[0,7],[7,6,5,4],BCastling,"1",-1,WCastling,1]:["w",1,[7,3],[7,5],4,[7,0],[7,7],[2,3,4,5],WCastling,"8",1,BCastling,8];		new_enpass_bos="";		new_active_castling_availity=multi_holder[8];		new_nonactive_castling_availity=multi_holder[11];		piece_val=null;		king_castled=null;				from_pos=bosToPos(FromBos);		to_pos=bosToPos(destination_bos);				if(~piece_moved_class.indexOf(" "+multi_holder[0]+"p ")){//pawn			piece_val=1;			pawn_moved=true;			destination_file_char=destination_bos.charAt(0);			destination_rank_char=destination_bos.charAt(1);						if(FromBos.charAt(1)==multi_holder[7][0]&&destination_rank_char==multi_holder[7][2]){//new enpass				new_enpass_bos=(destination_file_char+""+multi_holder[7][1]);			}else if(destination_bos==EnPassantBos){//pawn x enpass				setValue(bosToPos(destination_file_char+""+multi_holder[7][3]),0);			}else if(destination_rank_char==multi_holder[9]){//promotion				pawn_promoted=true;				promoted_val=($("#xpromote").val()*multi_holder[10]);			}		}else if(~piece_moved_class.indexOf(" "+multi_holder[0]+"n ")){//knight			piece_val=2;		}else if(~piece_moved_class.indexOf(" "+multi_holder[0]+"b ")){//bishop			piece_val=3;		}else if(~piece_moved_class.indexOf(" "+multi_holder[0]+"r ")){//rook			piece_val=4;						if(new_active_castling_availity){				if(FromBos==("h"+multi_holder[1])&&new_active_castling_availity!=2){//short					new_active_castling_availity--;				}else if(FromBos==("a"+multi_holder[1])&&new_active_castling_availity!=1){//long					new_active_castling_availity-=2;				}			}		}else if(~piece_moved_class.indexOf(" "+multi_holder[0]+"q ")){//queen			piece_val=5;		}else if(~piece_moved_class.indexOf(" "+multi_holder[0]+"k ")){//king			piece_val=6;			new_active_castling_availity=0;						if(FromBos==("e"+multi_holder[1])){				if(destination_bos==("g"+multi_holder[1])){//short					king_castled=1;					setValue(multi_holder[3],multi_holder[4]);					setValue(multi_holder[6],0);				}else if(destination_bos==("c"+multi_holder[1])){//long					king_castled=2;					setValue(multi_holder[2],multi_holder[4]);					setValue(multi_holder[5],0);				}			}		}				pgn_string_num=ActiveColor?"":(FullMove+".");/*if no moves and 'b', use 1...*/		pgn_move=getMove(from_pos,to_pos,(piece_val*multi_holder[10]),(pawn_promoted?promoted_val:null),king_castled);				HalfMove++;		if(pawn_moved||getValue(to_pos)){			HalfMove=0;		}				if(new_nonactive_castling_availity){/*DRY loop x2 usando if piece_val=4 en una, la otra de cajon?*/			if(destination_bos==("h"+multi_holder[12])&&new_nonactive_castling_availity!=2){				new_nonactive_castling_availity--;			}else if(destination_bos==("a"+multi_holder[12])&&new_nonactive_castling_availity!=1){				new_nonactive_castling_availity-=2;			}		}				if(ActiveColor){			FullMove++;			BCastling=new_active_castling_availity;			WCastling=new_nonactive_castling_availity;		}else{			WCastling=new_active_castling_availity;			BCastling=new_nonactive_castling_availity;		}				EnPassantBos=new_enpass_bos;				setValue(to_pos,(pawn_promoted?promoted_val:getValue(from_pos)));		setValue(from_pos,0);				toggleActiveColor();		refreshBoard();				$("#xpgn").val($("#xpgn").val()+""+pgn_string_num+pgn_move+(ActiveChecks?"+":"")+" ");/*add # when checkmate*/	}}function createDraggables(){	$(".dra").draggable({		cursorAt:{top:21,left:21},		revert:"invalid",		revertDuration:0,		zIndex:100,		scroll:false,		start:draggableStart,		stop:draggableStop	});}function getMove(initial_pos,final_pos,piece_val,promotion_val,castling_val){	var i,len,temp,temp2,temp3,piece_abs_val,initial_bos,initial_file_char,initial_rank_char,destination_bos,destination_file_char,collition_bos,ambiguity,is_knight,rtn_new_move;		rtn_new_move="";	initial_bos=posToBos(initial_pos);	initial_file_char=initial_bos.charAt(0);	initial_rank_char=initial_bos.charAt(1);		destination_bos=posToBos(final_pos);	destination_file_char=destination_bos.charAt(0);		piece_abs_val=Math.abs(piece_val);		if(piece_abs_val==1){//pawn		if(initial_file_char!=destination_file_char){			rtn_new_move+=(initial_file_char+"x");		}				rtn_new_move+=destination_bos;				if(promotion_val){			rtn_new_move+="="+PiecesNames.charAt(Math.abs(promotion_val)).toUpperCase();		}	}else if(castling_val){//castling king		rtn_new_move+=(castling_val==1?"O-O":"O-O-O");	}else{//knight, bishop, rook, queen, non-castling king		rtn_new_move+=PiecesNames.charAt(piece_abs_val).toUpperCase();				if(piece_abs_val!=6){			temp2=[];			is_knight=(piece_abs_val==2);						for(i=(piece_abs_val!=3?9:1);--i;){//7,5,3,1				if((temp=testCollision(final_pos,--i,null,is_knight,false,false,piece_val)[2]).length){temp2.push(temp);}			}						for(i=(piece_abs_val!=4?9:1);--i;){//8,6,4,2				if((temp=testCollision(final_pos,i--,null,is_knight,false,false,piece_val)[2]).length){temp2.push(temp);}			}						len=temp2.length;			if(len>1){				temp3="";								for(i=0;i<len;i++){//0<len					collition_bos=posToBos(temp2[i]);										if(collition_bos!=initial_bos){						if(~(legalMoves(temp2[i],piece_val).join("")).indexOf(final_pos.join())){							temp3+=collition_bos;						}					}				}								ambiguity=(!!(~temp3.indexOf(initial_file_char))*1)+(!!(~temp3.indexOf(initial_rank_char))*2);								if(!ambiguity||ambiguity==2){					rtn_new_move+=initial_file_char;				}else if(ambiguity==1){					rtn_new_move+=initial_rank_char;				}else{					rtn_new_move+=(initial_file_char+""+initial_rank_char);				}			}		}				if(getValue(final_pos)){			rtn_new_move+="x";		}				rtn_new_move+=destination_bos;	}		return rtn_new_move;}