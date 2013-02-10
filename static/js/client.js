var players;
var currentMatch;
var matches;
var currentFrame;

$(document).ready(function() {
  players = new Players();
  players.fetch();
  matches = new Matches();
  matches.fetch();

  currentFrame = new Frame();
  fetchFrameWithNoWinner();
  self.setInterval(function(){
    refresh();
  },10000);
});

function refresh() {
  fetchFrameWithNoWinner();
}

function fetchStrikes() {
  currentFrame.fetchStrikes({
    success: function() {
      currentFrame.initStrikes();
      frameView.render();
      var strikeHistoryView = new StrikesView({collection: currentFrame.get('strikes'), el: '#strikeHistory'});
      strikeHistoryView.render();
    }
  });
}

function fetchFrameWithNoWinner() {
  var frame_template = Handlebars.compile($('#frame-tmpl').html());
  var options = {};
  var data = (options.data || {});
  options.data = {winner__isnull: true, limit: 1};
  options.success = function () {

    var frameView = new FrameView({model: currentFrame, el: '#currentFrame', 
        template: frame_template});
    frameView.render();
    //fetchStrikes();
  };
  currentFrame.fetch(options);
}

