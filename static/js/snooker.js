var STRIKE_ROOT = '/api/v1/strikes/';
var FRAME_ROOT = '/api/v1/frames/';
var PLAYER_ROOT = '/api/v1/players/';

var players;
var frames;
var currentFrame;

var Strike = Backbone.RelationalModel.extend({
  urlRoot: STRIKE_ROOT,
  relations: [
  {
    type: Backbone.HasOne,
    key: 'frame',
    relatedModel: 'Frame'
  }]
});

var Strikes = Backbone.Collection.extend({
  urlRoot: STRIKE_ROOT,
  model: Strike
});

var Player = Backbone.RelationalModel.extend({
  urlRoot: PLAYER_ROOT
});

var Players = Backbone.Collection.extend({
  urlRoot: PLAYER_ROOT,
  model: Player
});

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

var Frame = Backbone.RelationalModel.extend({
  urlRoot: FRAME_ROOT,
  relations: [
  {
    type: Backbone.HasMany,
    key: 'strikes',
    relatedModel: 'Strike',
    collectionType: 'Strikes'
  },
  {
    type: Backbone.HasOne,
    key: 'player1',
    relatedModel: 'Player'
  },
  {
    type: Backbone.HasOne,
    key: 'player2',
    relatedModel: 'Player'
  }],
  playerInTurn: 1,
  newStrike: function(points, foul) {
    var strike = new Strike();
    strike.set('frame', this);
    strike.set('foul', foul);
    strike.set('player', this.getPlayerInTurn());
    strike.set('points', points);
    this.get('strikes').create(strike);
    return strike;
  },
  getPlayerInTurn: function() {
    if (this.playerInTurn == 1)
      return this.get('player1');
    else
      return this.get('player2');
  },
  changePlayer: function() {
    if (this.playerInTurn == 1)
      this.playerInTurn = 2
    else
      this.playerInTurn = 1
    this.trigger('render');
  }
});

var FrameView = Backbone.View.extend({
  initialize: function() {
    this.template = this.options.template;
    var that = this;
    this.model.on('render', function() {
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

var Frames = Backbone.Collection.extend({
  urlRoot: FRAME_ROOT,
  model: Frame
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

$(document).ready(function() {
  players = new Players();
  players.fetch({success: function(collection, response){
    var playersView = new PlayersView({collection: players, el: '#players'});
    playersView.render();
  }});
  
  frames = new Frames();
  var framesView = new FramesView({collection: frames, el: '#frames'});
  frames.fetch({success: function(collection, response){
    framesView.render();
    displayFirstFrame();
  }});
  
  $('.ballButton').click(function() {
    currentFrame.newStrike(this.value, $('#foul').is(':checked'));
  });

  $('#changePlayer').click(function() {
    currentFrame.changePlayer();
  });

  $('#playerForm').submit(function() {
    var player = new Player();
    var name = $(this).find('input[name="name"]').val();
    player.set('name', name);
    players.create(player);
    $(this).trigger('close');
    return false;
  });
  
  $('#frameForm').submit(function() {
    var frame = new Frame();
    var p1_id = $(this).find('select[name="player1"]').val();
    var p2_id = $(this).find('select[name="player2"]').val();
    frame.set('player1', players.get(p1_id));
    frame.set('player2', players.get(p2_id));
    frames.create(frame);
    currentFrame = frame;
    var frameView = new FrameView({model: frame, el: 'currentFrame', 
      template: frame_template});
    frameView.render();
    $(this).trigger('close');
    return false;
  });

  $('#newPlayer').click(function() {
    $('#playerForm').lightbox_me();
  });

  $('#newFrame').click(function() {
    $('#frameForm').lightbox_me();
  });
});

function displayFirstFrame() {
  if (frames.models.length>0) {
    currentFrame = frames.models[0];
    var frame_template = Handlebars.compile($('#frame-tmpl').html());
    var frameView = new FrameView({model: currentFrame, el: '#currentFrame', 
      template: frame_template});
    frameView.render();
  }
}
