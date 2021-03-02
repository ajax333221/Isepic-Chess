<p align="center"><a href="https://github.com/ajax333221/isepic-chess"><img width="100" src="https://github.com/ajax333221/isepic-chess-ui/raw/master/css/images/ic_logo.png" alt="Ic.js logo"></a></p>

<h1 align="center">isepic-chess.js</h1>

`isepic-chess.js` is a chess utility library written in JavaScript, it provides features like legal moves calculation, FEN validation, SAN parsing, etc. (see: [Features](https://github.com/ajax333221/isepic-chess#rocket-features)).

<strong>Flexibility:</strong> it strives to be flexible (inspired in JavaScript) and attempts to make things work without easily giving up and throwing errors.

<strong>Code coverage:</strong> the extra flexibility adds extra complexity and paths to be tested, but despite this, the code coverage is <strong>98~%</strong> <sup>(as of `v6.0.0`)</sup>.

<strong>Perft-tested:</strong> each release is tested against known <em>Perft positions</em> to ensure that the move generation tree of legal moves do not vary from the correct count.

<strong>UI-less:</strong> all the bloating code that a user interface brings is completely separated into this other project: [Isepic Chess UI](https://github.com/ajax333221/isepic-chess-ui).

<strong>Dependency-less:</strong> does not depend on any other library.

:pushpin: Table of contents
-------------

- [isepic-chess.js](https://github.com/ajax333221/isepic-chess#isepic-chessjs)
- [Table of contents](https://github.com/ajax333221/isepic-chess#pushpin-table-of-contents)
- [Installation](https://github.com/ajax333221/isepic-chess#computer_mouse-installation)
- [Node.js example](https://github.com/ajax333221/isepic-chess#green_heart-nodejs-example)
- [Demo](https://github.com/ajax333221/isepic-chess#eye-demo-from-isepic-chess-ui)
- [Features](https://github.com/ajax333221/isepic-chess#rocket-features)
- [Documentation](https://github.com/ajax333221/isepic-chess#book-documentation)
- [To do](https://github.com/ajax333221/isepic-chess#telescope-to-do)
- [Copyright and license](https://github.com/ajax333221/isepic-chess#page_facing_up-copyright-and-license)

:computer_mouse: Installation
-------------

```
# NPM
npm install isepic-chess
```
Then: `const {Ic} = require("isepic-chess");`

<hr>

```html
# Web browser
<script src="./isepic-chess.js"></script>
```
The variable `Ic` will be added to window.

:green_heart: Node.js example
-------------

```js
const {Ic} = require("isepic-chess");

var board, ascii_diagram, example_pgn;

example_pgn = `[Event "example game"]
[SetUp "1"]
[FEN "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2"]

2. Qf3 Nc6 3. Bc4`;

board = Ic.initBoard({
  boardName : "example_board",
  pgn : example_pgn
});

// same than passing a SAN move of "Nd4"
board.playMove("c6-d4");

// "Qxf7", "Qxf7++", "Q3xf7+", "Qfxf7", "Qf3xf7 {comment}", etc
board.playMove("Qxf7#");

ascii_diagram = board.ascii();

module.exports = (ascii_diagram + "\nIs Checkmate? = " + board.isCheckmate);
//    +------------------------+
//  8 | r  .  b  q  k  b  n  r |
//  7 | p  p  p  p  .  Q  p  p |
//  6 | .  .  .  .  .  .  .  . |
//  5 | .  .  .  .  p  .  .  . |
//  4 | .  .  B  n  P  .  .  . |
//  3 | .  .  .  .  .  .  .  . |
//  2 | P  P  P  P  .  P  P  P |
//  1 | R  N  B  .  K  .  N  R |
//    +------------------------+
//      a  b  c  d  e  f  g  h
// 
// Is Checkmate? = true

/* for a graphical user interface see https://github.com/ajax333221/isepic-chess-ui */
```

:eye: Demo <sup>(from [isepic-chess-ui](https://github.com/ajax333221/isepic-chess-ui))</sup>
-------------

https://ajax333221.github.io/isepic-chess-ui/

:rocket: Features
-------------

- PGN import / export
- UCI import / export
- Advanced FEN validation
- Get legal moves
- Material difference
- Multiple boards at once
- Pawn promotion options
- Check / checkmate / draw detection
- SAN parsing
- ASCII diagram

:book: Documentation
-------------

- [Ic methods](https://github.com/ajax333221/isepic-chess/blob/master/docs/ic-methods.md#ic-methods)
- [Board methods](https://github.com/ajax333221/isepic-chess/blob/master/docs/board-methods.md#board-methods)
- [Board properties](https://github.com/ajax333221/isepic-chess/blob/master/docs/board-properties.md#board-properties)
- [Square properties](https://github.com/ajax333221/isepic-chess/blob/master/docs/square-properties.md#square-properties)
- [Move properties](https://github.com/ajax333221/isepic-chess/blob/master/docs/move-properties.md#move-properties)

:telescope: To do
-------------

- **PGN** (export imported tags)
- **PGN** (keep comments instead of deleting them)
- **Parse multiple games** (currently the parser can only handle one game at a time)

:page_facing_up: Copyright and license
-------------

Copyright © 2021 Ajax Isepic (ajax333221)

Licensed under MIT License: http://opensource.org/licenses/mit-license.php
