// var AppView = Backbone.View.extend({
//   el: $('#goAppBackbone'),

//   initialize: function() {
//     console.log(this.$el.append("<h1>initialized</h1>"));
//     // this.gamesLobbyView = new GamesLobbyView;
//   },

//   render: function() {

//   }

// });

var GamesLobbyView = Backbone.View.extend({
  el: $('#gameLobbyBackbone'),

  initialize: function() {
    this.listenTo(this.collection, "add remove", this.render);
  },

  render: function() {
    this.$el.empty();
    for (var i = this.collection.length - 1; i >= 0; i--) {
      var gameModel = this.collection.models[i];
      var gameLabelHTML = Mustache.render("<a class='list-group-item' class='gameLink' href='#'>{{name}} | {{size}}x{{size}} | Move {{moveCount}}</a>", gameModel.attributes);
      this.$el.append(gameLabelHTML);
    }
    return this;
  }

});

var OpenGameView = Backbone.View.extend({

});
