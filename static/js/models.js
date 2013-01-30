var ROOT;
if(!ROOT) {
  ROOT = '';
}

var STRIKE_ROOT = '/api/v1/strikes/';
var FRAME_ROOT = '/api/v1/frames/';
var PLAYER_ROOT = '/api/v1/players/';
var MATCH_ROOT = '/api/v1/matches/';

var Player = Backbone.RelationalModel.extend({
  urlRoot: ROOT + PLAYER_ROOT
});

var Players = Backbone.Collection.extend({
  urlRoot: ROOT + PLAYER_ROOT,
  model: Player
});

var Match = Backbone.RelationalModel.extend({
  urlRoot: ROOT + MATCH_ROOT,
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
  fetchFrames: function(options) {
    var frames = new Frames();
    options || (options = {});
    var data = (options.data || {});
    options.data = {match: this.get('id'), limit: 0};
    return Backbone.Collection.prototype.fetch.call(frames, options);
  },
  newFrame: function() {
    if (this.get('frames').countUnfinished() == 0) {
      var frame = new Frame();
      frame.match = this;
      frame.set('player1_score', 0);
      frame.set('player2_score', 0);
      this.get('frames').create(frame);
      return frame;
    }
    else {
      throw 'Match has unfinished frames - cannot start a new frame.';
    }
  },
  calculateFrames: function() {
    var frames1 = 0;
    var frames2 = 0;
    var p1_id = this.get('player1').id;
    var p2_id = this.get('player2').id;
    $.each(this.get('frames').models, function(index, frame) {
      if (frame.get('winner')) {
        if (frame.get('winner').id === p1_id) {
          frames1++;
        }
        else if (frame.get('winner').id === p2_id) {
          frames2++;
        }
        else {
          throw "Winner is not a player in the match";
        }
      }
    });
    this.set('player1_frames', frames1);
    this.set('player2_frames', frames2);
  }
});

var Matches = Backbone.Collection.extend({
  urlRoot: ROOT + MATCH_ROOT,
  model: Match
});

var Frame = Backbone.RelationalModel.extend({
  urlRoot: ROOT + FRAME_ROOT,
  relations: [
  {
    type: Backbone.HasOne,
    key: 'match',
    relatedModel: 'Match',
    includeInJSON: Backbone.Model.prototype.idAttribute,
    reverseRelation: {
      key: 'frames',
      collectionType: 'Frames',
      includeInJSON: false
    }
  },
  {
    type: Backbone.HasOne,
    key: 'winner',
    relatedModel: 'Player',
    includeInJSON: Backbone.Model.prototype.idAttribute
  }],
  initialize: function() {
    this.set('playerInTurn', 1);
    var that = this;
  },
  initStrikes: function() {
    this.calculateScores();
    this.calculateCurrentBreak();
    this.trigger('render');
    this.get('strikes').trigger('render');
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
    var p1_id = this.get('match').get('player1').id;
    var p2_id = this.get('match').get('player2').id;
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
    var player_no;
    var other_player;
    if (i>0) {
      player_id = strikes[0].get('player').id;
      if (this.get('match').get('player1').id === player_id) {
        player_no = 1;
        other_player = 2;
      }
      else {
        player_no = 2;
        other_player = 1;
      }
    }
    $.each(strikes, function(index, strike) {
      if ((strike.get('player').id === player_id) && strike.isPot()) {
        sum += parseInt(strike.get('points'));
      }
      else {
        return false;
      }
    });
    if (sum === 0) {
      sum = undefined;
    }
    this.set('current_break_' + player_no, sum);
    this.set('current_break_' + other_player, undefined);
  },
  newStrike: function(points, foul) {
    var strike = new Strike();
    strike.set('frame', this);
    strike.set('foul', foul);
    strike.set('player', this.getPlayerInTurn());
    strike.set('points', points);
    strike.save();
    strike.set('position', this.get('strikes').length);
    this.get('strikes').unshift(strike);
    this.get('strikes').sort();
    this.initStrikes();
    return strike;
  },
  undoStrike: function() {
    var lastStrike = this.get('strikes').first();
    lastStrike.destroy();
    this.calculateScores();
    this.calculateCurrentBreak();
    this.trigger('render');
    this.get('strikes').trigger('render');
  },
  getPlayerInTurn: function() {
    if (this.get('playerInTurn') == 1)
      return this.get('match').get('player1');
    else
      return this.get('match').get('player2');
  },
  changePlayer: function() {
    if (this.get('playerInTurn') == 1) {
      if (this.get('current_break_1'))
        this.newStrike(0, false);
      this.set('playerInTurn', 2);
    }
    else {
      if (this.get('current_break_2'))
        this.newStrike(0, false);
      this.set('playerInTurn', 1);
    }
    this.trigger('render');
  },
  declareWinner: function() {
    this.set('winner', this.getPlayerInTurn());
    this.save();
    this.get('match').calculateFrames();
    this.trigger('change');
  },
  undeclareWinner: function() {
    this.set('winner', null);
    this.save();
    this.get('match').calculateFrames();
    this.trigger('change');
  }
});

var Frames = Backbone.Collection.extend({
  urlRoot: ROOT + FRAME_ROOT,
  model: Frame,
  initialize: function() {
    var that = this;
    this.bind('create', function() {
      that.sort();
    });
  },
  comparator: function(model) {
    return -model.get('position');
  },
  countUnfinished: function() {
    unfinished = 0;
    $.each(this.models, function(index, frame) {
      if (frame.get('winner') == null) {
        unfinished++;
      }
    });
    return unfinished;
  }
});

var Strike = Backbone.RelationalModel.extend({
  urlRoot: ROOT + STRIKE_ROOT,
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
      key: 'strikes',
      includeInJSON: false,
      collectionType: 'Strikes',
    }
  }
  ],
  isPot: function() {
    return ((this.get('foul') === false) && !this.isMiss());
  },
  isMiss: function() {
    return parseInt(this.get('points')) === 0;
  },
  toJSON: function(){
    // get the standard json for the object
    var json = Backbone.Model.prototype.toJSON.apply(this, arguments);

    // get the calculated value
    json.miss = !this.isPot();
    json.scoreChange = this.get('points') > 0;

    // send it all back
    return json;
  }
});

var Strikes = Backbone.Collection.extend({
  urlRoot: ROOT + STRIKE_ROOT,
  model: Strike,
  initialize: function() {
    var that = this;
  },
  comparator: function(model) {
    return -model.get('position');
  },
});