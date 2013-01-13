var STRIKE_ROOT = '/api/v1/strikes/';
var FRAME_ROOT = '/api/v1/frames/';
var PLAYER_ROOT = '/api/v1/players/';

var Strike = Backbone.RelationalModel.extend({
  urlRoot: STRIKE_ROOT,
  relations: [
  {
    type: Backbone.HasOne,
    key: 'player',
    relatedModel: 'Player',
    includeInJSON: Backbone.Model.prototype.idAttribute
  },
  {
    type: Backbone.HasOne,
    key: 'frame',
    relatedModel: 'Frame',
    includeInJSON: Backbone.Model.prototype.idAttribute,
    reverseRelation: {
      key: 'strikes'
    }
  }
  ],
  isPot: function() {
    return ((this.get('foul') === false) && (this.get('points') > 0));
  }
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

var Frame = Backbone.RelationalModel.extend({
  urlRoot: FRAME_ROOT,
  relations: [
  {
    type: Backbone.HasOne,
    key: 'player1',
    relatedModel: 'Player',
    includeInJSON: Backbone.Model.prototype.idAttribute
  },
  {
    type: Backbone.HasOne,
    key: 'player2',
    relatedModel: 'Player',
    includeInJSON: Backbone.Model.prototype.idAttribute
  }],
  initialize: function() {
    this.playerInTurn = 1;
  },
  fetchStrikes: function(options) {
    var strikes = new Strikes();
    options || (options = {});
    var data = (options.data || {});
    options.data = {frame: this.get('id'), limit: 0};
    return Backbone.Collection.prototype.fetch.call(strikes, options);
  },
  calculateScores: function() {
    var score1 = 0;
    var score2 = 0;
    var p1_id = this.get('player1').id;
    var p2_id = this.get('player2').id;
    $.each(this.get('strikes').models, function(index, strike) {
      var points = parseInt(strike.get('points'));
      if (p1_id === strike.get('player').id) {
        if (!strike.get('foul')) { score1 += points; }
        else { score2 += points; }
      }
      else if (p2_id === strike.get('player').id) {
        if (!strike.get('foul')) { 
          score2 += points; 
        }
        else { score1 += points; }
      }
      else {
        throw "Strike player not in the frame";
      }
    });
    this.set('player1_score', score1);
    this.set('player2_score', score2);
  },
  calculateCurrentBreak: function() {
    var sum = 0
    var strikes = this.get('strikes').models;
    var i = strikes.length;
    var player_id;
    if (i) {
      player_id = strikes[i-1].get('player').id;
    }
    while(i--)
    {
      var strike = strikes[i];
      if ((strike.get('player').id === player_id) && strike.isPot()) {
        sum += parseInt(strike.get('points'));
      }
      else {
        break;
      }
    }
    this.set('current_break', sum);
  },
  newStrike: function(points, foul) {
    var strike = new Strike();
    strike.set('frame', this);
    strike.set('foul', foul);
    strike.set('player', this.getPlayerInTurn());
    strike.set('points', points);
    this.get('strikes').create(strike);
    this.calculateScores();
    this.calculateCurrentBreak();
    return strike;
  },
  undoStrike: function() {
    var lastStrike = this.get('strikes').last();
    lastStrike.destroy();
    this.calculateScores();
    this.calculateCurrentBreak();
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
    this.trigger('change');
  }
});

var Frames = Backbone.Collection.extend({
  urlRoot: FRAME_ROOT,
  model: Frame
});