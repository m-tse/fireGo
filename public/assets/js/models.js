// Includes all Backbone Models

var GameModel = Backbone.Model.extend({
  initialize: function() {
    this.moveOccurred();
    this.on('change:moves', this.moveOccurred);
  },
  moveOccurred: function() {
    this.set('totalMoves', this.totalMoves);
    this.set('currentTurnColor', this.currentTurnColor);
  },
  totalMoves: function() {
    return _.keys(this.moves).length + 1;
  },
  currentTurnColor: function() {
    if (this.totalMoves() % 2 === 0) {return 'black';} else {return 'white';}
  }
});

var GamesModel = Backbone.Firebase.Collection.extend({
  model: GameModel,
  firebase: "https://blistering-fire-3878.firebaseio.com/games"
});
