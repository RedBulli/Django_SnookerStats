var players;
var frames;
var currentFrame;

$(document).ready(function() {
  players = new Players();
  players.fetch({success: function(collection, response){
    var playersView = new PlayersView({collection: players, el: '#players'});
    playersView.render();
  }});
  
  frames = new Frames();
  frames.fetch({success: function(collection, response){
    var framesView = new FramesView({collection: frames, el: '#frames'});
    framesView.render();
    if (frames.length > 0)
      setCurrentFrame(frames.first());
  }});
  
  $('.ballButton').click(function() {
    currentFrame.newStrike(this.value, $('#foul').is(':checked'));
  });

  $('#changePlayer').click(function() {
    currentFrame.changePlayer();
  });

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
  
  $('#frameForm').submit(function() {
    var frame = new Frame();
    var formEl = $(this);
    var p1_el = formEl.find('select[name="player1"]');
    var p2_el = formEl.find('select[name="player2"]');
    var p1_id = p1_el.val();
    var p2_id = p2_el.val();
    frame.set('player1', players.get(p1_id));
    frame.set('player2', players.get(p2_id));
    formEl.find('.status').html('Saving frame...');
    frame.save()
      .done(function(data) {
        formEl.trigger('close');
        p1_el.val('');
        p2_el.val('');
        formEl.find('.status').html('');
        frames.add(frame);
        setCurrentFrame(frame);
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

  $('#newFrame').click(function() {
    $('#frameForm').lightbox_me({
      centered: true, 
      onLoad: function() { 
        $('#frameForm').find('select[name="player1"]').focus();
      }
    });
  });
});

function setCurrentFrame(frame) {
  currentFrame = frame;
  currentFrame.fetchStrikes({
    success: function() {
      var frame_template = Handlebars.compile($('#frame-tmpl').html());
      var frameView = new FrameView({model: currentFrame, el: '#currentFrame', 
        template: frame_template});
      frameView.render();
      $('#undoStrike').click(function(e) {
        currentFrame.undoStrike();
      });
    }
  });
}
