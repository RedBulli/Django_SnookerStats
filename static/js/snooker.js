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
  matches.fetch({success: function(collection, response){
    var matchesView = new MatchesView({collection: matches, el: '#matches'});
    matchesView.render();
    if (matches.length > 0)
      setCurrentMatch(matches.last());
  }});
  /*
  frames = new Frames();
  frames.fetch({success: function(collection, response){
    var framesView = new FramesView({collection: frames, el: '#frames'});
    framesView.render();
    if (frames.length > 0)
      setCurrentFrame(frames.first());
  }});
  */
  

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
      })
      .fail(function(jqXHR, textStatus, errorThrown) {
        formEl.find('.status').html(textStatus.responseText);
      });
    return false;
  });
  
  $('#matchForm').submit(function() {
    var match = new Match();
    var formEl = $(this);
    var p1_el = formEl.find('select[name="player1"]');
    var p2_el = formEl.find('select[name="player2"]');
    var p1_id = p1_el.val();
    var p2_id = p2_el.val();
    match.set('player1', players.get(p1_id));
    match.set('player2', players.get(p2_id));
    formEl.find('.status').html('Saving match...');
    match.save()
      .done(function(data) {
        formEl.trigger('close');
        p1_el.val('');
        p2_el.val('');
        formEl.find('.status').html('');
        matches.add(match);
        //setCurrentFrame(frame);
      })
      .fail(function(jqXHR, textStatus, errorThrown) {
        formEl.find('.status').html(textStatus.responseText);
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
  $('#newFrame').click(function() {
    currentMatch.newFrame();
  });
});

function setCurrentMatch(match) {
  currentMatch = match;
  currentMatch.fetchFrames({
    success: function() {
      var framesView = new FramesView({collection: match.get('frames'), el: '#frames'});
      framesView.render();
      if (match.get('frames').length > 0)
        setCurrentFrame(match.get('frames').last());
    }
  });
}

function setCurrentFrame(frame) {
  currentMatch.currentFrame = frame;
  frame.fetchStrikes({
    success: function() {
      var frame_template = Handlebars.compile($('#frame-tmpl').html());
      var frameView = new FrameView({model: frame, el: '#currentFrame', 
        template: frame_template});
      frameView.render();
      $('#undoStrike').click(function(e) {
        frame.undoStrike();
      });
      $('.ballButton').click(function() {
        frame.newStrike(this.value, $('#foul').is(':checked'));
      });
      $('#changePlayer').click(function() {
        frame.changePlayer();
      });
    }
  });
}
