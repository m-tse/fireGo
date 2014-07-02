

var GamesLobbyView = Backbone.View.extend({
  el: $('#gameLobbyBackbone'),

  initialize: function() {
    this.listenTo(this.collection, "add remove", this.render);
  },

  render: function() {
    this.$el.empty();
    for (var i = 0; i < this.collection.length; i++) {
      var gameModel = this.collection.models[i];
      var gameLabelView = new GameLabelView({model:gameModel});

      this.$el.append(gameLabelView.render().el);
    }
    this.$el.append(Templates['public/templates/testTemplate.hbs']);
    console.log(Templates['public/templates/testTemplate.hbs']);
    // window.v = JST['templates/post/detail.hbs'];
    return this;
  }
});

var GameLabelView = Backbone.View.extend({
  tagName: "a",
  className: "list-group-item",
  template: Templates['public/templates/gameLabelTitle.hbs'],

  render: function() {
    this.$el.html(this.template(this.model.attributes));
    return this;
  }
});

var OpenGameView = Backbone.View.extend({
  initialize: function() {

  },
  render: function() {

  }
});
