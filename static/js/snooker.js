var STRIKE_ROOT = '/api/v1/strikes/';
var FRAME_ROOT = '/api/v1/frames/';

var Strike = Backbone.Model.extend({
  urlRoot: STRIKE_ROOT
});

var Frame = Backbone.Model.extend({
  urlRoot: FRAME_ROOT
});

var FrameView = Backbone.View.extend({
  urlRoot: FRAME_ROOT,
  initialize: function() {
    this.template = this.options.template;
  },
  render: function() {
    var context = {frame: this.model.attributes};
    var html = this.template(context);
    console.log(html);
    this.$el.html(html);
    return this;
  }
});

$(document).ready(function() {
  var frame_template = Handlebars.compile($('#frame-tmpl').html());
  var frame = new Frame({id: 1});
  var frame_el = document.getElementById('frame');
  var frameView = new FrameView({model: frame, el: frame_el, template: frame_template});
  frame.fetch({success: function(data) {
    frameView.render();
  }});
});
