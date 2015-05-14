;(function(){
  var board = null;

  if (typeof MineSweeper === "undefined") {

    window.MineSweeper = function(boardSize, numberOfMines){
      board = new MineSweeper.Board(boardSize, numberOfMines);
    };
  }

  MineSweeper.Board = function(size, numMines){
    var minedTiles = 0;
    this.tiles = [];
    this.size = size;
    for(var i = 0; i < size; i++) {
      for(var j = 0; j < size; j++) {
        if(j === 0) {
          this.tiles[i] = [];
        }
        this.tiles[i][j] = new MineSweeper.Tile([i, j], this)
      }
    }

    while(minedTiles < numMines){
      var xTry = Math.floor( Math.random() * size),
          yTry = Math.floor( Math.random() * size);
      if(this.tiles[xTry][yTry].mined === false){
        this.tiles[xTry][yTry].mined = true;
        minedTiles++;
      }
    }

    this.render();
  };

  MineSweeper.Board.prototype.inBounds = function(pos) {
    return pos[0] >= 0 && pos[1] >= 0 && pos[0] < this.size
      && pos[1] < this.size;
  };

  MineSweeper.Board.prototype.isWon = function() {
    var won = true;
    for(var i = 0; i < this.size; i++) {
      for(var j = 0; j < this.size; j++) {
        if(this.tiles[i][j].mined && !this.tiles[i][j].flagged) {
          won = false;
        }
      }
    }

    return won;
  };

  MineSweeper.Board.prototype.render = function() {
    var domBoard = $l('.board');
    this.tiles.forEach(function(row) {
      row.forEach(function(tile) {
        domBoard.appendChild(tile.render());
      });
    });
  };

  MineSweeper.Board.prototype.revealAllTiles = function() {
    for(var i = 0; i < this.size; i++) {
      for(var j = 0; j < this.size; j++) {
        if(!this.tiles[i][j].flipped) {
          if(!this.tiles[i][j].mined) {
            this.tiles[i][j].flipTile();
          } else {
            this.tiles[i][j].flipMinedTile();
          }
        }
      }
    }
  };

  MineSweeper.Board.prototype.winGame = function() {
    $l('.board').empty();
    $l('.board').html('<h2>You win!</h2>');
  }

  MineSweeper.Tile = function(pos, board){
    this.inside = document.createElement('div');
    this.flagged = false;
    this.flipped = false;
    this.board = board;
    this.pos = pos;
    this.mined = false;
    this.x = pos[0];
    this.y = pos[1];
    this.left = 35 * pos[0];
    this.top = 35 * pos[1];
  };

  MineSweeper.Tile.prototype.clickTile = function(e) {
    if(e) {
      e.preventDefault();
    }
    if(this instanceof HTMLElement){
      var tile = board.tiles[$l(this).attr("x")][$l(this).attr("y")];
    } else {
      var tile = this;
    }

    tile.flipTile();
  };

  MineSweeper.Tile.prototype.flagTile = function(e) {
    if(e) {
      e.preventDefault();
    }
    if(this instanceof HTMLElement){
      var tile = board.tiles[$l(this).attr("x")][$l(this).attr("y")];
    } else {
      var tile = this;
    }

    if(!tile.flagged) {
      $l(tile.inside).addClass('orange');
      $l("div[x = '" + tile.x + "'][y = '"
        + tile.y + "'] .front").html("<h2>x</h2>");
      tile.flagged = true;
      if(tile.board.isWon()) {
        tile.board.winGame();
      }
    } else {
      tile.flagged = false;
      $l(tile.inside).removeClass('orange');
      $l("div[x = '" + tile.x + "'][y = '"
        + tile.y + "'] .front").html("");
    }
  };

  MineSweeper.Tile.prototype.flipMinedTile = function() {
    $l(this.inside).addClass('mined');
    $l(this.inside).addClass('flipped');
    $l("div[x = '" + this.x + "'][y = '"
      + this.y + "'] .back").html("<h2>*</h2");
  };

  MineSweeper.Tile.prototype.flipNeighbors = function(){
    for(var i = -1; i < 2; i++) {
      for(var j = -1; j < 2; j++ ) {
        var x = this.x + i,
            y = this.y + j;
        if(this.board.inBounds([x, y]) && [x, y] !== this.pos
          && !this.board.tiles[x][y].flipped) {
          this.board.tiles[x][y].flipTile();
        }
      }
    }
  };

  MineSweeper.Tile.prototype.flipTile = function() {

    if(!this.flipped) {
      this.flipped = true;
      var count = this.neighborminedCount();

      if(this.mined){
        this.flipMinedTile();
        this.board.revealAllTiles();
      } else if(count > 0){
        $l(this.inside).addClass('flipped');
        $l(this.inside).addClass('yellow');
        $l("div[x = '" + this.x + "'][y = '" + this.y
          + "'] .back").html("<h2>" + count + "</h2>");
      } else {
        $l(this.inside).addClass('flipped');
        this.flipNeighbors();
      }
    }
  };

  MineSweeper.Tile.prototype.neighborminedCount = function() {
    var count = 0;
    for(var i = -1; i < 2; i++) {
      for(var j = -1; j < 2; j++ ) {
        var x = this.x + i,
            y = this.y + j;
        if(this.board.inBounds([x, y]) && this.board.tiles[x][y].mined
          && [x, y] !== this.pos) {
          count++;
        }
      }
    }

    return count;
  };

  MineSweeper.Tile.prototype.render = function(){
    var el = $l(this.inside);
    el.html("<div class='front'></div><div class='back'></div>");
    el.addClass('tile');
    el.attr("x", this.pos[0]);
    el.attr("y", this.pos[1]);
    this.inside.style.top = this.top * 2;
    this.inside.style.left = this.left * 2;
    el.on('click', this.clickTile);
    el.on('contextmenu', this.flagTile);
    return this.inside;
  };
})();
