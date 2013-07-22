/** Copyright (c) 2012 Ajax Isepic (ajax333221) Licensed MIT */var AbcLabels="abcdefgh";var PiecesNames="*pnbrqk";function fixSpacing(rtn_string){	return rtn_string.replace(/^\s+|\s+$/g,"").replace(/\s\s+/g," ");}function bosToPos(bos){	return [(8-(bos.charAt(1)*1)),AbcLabels.indexOf(bos.charAt(0))];}function posToBos(pos){	return (AbcLabels.charAt(pos[1])+""+(8-pos[0]));}function insideBoard(pos){	return ((pos[0]<8&&pos[0]>-1)&&(pos[1]<8&&pos[1]>-1));}function getValue(pos,obj){	return obj.ChessBoard[pos[0]][pos[1]];}function setValue(pos,new_val,obj){	obj.ChessBoard[pos[0]][pos[1]]=new_val;}function toggleActiveColor(obj){	obj.ActiveColor=!obj.ActiveColor;}function setKingPos(new_pos,obj){	if(obj.ActiveColor){		obj.BKingPos=new_pos;	}else{		obj.WKingPos=new_pos;	}}function countChecks(early_break,obj){	var i,j,king_pos,rtn_num_checks;		rtn_num_checks=0;	king_pos=obj.ActiveColor?obj.BKingPos:obj.WKingPos;		outer:	for(i=2;i--;){//1...0		for(j=9;--j;){//8...1			if(testCollision(king_pos,j,null,!i,false,true,null,obj)[1]){				rtn_num_checks++;								if(early_break){					break outer;				}			}		}	}		return rtn_num_checks;}function cornerRookTest(rtn_castling_avility,corner_bos,promotion_rank){	if(rtn_castling_avility){		if(corner_bos==("h"+promotion_rank)&&rtn_castling_avility!=2){//short			rtn_castling_avility--;		}else if(corner_bos==("a"+promotion_rank)&&rtn_castling_avility>1){//long			rtn_castling_avility-=2;		}	}		return rtn_castling_avility;}function displayBoard(obj,is_rotated){	var i,j,tmp,tmp2,current_pos,castling_holder,square_color,html_board;		castling_holder=["-","k","q","kq"];		html_board="<table cellpadding='0' cellspacing='0'><tbody>";	square_color=true;		for(i=0;i<8;i++){//0...7		html_board+="<tr>";				for(j=0;j<8;j++){//0...7			current_pos=(is_rotated?[(7-i),(7-j)]:[i,j]);			tmp=getValue(current_pos,obj);						html_board+="<td class='"+(square_color?"w":"b")+"s "+((tmp<0?"b":"w")+""+PiecesNames.charAt(Math.abs(tmp)))+"' id='"+posToBos(current_pos)+"'></td>";			square_color=!square_color;		}				html_board+="</tr>";		square_color=!square_color;	}		html_board+="</tbody></table>";		/*rewrite this v*/	html_board+="<input id='xfen' type='text' value='"+obj.Fen+"' />"	+"<br><pre style='display:inline;'>to move:</pre> <span style='color:#546AC1;'>"+(obj.ActiveColor?"b":"w")+"</span>"	+"<br><pre style='display:inline;'>active checks:</pre> <span style='color:#546AC1;'>"+obj.ActiveChecks+"</span>"	+"<br><pre style='display:inline;'>en passant:</pre> <span style='color:#546AC1;'>"+(obj.EnPassantBos||"-")+"</span>"	+"<br><pre style='display:inline;'>w_castling:</pre> <span style='color:#546AC1;'>"+(castling_holder[obj.WCastling].toUpperCase())+"</span>"	+"<br><pre style='display:inline;'>b_castling:</pre> <span style='color:#546AC1;'>"+(castling_holder[obj.BCastling])+"</span>"	+"<br><pre style='display:inline;'>w_king pos:</pre> <span style='color:#546AC1;'>"+posToBos(obj.WKingPos)+"</span>"	+"<br><pre style='display:inline;'>b_king pos:</pre> <span style='color:#546AC1;'>"+posToBos(obj.BKingPos)+"</span>"	+"<br><pre style='display:inline;'>half moves:</pre> <span style='color:#546AC1;'>"+obj.HalfMove+"</span>"	+"<br><pre style='display:inline;'>full moves:</pre> <span style='color:#546AC1;'>"+obj.FullMove+"</span>";		tmp2=$("#xchessboard");		if(!tmp2.length){		$("body").append("<div id='xchessboard'>"+html_board+"</div>");	}else{		tmp2.html(html_board);	}}function initBoard(nam,complete_fen){	var i,j,len,temp,temp2,target_board,ranks,current_file,skip_files,piece_char,fen_parts;		window[nam]={		ChessBoard:null,		Fen:null,		ActiveColor:null,		ActiveChecks:null,		WCastling:null,		BCastling:null,		EnPassantBos:null,		HalfMove:null,		FullMove:null,		WKingPos:null,		BKingPos:null	};		target_board=window[nam];		target_board.ChessBoard=new Array(8);		for(i=8;i--;){//7...0		target_board.ChessBoard[i]=[0,0,0,0,0,0,0,0];	}		if(typeof complete_fen!=="string"){		complete_fen="";	}		complete_fen=fixSpacing(complete_fen);	fen_parts=(preFenValidation(complete_fen)?complete_fen:"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1").split(" ");	ranks=fen_parts[0].split("/");		for(i=8;i--;){//7...0		current_file=0;				for(j=0,len=ranks[i].length;j<len;j++){//0<len			temp=ranks[i].charAt(j);			skip_files=(temp*1);						if(!skip_files){				piece_char=temp.toLowerCase();				setValue([i,current_file],(PiecesNames.indexOf(piece_char)*(temp==piece_char?-1:1)),target_board);			}						current_file+=(skip_files||1);						//old:			//			//if(skip_files){			//	current_file+=skip_files;			//}else{			//	piece_char=temp.toLowerCase();			//	setValue([i,current_file],(PiecesNames.indexOf(piece_char)*(temp==piece_char?-1:1)),target_board);			//	current_file++;			//}		}	}		target_board.ActiveColor=(fen_parts[1]=="b");		temp2=fen_parts[2];	target_board.WCastling=(~temp2.indexOf("K")?1:0)+(~temp2.indexOf("Q")?2:0);	target_board.BCastling=(~temp2.indexOf("k")?1:0)+(~temp2.indexOf("q")?2:0);		target_board.EnPassantBos=fen_parts[3].replace("-","");		target_board.HalfMove=(fen_parts[4]*1)||0;	target_board.FullMove=(fen_parts[5]*1)||1;		nodomTest(target_board);		if(!postFenValidation(target_board)){		initBoard(nam,null);	}}function nodomTest(obj){	var i,j,piece_char,current_pos,current_val,current_abs_val,empty_squares,new_fen_first,castling_holder,is_white;		castling_holder=["","k","q","kq"];	new_fen_first="";		for(i=0;i<8;i++){//0...7		empty_squares=0;				for(j=0;j<8;j++){//0...7			current_pos=[i,j];						current_val=getValue(current_pos,obj);			current_abs_val=Math.abs(current_val);						if(current_val){				is_white=(current_val>0);								if(empty_squares){					new_fen_first+=""+empty_squares;					empty_squares=0;				}								if(current_abs_val>5){//old: (x==6)					if(is_white){						obj.WKingPos=current_pos;					}else{						obj.BKingPos=current_pos;					}				}								piece_char=PiecesNames.charAt(current_abs_val);				new_fen_first+=""+(is_white?piece_char.toUpperCase():piece_char);			}else{				empty_squares++;			}		}				new_fen_first+=""+(empty_squares||"")+"/";//old: if(empty_squares){new_fen_first+=""+empty_squares;}new_fen_first+="/";	}		obj.Fen=(new_fen_first.slice(0,-1)+" "+(obj.ActiveColor?"b":"w")+" "+((castling_holder[obj.WCastling].toUpperCase()+""+castling_holder[obj.BCastling])||"-")+" "+(obj.EnPassantBos||"-")+" "+obj.HalfMove+" "+obj.FullMove);		obj.ActiveChecks=countChecks(false,obj);}function preFenValidation(complete_fen){	var i,j,len,temp,last_is_num,current_is_num,rexp,ranks,piece_char,num_pieces,fen_first,fen_first_len,num_files,keep_going,rtn_is_legal;		rtn_is_legal=false;		if(complete_fen){		if(/^([rnbqkRNBQK1-8]+\/)([rnbqkpRNBQKP1-8]+\/){6}([rnbqkRNBQK1-8]+)\s[bw]\s(-|K?Q?k?q?)\s(-|[a-h][36])/.test(complete_fen)){			fen_first=complete_fen.split(" ",1)[0];			fen_first_len=fen_first.length;						if(((fen_first_len-fen_first.replace(/K/g,"").length)==1)&&((fen_first_len-fen_first.replace(/k/g,"").length)==1)){				ranks=fen_first.split("/");								keep_going=true;								outer:				for(i=8;i--;){//7...0					num_files=0;					last_is_num=false;										for(j=0,len=ranks[i].length;j<len;j++){//0<len						temp=(ranks[i].charAt(j)*1);						current_is_num=!!temp;												if(last_is_num&&current_is_num){							keep_going=false;							break outer;						}												last_is_num=current_is_num;												num_files+=(temp||1);					}										if(num_files-8){//old: (x!=8)						keep_going=false;						break;					}				}								if(keep_going){					for(i=2;i--;){//1...0						num_pieces=new Array(5);												for(j=5;j--;){//4...0							piece_char=PiecesNames.charAt(j+1);							if(i){piece_char=piece_char.toUpperCase();}														rexp=new RegExp(piece_char,"g");							num_pieces[j]=fen_first_len-(fen_first.replace(rexp,"").length);						}												if(!((num_pieces[0]<9)&&((Math.max(num_pieces[1]-2,0)+Math.max(num_pieces[2]-2,0)+Math.max(num_pieces[3]-2,0)+Math.max(num_pieces[4]-1,0))<=(8-num_pieces[0])))){							keep_going=false;							break;						}					}										if(keep_going){						rtn_is_legal=true;					}				}			}		}	}		return rtn_is_legal;}function postFenValidation(obj){	var i,j,k,temp,temp2,temp3,keep_going,enpass_pos,castling_availity,king_rank,enpass_rank,enpass_file,fen_first,num_pawns,missing_capturables,min_captured,min_captured_holder,castle_holder,rtn_is_legal;		rtn_is_legal=false;		if(obj.WKingPos&&obj.BKingPos){		if((getValue(obj.WKingPos,obj)>5)&&(getValue(obj.BKingPos,obj)<-5)){//old: (y==6 && x==-6)			if(obj.ActiveChecks<3){				toggleActiveColor(obj);				keep_going=!countChecks(true,obj);				toggleActiveColor(obj);								if(keep_going){					if(obj.EnPassantBos){						keep_going=false;						enpass_pos=bosToPos(obj.EnPassantBos);						enpass_rank=enpass_pos[0];						enpass_file=enpass_pos[1];												if(!getValue(enpass_pos,obj)){							if(obj.ActiveColor){								temp=5;								temp2=1;							}else{								temp=2;								temp2=-1;							}														if(enpass_rank==temp&&!getValue([enpass_rank+temp2,enpass_file],obj)&&(getValue([enpass_rank+(-temp2),enpass_file],obj)==temp2)){								keep_going=true;							}						}					}										if(keep_going){						fen_first=obj.Fen.split(" ")[0];												for(i=2;i--;){//1...0							missing_capturables=15-(fen_first.length-(fen_first.replace((i?/p|n|b|r|q/g:/P|N|B|R|Q/g),"").length));							min_captured=0;														for(j=8;j--;){//7...0								min_captured_holder=((j>6)||!j)?[1,3,6,10,99]:[1,2,4,6,9];//old: (j==7 || j==0)								temp3="..";																for(k=8;k--;){//7...0									temp3+=(getValue([k,j],obj)||"")+"..";								}																num_pawns=temp3.match(i?/\.1\./g:/\.-1\./g);								num_pawns=(num_pawns?num_pawns.length:0);																if(num_pawns>1){									min_captured+=min_captured_holder[num_pawns-2];								}							}														if(min_captured>missing_capturables){								keep_going=false;								break;							}						}												if(keep_going){							for(i=2;i--;){//1...0								castle_holder=i?[0,-6,-4,obj.BCastling]:[7,6,4,obj.WCastling];								king_rank=castle_holder[0];								castling_availity=castle_holder[3];																if(castling_availity){									if(getValue([king_rank,4],obj)!=castle_holder[1]){										keep_going=false;									}else if(castling_availity!=2&&(getValue([king_rank,7],obj)!=castle_holder[2])){//old: (x==1 || x==3)										keep_going=false;									}else if((castling_availity>1)&&(getValue([king_rank,0],obj)!=castle_holder[2])){//old2: (x!=1), old: (x==2 || x==3)										keep_going=false;									}								}																if(!keep_going){									break;								}							}														if(keep_going){								rtn_is_legal=true;							}						}					}				}			}		}	}		return rtn_is_legal;}function testCollision(initial_pos,piece_direction,num_squares,is_knight,allow_capture,request_is_attacked,ally_val,obj){	var i,temp,current_rank,current_file,current_pos,current_val,current_abs_val,move_rank_by,move_file_by,movement_holder,rtn_arr_pos,rtn_is_attacked,rtn_ally_pos;		rtn_arr_pos=[];	rtn_is_attacked=false;	rtn_ally_pos=[];	num_squares=(is_knight?1:(num_squares||7));/*NO use math max 7, even if 999 the loop breaks on outside board*/		movement_holder=is_knight?[[-2,1],[-1,2],[1,2],[2,1],[2,-1],[1,-2],[-1,-2],[-2,-1]]:[[-1,0],[-1,1],[0,1],[1,1],[1,0],[1,-1],[0,-1],[-1,-1]];		temp=movement_holder[piece_direction-1];	move_rank_by=temp[0];	move_file_by=temp[1];		current_rank=initial_pos[0];	current_file=initial_pos[1];		for(i=0;i<num_squares;i++){//0<num_squares		current_rank+=move_rank_by;		current_file+=move_file_by;		current_pos=[current_rank,current_file];				if(!insideBoard(current_pos)){			break;		}				current_val=getValue(current_pos,obj);		current_abs_val=Math.abs(current_val);				if(current_val){			if((current_val*(obj.ActiveColor?1:-1))>0){//old: if((obj.ActiveColor&&current_val>0)||(!obj.ActiveColor&&current_val<0)){				if(request_is_attacked){					if(is_knight){						if(current_abs_val==2){//knight							rtn_is_attacked=true;						}					}else if(current_abs_val>5){//king, old: (x==6)						if(!i){							rtn_is_attacked=true;						}					}else if(current_abs_val>4){//queen, old: (x==5)						rtn_is_attacked=true;					}else if(piece_direction%2){						if(current_abs_val>3){//rook, old: (x==4)							rtn_is_attacked=true;						}										/*NO >2, we can collide with rooks*/					}else if(current_abs_val==3){//bishop						rtn_is_attacked=true;					}else if(!i&&current_abs_val<2){//old: (... && x==1)						if(~current_val){//w_pawn							if(piece_direction==4||piece_direction==6){								rtn_is_attacked=true;							}						}else{//b_pawn							/*NO merge in a single else if, the minimizer will do this*/							if(piece_direction<3||piece_direction>7){//old: (x==2 || x==8)								rtn_is_attacked=true;							}						}					}				}								if(allow_capture&&current_abs_val<6){//old: (... && x!=6)					rtn_arr_pos.push(current_pos);				}			}else if(Math.abs(ally_val)==current_abs_val){				rtn_ally_pos=current_pos;			}						break;		}else{			rtn_arr_pos.push(current_pos);		}	}		return [rtn_arr_pos,rtn_is_attacked,rtn_ally_pos];}function legalMoves(piece_pos,piece_val,obj){	var i,j,len,len2,temp,temp_board,facing_rank,current_adjacent_file,piece_abs_val,current_pos,diagonal_pawn_pos,current_val,enpass_pos,pre_validated_arr_pos,castling_availity,can_castle,is_king,is_knight,captured_en_passant,piece_rank,castle_holder,loop_holder,pawn_holder,rtn_validated_arr_pos;		pre_validated_arr_pos=[];	rtn_validated_arr_pos=[];	piece_abs_val=Math.abs(piece_val);	is_king=(piece_abs_val>5);/*NO mover adentro del if, es riesgoso, se usa afuera pero en teoria no deberia haber problemas pero...*///old: (x==6)	captured_en_passant="";		window["xlegal"]=JSON.parse(JSON.stringify(obj));	temp_board=window["xlegal"];		if(piece_abs_val){		if(is_king){//king			for(i=9;--i;){//8...1				if((temp=testCollision(piece_pos,i,1,false,true,false,null,temp_board)[0]).length){pre_validated_arr_pos.push(temp);}			}						castle_holder=temp_board.ActiveColor?[temp_board.BCastling,8,0,temp_board.BKingPos]:[temp_board.WCastling,1,7,temp_board.WKingPos];			castling_availity=castle_holder[0];						if(castling_availity&&!temp_board.ActiveChecks&&posToBos(piece_pos)==("e"+castle_holder[1])){				for(i=2;i--;){//1...0					loop_holder=i?[1,7,3,4,2]:[2,3,2,7,6];										if(castling_availity!=loop_holder[0]){						if(testCollision(piece_pos,loop_holder[1],loop_holder[2],false,false,false,null,temp_board)[0].length==loop_holder[2]){							can_castle=true;														for(j=loop_holder[3]-2;j<loop_holder[3];j++){//5...6 or 2...3								setKingPos([castle_holder[2],j],temp_board);																if(countChecks(true,temp_board)){									can_castle=false;									break;								}							}														if(can_castle){								pre_validated_arr_pos.push([[castle_holder[2],loop_holder[4]]]);							}						}					}				}								setKingPos(castle_holder[3],temp_board);/*do not undo? totally unnecessary*/			}		}else if(piece_abs_val<2){//pawn, old: (x==1)			pawn_holder=temp_board.ActiveColor?[1,5,1,5]:[6,1,-1,2];			piece_rank=piece_pos[0];						if((temp=testCollision(piece_pos,pawn_holder[1],((piece_rank==pawn_holder[0])+1),false,false,false,null,temp_board)[0]).length){pre_validated_arr_pos.push(temp);}//old: ((piece_rank==pawn_holder[0])?2:1)						facing_rank=(piece_rank+pawn_holder[2]);						for(i=2;i--;){//1...0				current_adjacent_file=piece_pos[1]+(i?1:-1);				diagonal_pawn_pos=[facing_rank,current_adjacent_file];								if(insideBoard(diagonal_pawn_pos)){					current_val=(getValue(diagonal_pawn_pos,temp_board)*pawn_holder[2]);										/*NO use (x && ...), we have negative numbers too*/					if(current_val>0&&current_val<6){//old2: (x>0 && x!=6), old: if(((temp_board.ActiveColor&&current_val>0)||(!temp_board.ActiveColor&&current_val<0))&&current_val!=6){						pre_validated_arr_pos.push([diagonal_pawn_pos]);					}else if(facing_rank==pawn_holder[3]&&temp_board.EnPassantBos){						enpass_pos=bosToPos(temp_board.EnPassantBos);												if(enpass_pos[0]==facing_rank&&enpass_pos[1]==current_adjacent_file){							captured_en_passant=posToBos([piece_rank,current_adjacent_file]);							pre_validated_arr_pos.push([diagonal_pawn_pos]);						}					}				}			}		}else{//queen, knight, rook and bishop			is_knight=(piece_abs_val<3);//old: (x==2)						for(i=(piece_abs_val-3?9:1);--i;){//7,5,3,1, old: (x!=3?9:1)				if((temp=testCollision(piece_pos,--i,null,is_knight,true,false,null,temp_board)[0]).length){pre_validated_arr_pos.push(temp);}			}						for(i=(piece_abs_val-4?9:1);--i;){//8,6,4,2, old: (x!=4?9:1)				if((temp=testCollision(piece_pos,i--,null,is_knight,true,false,null,temp_board)[0]).length){pre_validated_arr_pos.push(temp);}			}		}	}		for(i=0,len=pre_validated_arr_pos.length;i<len;i++){//0<len		for(j=0,len2=pre_validated_arr_pos[i].length;j<len2;j++){//0<len2			temp_board=JSON.parse(JSON.stringify(obj));			current_pos=pre_validated_arr_pos[i][j];						setValue(piece_pos,0,temp_board);			setValue(current_pos,piece_val,temp_board);						if(is_king){				setKingPos(current_pos,temp_board);			}else if(captured_en_passant&&(posToBos(current_pos)==temp_board.EnPassantBos)){				setValue(bosToPos(captured_en_passant),0,temp_board);			}						if(!countChecks(true,temp_board)){				rtn_validated_arr_pos.push(current_pos);			}		}	}		/*temp_board=null?*/		return rtn_validated_arr_pos;}function simulateMove(initial_pos,final_pos,obj){/*proofread when finish*//*ver eso de q si le pasan pos o bos*/	var i,len,tmp,piece_val,legal_moves;		piece_val=getValue(initial_pos,obj);		if(piece_val){		if((obj.ActiveColor&&piece_val<0)||(!obj.ActiveColor&&piece_val>0)){/*multiply por active como en if(current_val>0&&current_val<6){*/			legal_moves=legalMoves(initial_pos,piece_val,obj);			tmp=posToBos(final_pos);						for(i=0,len=legal_moves.length;i<len;i++){				if(posToBos(legal_moves[i])==tmp){					makeMove(piece_val,initial_pos,final_pos,obj);										break;				}
			}		}	}}function makeMove(piece_val,initial_pos,final_pos,obj){/*ver eso de q si le pasan pos o bos (igual q el otro)*/	var pawn_moved,promoted_val,piece_abs_val,initial_bos,final_bos,destination_file_char,destination_rank_char,new_enpass_bos,new_active_castling_availity,new_nonactive_castling_availity,king_castled,multi_holder;		piece_abs_val=Math.abs(piece_val);		initial_bos=posToBos(initial_pos);	final_bos=posToBos(final_pos);		multi_holder=obj.ActiveColor?[null,8,[0,3],[0,5],-4,[0,0],[0,7],[7,6,5,4],obj.BCastling,"1",-1,obj.WCastling,1]:[null,1,[7,3],[7,5],4,[7,0],[7,7],[2,3,4,5],obj.WCastling,"8",1,obj.BCastling,8];/*del null,unarray stuff?, idk rewrite this*/		pawn_moved=false;	promoted_val=null;	new_enpass_bos="";	new_active_castling_availity=multi_holder[8];	new_nonactive_castling_availity=multi_holder[11];	king_castled=null;/*se usara para pgn*/		/*re order these ifs? so it can minimize using > and <*/	if(piece_abs_val==1){//pawn		pawn_moved=true;		destination_file_char=final_bos.charAt(0);		destination_rank_char=final_bos.charAt(1);				if(initial_bos.charAt(1)==multi_holder[7][0]&&destination_rank_char==multi_holder[7][2]){//new enpass			new_enpass_bos=(destination_file_char+""+multi_holder[7][1]);		}else if(final_bos==obj.EnPassantBos){//pawn x enpass			setValue(bosToPos(destination_file_char+""+multi_holder[7][3]),0,obj);		}else if(destination_rank_char==multi_holder[9]){//promotion			promoted_val=(5*multi_holder[10]);/*change val using combobox*/		}	}else if(piece_abs_val==4){//rook		new_active_castling_availity=cornerRookTest(new_active_castling_availity,initial_bos,multi_holder[1]);	}else if(piece_abs_val==6){//king		new_active_castling_availity=0;				if(initial_bos==("e"+multi_holder[1])){			/*usar charAt y solo ver si de file 'e' se fue a 'g' o 'c'?*/			if(final_bos==("g"+multi_holder[1])){//short				king_castled=1;				setValue(multi_holder[3],multi_holder[4],obj);				setValue(multi_holder[6],0,obj);			}else if(final_bos==("c"+multi_holder[1])){//long				king_castled=2;				setValue(multi_holder[2],multi_holder[4],obj);				setValue(multi_holder[5],0,obj);			}		}	}		obj.HalfMove++;	if(pawn_moved||getValue(final_pos,obj)){		obj.HalfMove=0;	}		new_nonactive_castling_availity=cornerRookTest(new_nonactive_castling_availity,final_bos,multi_holder[12]);		if(obj.ActiveColor){/*otro active color?-.-*/		obj.FullMove++;		obj.BCastling=new_active_castling_availity;		obj.WCastling=new_nonactive_castling_availity;	}else{		obj.WCastling=new_active_castling_availity;		obj.BCastling=new_nonactive_castling_availity;	}		obj.EnPassantBos=new_enpass_bos;		setValue(final_pos,(promoted_val||piece_val),obj);	setValue(initial_pos,0,obj);		toggleActiveColor(obj);		nodomTest(obj);		console.log("["+PiecesNames.charAt(piece_abs_val)+"] "+initial_bos+" to "+final_bos);/*x*/	displayBoard(obj,false);/*x?*/}function xTest(){	var i,n,len,temp_board,output_string,invalid_positions,keep_going,rtn_everything_works;		keep_going=true;	rtn_everything_works=false;		/*proofread when finish*/		invalid_positions=["","hi","8/rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1","rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR x KQkq - 0 1","rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KkQq - 0 1","rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w kqKQ - 0 1","rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w Kqky - 0 1","rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e4 0 1","rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e9 0 1","rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq x5 0 1","rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNRw KQkq - 0 1","rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR wKQkq - 0 1","rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq- 0 1","8/8/8/8/8/8/8/8 b - - 0 1","8/7k/8/8/8/8/8/8 b - - 0 1","8/7K/8/8/8/8/8/8 b - - 0 1","8/K6K/8/8/8/7k/8/8 b - - 0 1","8/k6k/8/8/8/7K/8/8 b - - 0 1","P7/8/7K/8/8/7k/8/8 b - - 0 1","p7/8/7K/8/8/7k/8/8 b - - 0 1","8/8/7K/8/8/7k/8/p7 b - - 0 1","8/8/7K/8/8/7k/8/P7 b - - 0 1","p7/8/7K/8/8/7k/8/P7 b - - 0 1","P7/8/7K/8/8/7k/8/p7 b - - 0 1","8/8/61K/8/8/7k/8/8 b - - 0 1","8/8/K32P1/8/8/7k/8/8 b - - 0 1","8/8/1K51/8/8/7k/8/8 b - - 0 1","8/8/8K/8/8/7k/8/8 b - - 0 1","8/8/K8/8/8/7k/8/8 b - - 0 1","R7R/8/K7/8/8/7k/8/8 b - - 0 1","rnbqkbnr/pppp1ppp/8/4p3/1P6/P7/1PPPPPPP/RNBQKBNR w KQkq - 0 1","rnbqkbnr/pppp1ppp/8/4p3/1p6/P7/1PPPPPPP/RNBQKBNR w KQkq - 0 1","rnbqkbnr/pppppppp/8/8/8/R7/PPPPPPPP/RNBQKBNR w KQkq - 0 1","rnbqkbnr/pppppppp/8/8/8/r7/PPPPPPPP/RNBQKBNR w KQkq - 0 1","rnbqkbnr/pppp1ppp/8/4p3/7B/P7/1PPPPPPP/RNBQKBNR w KQkq - 0 1","rnbqkbnr/pppp1ppp/8/4p3/7b/P7/1PPPPPPP/RNBQKBNR w KQkq - 0 1","rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPPNPPP/RNBQKBNR w KQkq - 0 1","rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPPnPPP/RNBQKBNR w KQkq - 0 1","rnbqkbnr/1ppppppp/p7/8/7Q/P7/1PPPPPPP/RNBQKBNR w KQkq - 0 1","rnbqkbnr/1ppppppp/p7/8/7q/P7/1PPPPPPP/RNBQKBNR w KQkq - 0 1","4k3/2pppppp/8/8/8/B7/BBBPPPPP/1B2KRRR w - - 0 1","4k3/2pppppp/8/8/8/B7/BBBPPPPP/1B2KRQQ w - - 0 1","rnbqkbnr/pppp1ppp/8/4p3/8/PP6/1NPRPPBR/RNBQKBNR w KQkq - 0 1","8/8/4R3/2K5/3N2B1/8/4k3/8 b - - 0 1","8/7q/8/1k1p4/4K3/6n1/8/8 w - - 0 1","8/7q/5n2/1k1p4/4K3/6n1/8/4r3 w - - 0 1","8/8/8/1K6/5k2/6P1/8/8 w - - 0 1","8/8/8/1K6/1r3k2/8/8/8 b - - 0 1","8/8/8/1K6/1r3k2/6P1/8/8 b - - 0 1","8/8/8/1K6/1r3k2/6P1/8/8 w - - 0 1","8/8/4N3/1K6/5k2/8/8/8 w - - 0 1","8/8/4K3/4k3/8/8/8/8 w - - 0 1","8/8/2K5/8/6P1/2k5/8/8 w - g3 0 1","8/8/2K5/6p1/6P1/2k5/8/8 b - g6 0 1","8/8/2K5/8/8/2k5/8/8 w - g6 0 1","8/8/2K3N1/6p1/8/2k5/8/8 w - g6 0 1","8/8/2K3N1/6p1/6P1/2k3n1/8/8 b - g3 0 1","8/8/2K5/8/6p1/2k5/8/8 w - g3 0 1","8/8/2K5/8/6p1/2k5/8/8 b - g3 0 1","8/8/2K5/6P1/8/2k5/8/8 w - g6 0 1","8/8/2K5/6P1/8/2k5/8/8 b - g6 0 1","8/7P/2k4P/7P/7P/2K4P/7P/8 w - - 0 1","8/P7/P1k5/P7/P7/P1K5/P7/8 w - - 0 1","3knbnr/2pppppp/8/P7/P7/P3K3/P7/8 w - - 0 1","8/7p/2k4p/7p/7p/7p/PPPPPP2/K7 w - - 0 1","rnbq1rk1/ppppppbp/5np1/8/8/4P3/PPPPP1PP/4K3 w - - 0 1","rnbq1rk1/1pppppbp/5np1/8/4P3/4P3/PPP1P1PP/4K3 w - - 0 1","rnbq1rk1/3pppbp/5np1/4P3/4P3/4P3/PP2P1PP/4K3 w - - 0 1","4K3/8/8/8/8/4k3/8/8 w KQ - 0 1","8/4K3/8/8/8/8/8/4k3 w kq - 0 1","8/8/2k5/8/8/8/8/4K2R w Q - 0 1","8/8/2k5/8/8/8/8/r3K3 w K - 0 1","8/8/2k5/8/8/8/8/4K3 w K - 0 1","8/8/2k5/8/8/8/8/4K3 w Q - 0 1","8/8/2k5/8/8/8/8/4K3 w KQ - 0 1","4K3/8/2k5/8/8/8/8/R6R w KQ - 0 1","r6r/8/8/8/2K5/8/8/4k3 w kq - 0 1"];		for(i=0,len=invalid_positions.length;i<len;i++){		initBoard("xtest",invalid_positions[i]);		temp_board=window["xtest"];				if(temp_board.Fen!="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"){			keep_going=false;			break;		}
	}		temp_board=null;		if(keep_going){		initBoard("xtest"," 8/8/8/5b2/1k6/8/3n4/1K6 w - - 0 1 ");		temp_board=window["xtest"];				output_string="";				for(n in temp_board){			if(temp_board.hasOwnProperty(n)){				output_string+=((n.charAt(0))+":"+temp_board[n]).replace(/0,0/g,"*");			}		}				output_string+=fixSpacing(" tr  im ");		output_string+=(posToBos(bosToPos("e4"))=="e4")*1;		output_string+=(insideBoard([8,8]))*1+""+(insideBoard([7,7]))*1+""+(insideBoard([0,0]))*1;		output_string+=(getValue(temp_board.BKingPos,temp_board)==-6)*1;				temp_board=null;				if(output_string=="C:*,*,*,*,*,*,*,*,*,*,*,*,*,*,0,-3,*,0,-6,*,*,*,*,*,*,*,*,0,-2,*,*,0,6,*,*,*F:8/8/8/5b2/1k6/8/3n4/1K6 w - - 0 1A:falseA:2W:0B:0E:H:0F:1W:7,1B:4,1tr im10111"){			initBoard("xtest"," rnb1k3/pp1ppp2/8/q7/8/8/1PP1PPPP/RNBQK2R w KQq - 0 1");			temp_board=window["xtest"];						output_string="";						output_string+=(legalMoves(bosToPos("c2"),1,temp_board).join("x")=="5,2")*1;			output_string+=(legalMoves(bosToPos("b1"),2,temp_board).join("x")=="5,2x6,3")*1;			output_string+=(legalMoves(bosToPos("c1"),3,temp_board).join("x")=="6,3")*1;			output_string+=(legalMoves(bosToPos("b2"),1,temp_board).join("x")=="4,1")*1;			output_string+=(legalMoves(bosToPos("e1"),6,temp_board).join("x")=="7,5")*1;			output_string+=(legalMoves(bosToPos("a1"),4,temp_board).join("x")=="3,0")*1;						temp_board=null;						if(output_string=="111111"){				initBoard("xtest","2n1k3/2p5/3N4/8/8/8/8/4K3 b - - 0 1 ");				temp_board=window["xtest"];								output_string="";								output_string+=(legalMoves(bosToPos("c8"),-2,temp_board).join("x")=="2,3")*1;				output_string+=(legalMoves(bosToPos("e8"),-6,temp_board).join("x")=="0,3x1,3x1,4x0,5")*1;				output_string+=(legalMoves(bosToPos("c7"),-1,temp_board).join("x")=="2,3")*1;								temp_board=null;								if(output_string=="111"){					initBoard("xtest","r3k2r/P7/8/8/5B2/8/8/2K5 b kq - 0 1");					temp_board=window["xtest"];										output_string=(legalMoves(bosToPos("e8"),-6,temp_board).join("x")=="0,3x1,3x1,4x1,5x0,5x0,2x0,6")*1;										temp_board=null;										if(output_string=="1"){						initBoard("xtest","r3k2r/8/4B3/8/8/8/8/2K5 b kq - 0 1");						temp_board=window["xtest"];												output_string=(legalMoves(bosToPos("e8"),-6,temp_board).join("x")=="0,3x1,4x0,5")*1;												temp_board=null;												if(output_string=="1"){							initBoard("xtest","r3k2r/8/4Q3/8/8/8/8/2K5 b kq - 0 1");							temp_board=window["xtest"];														output_string=(legalMoves(bosToPos("e8"),-6,temp_board).join("x")=="0,3x0,5")*1;														temp_board=null;														if(output_string=="1"){								initBoard("xtest","r3k2r/8/4N3/8/8/8/8/2K5 b kq - 0 1");								temp_board=window["xtest"];																output_string=(legalMoves(bosToPos("e8"),-6,temp_board).join("x")=="1,3x1,4x1,5")*1;																temp_board=null;																if(output_string=="1"){									initBoard("xtest","4k3/8/8/8/3Pp3/8/4R3/2K5 b - d3 0 1");									temp_board=window["xtest"];																		output_string=(legalMoves(bosToPos("e4"),-1,temp_board).join("x")=="5,4")*1;																		temp_board=null;																		if(output_string=="1"){										initBoard("xtest","8/8/5k2/8/2pPp3/8/8/Q1K5 b - d3 0 1");										temp_board=window["xtest"];																				output_string="";																				output_string+=(legalMoves(bosToPos("c4"),-1,temp_board).join("x")=="5,2")*1;										output_string+=(legalMoves(bosToPos("e4"),-1,temp_board).join("x")=="5,4")*1;																				temp_board=null;																				if(output_string=="11"){											initBoard("xtest","8/8/8/3k4/4PpP1/8/3K4/8 b - e3 0 1");											temp_board=window["xtest"];																						output_string=(legalMoves(bosToPos("f4"),-1,temp_board).join("x")=="5,4")*1;																						temp_board=null;																						if(output_string=="1"){												initBoard("xtest","8/8/5k2/8/3Pp3/8/8/2K5 b - d3 0 1");												temp_board=window["xtest"];																								output_string=(legalMoves(bosToPos("e4"),-1,temp_board).join("x")=="5,4x5,3")*1;																								temp_board=null;																								if(output_string=="1"){													/*falta ally, pero mejor testear por disambig para dos pajaros de 1 tiro*/													/*poner un juego completo con simulateMoves*/													/*edit: creo q poner un juego cuando ya este lo de pgn se hace todo al mismo tiempo*/																										rtn_everything_works=true;												}											}										}									}								}							}						}					}				}			}		}	}		return rtn_everything_works;}