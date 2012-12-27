var STRIKE_ROOT = '/api/v1/strikes/';
var FRAME_ROOT = '/api/v1/frames/';
var PLAYER_ROOT = '/api/v1/players/';

var Strike = Backbone.RelationalModel.extend({
  urlRoot: STRIKE_ROOT
});

var Strikes = Backbone.Collection.extend({
  url: STRIKE_ROOT,
  model: Strike
});

var Player = Backbone.RelationalModel.extend({
  urlRoot: PLAYER_ROOT
});

var Players = Backbone.Collection.extend({
  url: PLAYER_ROOT,
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
    $.each(this.collection.models, function(index, value) {
      el.append('<li>' + value.get('name') + '</li>');
    });
  }
});

var Frame = Backbone.RelationalModel.extend({
  urlRoot: FRAME_ROOT,
  relations: [{
    type: Backbone.HasMany,
    key: 'strikes',
    relatedModel: 'Strike',
    collectionType: 'Strikes',
    reverseRelation: {
      key: 'frame',
      includeInJSON: 'id'
      // 'relatedModel' is automatically set to 'Zoo'; the 'relationType' to 'HasOne'.
    }
  },
  {
    type: Backbone.HasOne,
    key: 'player1',
    relatedModel: 'Player',
    reverseRelation: {
      key: 'frames_1',
      includeInJSON: 'id'
    }
  },
  {
    type: Backbone.HasOne,
    key: 'player2',
    relatedModel: 'Player',
    reverseRelation: {
      key: 'frames_2',
      includeInJSON: 'id'
    }
  }],
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

var Frames = Backbone.Collection.extend({
  url: FRAME_ROOT,
  model: Frame
});

var FramesView = Backbone.View.extend({
  render: function() {
    var el = this.$el;
    el.empty();
    $.each(this.collection.models, function(index, value) {
      el.append('<li>' + value.get('player1').get('name') + ' - ' + value.get('player2').get('name') + '</li>');
    });
  }
});

$(document).ready(function() {
  var players = new Players();
  players.fetch({success: function(collection, response){
    var playersView = new PlayersView({collection: players, el: '#players'});
    playersView.render();
  }});

  var frame_template = Handlebars.compile($('#frame-tmpl').html());
  var frames = new Frames();
  var framesView = new FramesView({collection: frames, el: '#frames'});
  frames.fetch({success: function(collection, response){
    framesView.render();
  }});
  //var frame = new Frame({id: 1});
  //var frame_el = document.getElementById('frame');
  //var frameView = new FrameView({model: frame, el: frame_el, template: frame_template});
  //frame.fetch({success: function(data) {
  //  frameView.render();
  //}});
  //$('.ballButton').click(function() {
  //  frame.newStrike(this.value, $('#foul').is(':checked'));
  //});
  //$('#changePlayer').click(function() {
  //  frame.changePlayer();
  //});
  $('#playerForm').submit(function() {
    var player = new Player();
    var name = $(this).find('input[name="name"]').val();
    player.set('name', name);
    players.create(player);
    $(this).trigger('close');
    return false;
  });

  $('#newPlayer').click(function() {
    $('#playerForm').lightbox_me();
  });
});
