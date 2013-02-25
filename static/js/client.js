var players;
var currentMatch;
var matches;
var currentFrame;

$(document).ready(function() {
  players = new Players();
  players.fetch({dataType: 'jsonp', success: matchFetch});
});

function matchFetch() {
  matches = new Matches();
  matches.fetch({dataType: 'jsonp', success: frameFetch});
}

function frameFetch() {
  currentFrame = new Frame();
  fetchFrameWithNoWinner();
  self.setInterval(function(){
    refresh();
  },10000);
}

function refresh() {
  fetchFrameWithNoWinner();
}

function fetchStrikes() {
  currentFrame.fetchStrikes({
    dataType: 'jsonp',
    success: function() {
      currentFrame.initStrikes();
      var strikeHistoryView = new StrikesView({collection: currentFrame.get('strikes'), el: '#strikeHistory'});
      strikeHistoryView.render();
    }
  });
}

function fetchFrameWithNoWinner() {
  var frames = new Frames();
  var frame_template = Handlebars.compile($('#frame-tmpl').html());
  var options = {};
  var data = (options.data || {});
  options.data = {winner__isnull: true, limit: 1};
  options.dataType = 'jsonp';
  options.success = function (collection) {
    if (collection.size() == 0) {
      noFramesInProgress();
    }
    else {
      currentFrame.fetchRelated('match');
      currentFrame = collection.first();
      var frameView = new FrameView({model: currentFrame, el: '#currentFrame', 
          template: frame_template});
      frameView.render();
      fetchStrikes();
    }
  };
  frames.fetch(options);
}

function noFramesInProgress() {
  $('#currentFrame').html('No frames in progress.');
  $('#strikeHistory').html('');
}

