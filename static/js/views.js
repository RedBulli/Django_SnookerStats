var PlayersView = Backbone.View.extend({
  initialize: function() {
    _.bindAll(this, 'render');
    this.collection.bind('change', this.render);
    this.collection.bind('add', this.render);
    this.listTemplate = Handlebars.compile($('#playerList-tmpl').html());
    this.selectionTemplate = Handlebars.compile($('#playerSelection-tmpl').html());
  },
  render: function() {
    this.$el.html(this.listTemplate({players: this.collection.models}));
    this.renderFrameSelection();
  },
  renderFrameSelection: function() {
    var html = this.selectionTemplate({players: this.collection.models});
    $('#frameForm select[name="player1"]').html(html);
    $('#frameForm select[name="player2"]').html(html);
  }
});

var FrameView = Backbone.View.extend({
  initialize: function() {
    this.template = this.options.template;
    var that = this;
    this.model.bind('change', function() {
      that.render();
    });
  },
  render: function() {
    var context = {frame: this.model.attributes};
    var html = this.template(context);
    this.$el.html(html);
    this.setPlayerInTurnClass();
    return this;
  },
  setPlayerInTurnClass: function() {
    $('body').removeClass('playerInTurn');
    $('#player'+this.model.playerInTurn).addClass('playerInTurn');
  }
});

var FramesView = Backbone.View.extend({
  initialize: function() {
    this.template = Handlebars.compile($('#frameList-tmpl').html());
    var that = this;
    this.collection.bind('add', function() {
      that.render();
    });
  },
  render: function() {
    this.$el.html(this.template({frames: this.collection.models}));
  }
});