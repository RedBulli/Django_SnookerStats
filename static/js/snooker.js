var players;
var currentMatch;
var matches;

var STRIKE_ROOT = '/api/v1/strikes/';
var FRAME_ROOT = '/api/v1/frames/';
var PLAYER_ROOT = '/api/v1/players/';

$(document).ready(function() {
  players = new Players();
  players.fetch({success: function(collection, response){
    var playersView = new PlayersView({collection: players, el: '#players'});
    playersView.render();
  }});
  matches = new Matches();
  matches.fetchOrdered({success: function(collection, response){
    var matchesView = new MatchesView({collection: matches, el: '#matches'});
    matchesView.render();
    bindMatchClicks();
  }});

  $('#playerForm').submit(function() {
    var player = new Player();
    var formEl = $(this);
    var name = formEl.find('input[name="name"]').val();
    player.set('name', name);
    formEl.find('.status').html('Saving player...');
    player.save()
      .done(function(data) {
        formEl.trigger('close');
        formEl.find('input[name="name"]').val('');
        formEl.find('.status').html('');
        players.add(player);
        $('#playerForm input[type=submit]').attr('disabled', false);
      })
      .fail(function(jqXHR, textStatus, errorThrown) {
        formEl.find('.status').html(textStatus.responseText);
        $('#playerForm input[type=submit]').attr('disabled', false);
      });
    return false;
  });
  
  $('#matchForm').submit(function() {
    $('#matchForm input[type=submit]').attr('disabled', true);
    var match = new Match();
    var formEl = $(this);
    var p1_el = formEl.find('select[name="player1"]');
    var p2_el = formEl.find('select[name="player2"]');
    var p1_id = p1_el.val();
    var p2_id = p2_el.val();
    match.set('player1', players.get(p1_id));
    match.set('player2', players.get(p2_id));
    formEl.find('.status').removeClass('text-error');
    formEl.find('.status').html('Saving match...');
    match.save()
      .done(function(data) {
        formEl.trigger('close');
        p1_el.val('');
        p2_el.val('');
        formEl.find('.status').html('');
        matches.add(match);
        setCurrentMatch(match);
        $('#matchForm input[type=submit]').attr('disabled', false);
      })
      .fail(function(jqXHR, textStatus, errorThrown) {
        formEl.find('.status').html(textStatus.responseText);
        formEl.find('.status').addClass('text-error');
        $('#matchForm input[type=submit]').attr('disabled', false);
      });
    return false;
  });

  $('#newPlayer').click(function(e) {
    $('#playerForm').lightbox_me({
      centered: true, 
      onLoad: function() { 
        $('#playerForm').find('input[name="name"]').focus();
      }
    });
    e.preventDefault();
  });

  $('#newMatch').click(function() {
    $('#matchForm').lightbox_me({
      centered: true, 
      onLoad: function() { 
        $('#matchForm').find('select[name="player1"]').focus();
      }
    });
  });
  function always(value) { return function(_) { return value; }}

  var allKeyUps = $(document).asEventStream('keyup');
  var allKeyDowns = $(document).asEventStream('keydown');
  var spacebarKeyDowns = allKeyDowns.filter(function(event) { return event.keyCode == 32 });
  var spacebarKeyUps = allKeyUps.filter(function(event) { return event.keyCode == 32 });
  spacebarKeyDowns.onValue(function(event) {
    event.preventDefault();
  });
  spacebarKeyUps.onValue(function(event) {
    currentMatch.currentFrame.changePlayer();
  });
  var numKeyUps = allKeyUps.filter(function(event) { 
    var num = getNumberFromKeyCode(event.keyCode);
    return ((num >= 0) && (num <= 7));
  });
  numKeyUps.onValue(function(event) {
    var points = getNumberFromKeyCode(event.keyCode)
    currentMatch.currentFrame.newStrike(points, event.shiftKey);
  });
  var slashKeyUps = allKeyUps.filter(function(event) {
    return event.keyCode === 191;
  });
  slashKeyUps.onValue(function(event) {
    currentMatch.currentFrame.newStrike(7, true);
  });
  var shiftKeyDowns = allKeyDowns.filter(function(event) { return event.shiftKey; });
  var shiftKeyUps = allKeyUps.filter(function(event) { return !event.shiftKey; });

  function shiftKeyState() {
    return shiftKeyDowns.map(always(true))
    .merge(shiftKeyUps.map(always(false)))
    .toProperty(false);
  }
  shiftKeyState().onValue(function(foul) {
    $('#foul').attr('checked', foul);
  });
});

function setCurrentMatch(match) {
  currentMatch = match;
  currentMatch.fetchFrames({
    success: function() {
      var framesView = new FramesView({collection: match.get('frames'), el: '#frames'});
      framesView.render();
      if (match.get('frames').length > 0)
        setCurrentFrame(match.get('frames').first());
      else {
        var frame = currentMatch.newFrame();
        setCurrentFrame(frame);
      }
    }
  });
  $('#newFrame').unbind('click').click(function() {
    var frame = currentMatch.newFrame();
    currentMatch.get('frames').sort();
    setCurrentFrame(frame);
  });
  bindMatchClicks();
}

function setCurrentFrame(frame) {
  currentMatch.currentFrame = frame;
  frame.fetchStrikes({
    success: function() {
      var frame_template = Handlebars.compile($('#frame-tmpl').html());
      var frameView = new FrameView({model: frame, el: '#currentFrame', 
        template: frame_template});
      frame.initStrikes();
      var frame_controls_tmpl = Handlebars.compile($('#frame_controls-tmpl').html());
      var frameControlsView = new FrameControlsView({model: frame, el: '#frameControls', 
        template: frame_controls_tmpl});
      frameControlsView.render();
      var strikeHistoryView = new StrikesView({collection: frame.get('strikes'), el: '#strikeHistory'});
      strikeHistoryView.render();
    }
  });
}

function getNumberFromKeyCode(keyCode) {
  var number = keyCode - 48;
  if (number >= 0 || number <= 9) {
    return number;
  }
}

function bindMatchClicks() {
  $('#matches a').click(function(event) {
    event.preventDefault();
    setCurrentMatch(matches.get(this.pathname));
    return false;
  });
}
