var players;
var frames;
var currentFrame;
//var currentStrikes;

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
    currentFrame.fetchStrikes({
      success: function() {
        var frame_template = Handlebars.compile($('#frame-tmpl').html());
        var frameView = new FrameView({model: currentFrame, el: '#currentFrame', 
          template: frame_template});
        frameView.render();
      }
    });
    /*
    currentStrikes = new Strikes();
    currentStrikes.fetchStrikes(
      {
        success: function() {
          var frame_template = Handlebars.compile($('#frame-tmpl').html());
          var frameView = new FrameView({model: currentFrame, el: '#currentFrame', 
            template: frame_template});
          frameView.render();
        }
      }
    );
*/
  }
}
