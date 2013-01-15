var players;
var frames;
var currentFrame;

$(document).ready(function() {
  players = new Players();
  players.fetch({dataType: 'jsonp', success: function(collection, response){
    frames = new Frames();
    frames.fetch({dataType: 'jsonp', success: function(collection, response){
      if (frames.length > 0)
        setCurrentFrame(frames.first());
    }});
  }});
});

function setCurrentFrame(frame) {
  currentFrame = frame;
  currentFrame.fetchStrikes({
    dataType: 'jsonp',
    success: function() {
      var frame_template = Handlebars.compile($('#frame-tmpl').html());
      var frameView = new FrameView({model: currentFrame, el: '#currentFrame', 
        template: frame_template});
      frameView.render();
    }
  });
}
