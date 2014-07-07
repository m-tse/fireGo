// Includes all Backbone Models

var GameModel = Backbone.Model.extend({
  totalMoves: function() {
    return _.keys(this.attributes.moves).length + 1;
  },
  currentTurnColor: function() {
    if (this.totalMoves() % 2 === 0) {return 'white';} else {return 'black';}
  },
  forTemplate: function() {
    var json = this.toJSON();
    json.totalMoves = this.totalMoves();
    json.currentTurnColor = this.currentTurnColor();
    var flattenedSpectators = _.values(this.attributes.spectators);
    json.spectators = flattenedSpectators;
    return json;
  }
});

var GamesModel = Backbone.Firebase.Collection.extend({
  model: GameModel,
  firebase: "https://blistering-fire-3878.firebaseio.com/games"
});
