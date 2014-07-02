// Includes all Backbone Models

var GameModel = Backbone.Model.extend({

});

var GamesModel = Backbone.Firebase.Collection.extend({
  model: GameModel,
  firebase: "https://blistering-fire-3878.firebaseio.com/games"
});
