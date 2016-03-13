;(function(){
  var board;

  if (typeof MineSweeper === "undefined") {
    window.MineSweeper = function(boardSize, numberOfMines){
      board = new MineSweeper.Board(boardSize, numberOfMines);
    };
  }

  MineSweeper.Board = function(size, numMines){
    var minedTiles = 0;
    this.gameOver = false, this.size = size, this.tiles = [];
    for(var i = 0; i < size; i++) {
      for(var j = 0; j < size; j++) {
        if(j === 0) this.tiles[i] = [];
        this.tiles[i][j] = new MineSweeper.Tile([i, j]);
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
    for(var i = 0; i < this.size; i++) {
      for(var j = 0; j < this.size; j++) {
        if((this.tiles[i][j].mined && !this.tiles[i][j].flagged) ||
          (this.tiles[i][j].flagged && !this.tiles[i][j].mined)) {
          return false;
        }
      }
    }

    return true;
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
            $l('.bomb-sound').play();
            this.tiles[i][j].flipMinedTile();
          }
        }
      }
    }
  };

  MineSweeper.Board.prototype.winGame = function() {
    $l('.ta-da').play();
    $l('.board').empty();
    $l('.board').html('<h2>You win!</h2>');
  }

  MineSweeper.Tile = function(pos){
    this.inside = document.createElement('div');
    this.inside.style.top = (56 * pos[0]).toString() + 'px';
    this.inside.style.left = (56 * pos[1]).toString() + 'px';
    this.flagged = false, this.flipped = false, this.mined = false;;
    this.x = pos[0], this.y = pos[1];
    this.pos = pos;
  };

  MineSweeper.Tile.prototype.clickTile = function(event) {
    if(event) event.preventDefault();

    var tile = this;
    if(this instanceof HTMLElement){
      var tile = board.tiles[$l(this).attr("x")][$l(this).attr("y")];
    }

    tile.flipTile();
  };

  MineSweeper.Tile.prototype.flagTile = function(event) {
    if(event) event.preventDefault();

    var tile = this;
    if(this instanceof HTMLElement){
      tile = board.tiles[$l(this).attr("x")][$l(this).attr("y")];
    }

    if(!tile.flagged) {
      $l(tile.inside).addClass('orange');
      $l("div[x = '" + tile.x + "'][y = '"
        + tile.y + "'] .front").html("<h2>x</h2>");
      tile.flagged = true;
      if(board.isWon()) setTimeout(board.winGame, 1000);
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
        if(board.inBounds([x, y]) && [x, y] !== this.pos
          && !board.tiles[x][y].flipped) {
          board.tiles[x][y].flipTile();
        }
      }
    }
  };

  MineSweeper.Tile.prototype.flipTile = function() {
    if(!this.flipped) {
      this.flipped = true;
      var count = this.neighborminedCount();

      if(this.mined){
        board.gameOver = true;
        this.flipMinedTile();
        board.revealAllTiles();
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

    if(!board.gameOver) $l('.flip-sound').play();
  };

  MineSweeper.Tile.prototype.neighborminedCount = function() {
    var count = 0;
    for(var i = -1; i < 2; i++) {
      for(var j = -1; j < 2; j++ ) {
        var x = this.x + i,
            y = this.y + j;
        if(board.inBounds([x, y]) && board.tiles[x][y].mined
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
    el.on('click', this.clickTile);
    el.on('contextmenu', this.flagTile);
    return this.inside;
  };
})();
