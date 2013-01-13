var PlayersView = Backbone.View.extend({
  initialize: function() {
    _.bindAll(this, 'render');
    this.collection.bind('change', this.render);
  },
  render: function() {
    var el = this.$el;
    el.empty();
    $.each(this.collection.models, function(index, player) {
      el.append('<li>' + player.get('name') + '</li>');
    });
    this.renderFrameSelection();
  },
  renderFrameSelection: function() {
    this.renderSelect($('#frameForm select[name="player1"]'));
    this.renderSelect($('#frameForm select[name="player2"]'));
  },
  renderSelect: function(el) {
    el.empty();
    el.append('<option value="" selected="selected">Choose player</option>');
    $.each(this.collection.models, function(index, value) {
      el.append('<option value="' + value.id + '">' + value.get('name') + '</option>');
    });
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
  render: function() {
    var el = this.$el;
    el.empty();
    $.each(this.collection.models, function(index, value) {
      el.append('<li>' + value.get('player1').get('name') + ' - ' 
        + value.get('player2').get('name') + '</li>');
    });
  }
});