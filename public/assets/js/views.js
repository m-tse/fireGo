

var GamesLobbyView = Backbone.View.extend({
  el: $('#gameLobbyBackbone'),
  template: Templates['public/templates/gameLobby.hbs'],
  events: {
    "click .js-create-game": "createGame"
  },

  initialize: function() {
    this.listenTo(this.collection, "add remove", this.render);
  },

  render: function() {
    this.$el.empty();
    this.$el.html(this.template());
    for (var i = 0; i < this.collection.length; i++) {
      var gameModel = this.collection.models[i];
      var gameLabelView = new GameLabelView({model:gameModel});
      $('.js-games-list').append(gameLabelView.render().el);
    }
    this.$el.append(Templates['public/templates/testTemplate.hbs']);
    return this;
  },

  createGame: function() {
    var gameInfo = {
      name: $('.js-game-name').val(),
      size: 9,
      moveCount: 1
    };
    var newGame = new GameModel(gameInfo);
    this.collection.add(newGame);
  }
});

var GameLabelView = Backbone.View.extend({
  tagName: "a",
  className: "list-group-item games-list-item",
  template: Templates['public/templates/gameLabelTitle.hbs'],
  events: {
    "click": "openGame"
  },
  render: function() {
    this.$el.html(this.template(this.model.attributes));
    return this;
  },
  openGame: function() {
    var openedGame = new OpenGameView({model: this.model});
    $('#gameLobbyBackbone').hide();
    $('#openGameBackbone').empty().html(openedGame.render().el);
  }
});

var OpenGameView = Backbone.View.extend({
  events: {
    "click .js-return-to-lobby": "returnToLobby"
  },
  template: Templates['public/templates/openGame.hbs'],
  initialize: function() {
    this.listenTo(this.model, 'change', this.render);
  },
  render: function() {
    this.$el.html(this.template(this.model.attributes));
    var boardView = new BoardView({model: this.model});
    this.$('.js-board').html(boardView.render().el);
    return this;
  },
  returnToLobby: function() {
    $('#gameLobbyBackbone').show();
    this.remove();
  }
});

var BoardView = Backbone.View.extend({
  initialize: function() {
    window.boardView = this;
    // Initialize the board intersections
    var size = this.model.attributes.size;
    this.boardIntersections = {};
    for (var row = size; row > 0; row--) {
      var rowObj = {};
      var rowStr = 'r' + row;
      this.boardIntersections[rowStr] = rowObj;
      for (var col = size; col > 0; col--) {
        var colID = 'c' + col;
        var boardIntersection = new BoardIntersectionView({id:colID});
        rowObj[colID] = boardIntersection;
      }
    }
    // Create a new firebase collection for moves of this game
    var gameID = this.model.attributes.id;
    var firebaseURL = "https://blistering-fire-3878.firebaseio.com/games/" + gameID + "/moves";

    var movesListRef = new Firebase(firebaseURL);
    var boundRenderMoves = this.renderMove.bind(this);
    movesListRef.on('child_added', boundRenderMoves);

  },
  render: function() {
    this.$el.append(this.renderBoard());
    // this.renderMove();
    return this;
  },
  renderBoard: function() {
    var size = this.model.attributes.size;

    // Render the board grid
    for (r = 0; r < size - 1; r++) {
      $gridRow = $("<div class='grid-row'></div>");
      this.$el.append($gridRow);
      for (c = 0; c < size - 1; c++) {
        $gridSquare = $("<div class='grid-square'></div>");
        $gridSquare.appendTo($gridRow);
      }
    }
    // Render board
    for (var row = size; row > 0; row--) {
      var rowTemplate = Handlebars.compile("<div class='stone-row' id='r{{row}}'></div>");
      var $row = $(rowTemplate({row: row}));
      this.$el.append($row);
      for (var col = size; col > 0; col--) {
        var colID = 'c' + col;
        var boardIntersection = this.getBoardIntersectionView(row, col);
        $row.append(boardIntersection.render().el);
      }
    }

  },
  renderMove: function(snapshot) {
    var moveObj = snapshot.val();
    var boardIntersectionView = this.getBoardIntersectionView(moveObj.row, moveObj.col);
    function moveColor (moveNumber){
      if (moveNumber % 2 === 0) {return 'white';} else{return 'black';}
    }
    var currMoveColor = moveColor(moveObj.move);
    boardIntersectionView.displayColor(currMoveColor);
  },
  getBoardIntersectionView: function(row, col) {
    var rowID = 'r' + row.toString();
    var colID = 'c' + col.toString();
    return this.boardIntersections[rowID][colID];
  }
});

var BoardIntersectionView = Backbone.View.extend({
  className: "stone-col",

  intiialize: function() {
  },
  render: function() {
    return this;
  },
  clearIntersection: function() {
    $el.removeClass('black-move white-move');
  },
  displayColor: function(color) {
    var className = color + '-move';
    this.$el.addClass(className);
  }
});