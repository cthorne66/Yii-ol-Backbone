define([
  'core',
  'backboneRelational'
  ], function() {

  mv.models.Comment = Backbone.RelationalModel.extend({
    
    urlRoot: 'api/comment'

  });

  return mv.models.Comment;
});
