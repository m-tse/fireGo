// Includes all Backbone Models

var GameModel = Backbone.Model.extend({
  totalMoves: function() {
    return _.keys(this.moves).length + 1;
  },
  currentTurnColor: function() {
    if (this.totalMoves() % 2 === 0) {return 'black';} else {return 'white';}
  },
  forTemplate: function() {
    var json = this.toJSON();
    json.totalMoves = this.totalMoves();
    json.currentTurnColor = this.currentTurnColor();
    return json;
  }
});

var GamesModel = Backbone.Firebase.Collection.extend({
  model: GameModel,
  firebase: "https://blistering-fire-3878.firebaseio.com/games"
});
