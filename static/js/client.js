var players;
var currentMatch;
var matches;
var currentFrame;

var addSlash = function( str ) {
  return str + ( ( str.length > 0 && str.charAt( str.length - 1 ) === '/' ) ? '' : '/' );
}

Backbone.Model.prototype.url = function () {
  // Use the id if possible
  var url = this.id;
  
  // If there's no idAttribute, use the 'urlRoot'. Fallback to try to have the collection construct a url.
  // Explicitly add the 'id' attribute if the model has one.
  if ( !url ) {
    url = this.urlRoot;
    url = url || this.collection && ( _.isFunction( this.collection.url ) ? this.collection.url() : this.collection.url );

    if ( url && this.has( 'id' ) ) {
      url = addSlash( url ) + this.get( 'id' );
    }
  }

  url = url && addSlash( url );
  if (url) {
    if (url[0] === '/') {
      url = ROOT + url;
    }
  }
  return url || null;
}

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
    currentFrame = collection.first();
    var frameView = new FrameView({model: currentFrame, el: '#currentFrame', 
        template: frame_template});
    frameView.render();
    fetchStrikes();
  };
  frames.fetch(options);
}

