var PlayersView = Backbone.View.extend({
  initialize: function() {
    _.bindAll(this, 'render');
    this.collection.bind('change', this.render);
    this.collection.bind('add', this.render);
    this.listTemplate = Handlebars.compile($('#playerList-tmpl').html());
    this.selectionTemplate = Handlebars.compile($('#playerSelection-tmpl').html());
  },
  render: function() {
    this.$el.html(this.listTemplate({players: this.collection.models}));
    this.renderFrameSelection();
  },
  renderFrameSelection: function() {
    var html = this.selectionTemplate({players: this.collection.models});
    $('#matchForm select[name="player1"]').html(html);
    $('#matchForm select[name="player2"]').html(html);
  }
});

var FrameView = Backbone.View.extend({
  initialize: function() {
    this.template = this.options.template;
    var that = this;
    this.model.bind('render', function() {
      that.render();
    });
    this.model.bind('error', function() {
      $('#errorMsg').html(that.model.error);
      $('#errors').show();
      setTimeout(function() {
        $('#errors').hide();
      }, 2000);
    });
  },
  render: function() {
    var context = {match: this.model.get('match'), frame: this.model.attributes};
    var html = this.template(context);
    this.$el.html(html);
    this.setPlayerInTurnClass();
    return this;
  },
  setPlayerInTurnClass: function() {
    $('body').removeClass('playerInTurn');
    $('#player'+this.model.get('playerInTurn')).addClass('playerInTurn');
  }
});

var FrameControlsView = Backbone.View.extend({
  initialize: function() {
    this.template = this.options.template;
    var that = this;
    this.model.bind('change', function() {
      that.render();
    });
  },
  render: function() {
    var context = {frame: this.model.attributes};
    var html = this.template(context);
    this.$el.html(html);
    this.bindClicks();
    this.winnerToggle();
    return this;
  },
  winnerToggle: function() {
    if (this.model.get('winner')) {
      $('#frameControls button:not(#undeclareWinner)').attr("disabled", true);
      $('#undeclareWinner').show();
      $('#declareWinner').hide();
      $('#foul').attr("disabled", true);
      $('#newFrame').attr("disabled", false);
    }
    else {
      $('#frameControls button:not(#undeclareWinner)').attr("disabled", false);
      $('#undeclareWinner').hide();
      $('#declareWinner').show();
      $('#foul').attr("disabled", false);
      $('#newFrame').attr("disabled", true);
    }
  },
  bindClicks: function() {
    var that = this;
    $('#undoStrike').click(function() {
      that.model.undoStrike();
    });
    $('#scoreButtons button').click(function() {
      that.model.newStrike(this.value, $('#foul').is(':checked'));
    });
    $('#changePlayer').click(function() {
      that.model.changePlayer();
    });
    $('#declareWinner').click(function() {
      that.model.declareWinner();
      $('#declareWinner').hide();
      $('#undeclareWinner').show();
      that.render();
    });
    $('#undeclareWinner').click(function() {
      that.model.undeclareWinner();
      $('#undeclareWinner').hide();
      $('#declareWinner').show();
      that.render();
    });
  }
});

var FramesView = Backbone.View.extend({
  initialize: function() {
    this.template = Handlebars.compile($('#frameList-tmpl').html());
    var that = this;
    this.collection.bind('add change', function() {
      that.collection.sort();
      that.render();
    });
  },
  render: function() {
    this.$el.html(this.template({frames: this.collection.models}));
    bindFrameClicks();
  }
});

var MatchView = Backbone.View.extend({
  initialize: function() {
    var that = this;
    this.model.bind('change', function() {
      that.render();
    });
  },
  render: function() {

  }
});

var MatchesView = Backbone.View.extend({
  initialize: function() {
    this.template = Handlebars.compile($('#matchList-tmpl').html());
    var that = this;
    this.collection.bind('add change', function() {
      that.render();
    });
  },
  render: function() {
    this.$el.html(this.template({matches: this.collection.models}))
  },
  bindClicks: function() {

  }
});

var StrikesView = Backbone.View.extend({
  initialize: function() {
    this.template = Handlebars.compile($('#strikeList-tmpl').html());
    var that = this;
    this.collection.on('render', function() {
      that.render();
    });
  },
  render: function() {
    var n = 0;
    this.$el.html(this.template({breaks: this.collection.toViewJSON()}));
  }
});

function bindFrameClicks() {
  $('#frames a').click(function(event) {
    event.preventDefault();
    setCurrentFrame(currentMatch.get('frames').get(this.pathname));
    return false;
  });
}