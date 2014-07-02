

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
    return this;
  },
  returnToLobby: function() {
    $('#gameLobbyBackbone').show();
    this.remove();
  }
});
