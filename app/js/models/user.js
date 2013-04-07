define([
  'core',
  'models/post',
  'models/comment',
  'collections/posts',
  'collections/comments',
  'backboneRelational'
  ], function(core, PostModel, CommentModel, PostCollection, CommentCollection) {

  mv.models.User = Backbone.RelationalModel.extend({

    urlRoot: 'api/user',

    defaults: {
      fname: '',
      lname: '',
      email: '',
      username: '',
      create_date: '',
      role: ''
    },

    relations: [
      {
        type: Backbone.HasMany, 
        key: 'posts',
        relatedModel: PostModel,
        collectionType: PostCollection, 
        reverseRelation: {
          key: 'author',
          keySource: 'user_id',
          includeInJSON: Backbone.Model.prototype.idAttribute
        }
      },
      {
        type: Backbone.HasMany, 
        key: 'comments',
        relatedModel: CommentModel,
        collectionType: CommentCollection, 
        reverseRelation: {
          key: 'author',
          keySource: 'user_id',
          includeInJSON: Backbone.Model.prototype.idAttribute
        }
      }
    ]
  });
  return mv.models.User;
});
