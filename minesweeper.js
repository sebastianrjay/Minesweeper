;(function(){
  var board = null;

  if (typeof MineSweeper === "undefined") {

    window.MineSweeper = function(){
      board = new MineSweeper.Board(10, 20);
    };
  }

  MineSweeper.Board = function(size, bombs){
    var bombedTiles = 0;
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

    while(bombedTiles < bombs){
      var xTry = Math.floor( Math.random() * size),
          yTry = Math.floor( Math.random() * size);
      if(this.tiles[xTry][yTry].bomb === false){
        this.tiles[xTry][yTry].bomb = true;
        bombedTiles++;
      }
    }

    this.render();
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
          if(!this.tiles[i][j].bomb) {
            this.tiles[i][j].flipTile();
          } else {
            this.tiles[i][j].flipMinedTile();
          }
        }
      }
    }
  };

  MineSweeper.Board.prototype.inBounds = function(pos) {
    return pos[0] >= 0 && pos[1] >= 0 && pos[0] < this.size
      && pos[1] < this.size;
  };

  MineSweeper.Tile = function(pos, board){
    this.flipped = false;
    this.board = board;
    this.pos = pos;
    this.bomb = false;
    this.x = pos[0];
    this.y = pos[1];
    this.left = 35 * pos[0];
    this.top = 35 * pos[1];
  };

  MineSweeper.Tile.prototype.render = function(){
    this.inside = document.createElement('div');
    var el = $l(this.inside);
    el.html("<div class='front'></div><div class='back'></div>");
    el.addClass('tile');
    el.attr("x", this.pos[0]);
    el.attr("y", this.pos[1]);
    this.inside.style.top = this.top * 2;
    this.inside.style.left = this.left * 2;
    el.on("click", this.clickTile);
    return this.inside;
  };

  MineSweeper.Tile.prototype.neighborBombCount = function() {
    var count = 0;
    for(var i = -1; i < 2; i++) {
      for(var j = -1; j < 2; j++ ) {
        var x = this.x + i,
            y = this.y + j;
        if(this.board.inBounds([x, y]) && this.board.tiles[x][y].bomb
          && [x, y] !== this.pos) {
          count++;
        }
      }
    }

    return count;
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

  MineSweeper.Tile.prototype.flipMinedTile = function() {
    $l(this.inside).addClass('flipped');
    $l(this.inside).addClass('mined');
    $l("div[x = '" + this.x.toString() + "'] + div[y = '" + this.y.toString()
      + "'] .back").html("<h2>*</h2");
  };

  MineSweeper.Tile.prototype.flipTile = function() {
    if(!this.flipped){
      this.flipped = true;
      var count = this.neighborBombCount();
      if(this.bomb){
        this.flipMinedTile();
        this.board.revealAllTiles();
      } else if(count > 0){
        $l(this.inside).addClass('flipped');
        $l(this.inside).addClass('orange');
        $l("div[x = '" + this.x.toString() + "'] + div[y = '" + this.y.toString()
          + "'] .back").html("<h2>" + count.toString() + "</h2");
      } else {
        $l(this.inside).addClass('flipped');
        this.flipNeighbors();
      }
    }
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
})();
