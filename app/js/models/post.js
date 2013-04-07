define([
  'core',
  'models/comment',
  'collections/comments',
  'backboneRelational'
  ], function(core, CommentModel, CommentCollection) {

  mv.models.Post = Backbone.RelationalModel.extend({

    urlRoot: 'api/post',

    defaults: {
      title: '',
      content: '',
      create_date: '',
      is_deleted: null,
      user_id: ''
    },

    relations: [
      {
        type: Backbone.HasMany,
        key: 'comments',
        relatedModel: CommentModel,
        collectionType: CommentCollection,
        reverseRelation: {
          key: 'post',
          keySource: 'post_id',
          includeInJSON: Backbone.Model.prototype.idAttribute
        }
      }
    ],

    fetchRelated: function( key, options ) {
      if('comments' == key && !this.get('comments').length) {
        var self = this;
        return [$.ajax({
          url: 'post/comments/id/' + self.get('id'),
          success: function(data) {
            self.get('comments').reset(data);
          }
        })];
      }
      return Backbone.RelationalModel.prototype.fetchRelated.call( this, key, options );
    }

  });
  return mv.models.Post;
});
