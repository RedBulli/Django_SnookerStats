var STRIKE_ROOT = '/api/v1/strikes/';
var FRAME_ROOT = '/api/v1/frames/';

var Strike = Backbone.Model.extend({
  urlRoot: STRIKE_ROOT
});

var Player = Backbone.Model.extend({
});

var PlayerView = Backbone.View.extend({

});

var Frame = Backbone.Model.extend({
  urlRoot: FRAME_ROOT,
  playerInTurn: 1,
  newStrike: function(points, foul) {
    var strike = new Strike();
    strike.set("frame", this);
    strike.set("foul", foul);
    strike.set("player", this.getPlayerInTurn());
    strike.set("points", points);
    var that = this;
    strike.save({}, {success: function() {
      that.fetch({success: function() {
        that.trigger("render");
      }});
    }});
    return strike;
  },
  getPlayerInTurn: function() {
    if (this.playerInTurn == 1)
      return this.get("player1");
    else
      return this.get("player2");
  },
  changePlayer: function() {
    if (this.playerInTurn == 1)
      this.playerInTurn = 2
    else
      this.playerInTurn = 1
    this.trigger("render");
  }
});

var FrameView = Backbone.View.extend({
  initialize: function() {
    this.template = this.options.template;
    var that = this;
    this.model.on("render", function() {
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

$(document).ready(function() {
  var frame_template = Handlebars.compile($('#frame-tmpl').html());
  var frame = new Frame({id: 1});
  var frame_el = document.getElementById('frame');
  var frameView = new FrameView({model: frame, el: frame_el, template: frame_template});
  frame.fetch({success: function(data) {
    frameView.render();
  }});
  $('.ballButton').click(function() {
    frame.newStrike(this.value, $('#foul').is(':checked'));
  });
  $('#changePlayer').click(function() {
    frame.changePlayer();
  });
});
