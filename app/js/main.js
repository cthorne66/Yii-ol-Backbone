// Use ECMAScript 5 Strict Mode
"use strict";

// Define jQuery as AMD module
define.amd.jQuery = true;

// Require.js allows us to configure mappings to paths
// as demonstrated below:
// TODO: Load minified version of the libs or use Require.js's JS compiler (R)
requirejs.config({
  paths: {
    jquery               : 'libs/jquery/jquery-1.7.1.min',
    jqueryUICore         : 'libs/jquery-ui/jquery.ui.core',
    jqueryUIWidget       : 'libs/jquery-ui/jquery.ui.widget',
    jqueryUIMouse        : 'libs/jquery-ui/jquery.ui.mouse',
    jqueryUIPosition     : 'libs/jquery-ui/jquery.ui.position',
    jqueryUIAutocomplete : 'libs/jquery-ui/jquery.ui.autocomplete',
    jqueryUIDatepicker   : 'libs/jquery-ui/jquery.ui.datepicker',
    cookie               : 'libs/jquery/jquery.cookie',
    underscore           : 'libs/underscore/underscore',
    underscoreString     : 'libs/underscore/underscore.string',
    backbone             : 'libs/backbone/backbone',
    backboneRelational   : 'libs/backbone/backbone-relational',
    modelbinding         : 'libs/backbone/backbone.modelbinding',
    visualsearch         : 'libs/app/visualsearch',
    marionette           : 'libs/backbone/backbone.marionette',
    text                 : 'libs/require/text',
    domReady             : 'libs/require/domReady',
    json                 : 'libs/utils/json2',
    bootstrapAlert       : 'libs/bootstrap/bootstrap-alert',
    bootstrapButton      : 'libs/bootstrap/bootstrap-button',
    bootstrapDropdown    : 'libs/bootstrap/bootstrap-dropdown',
    bootstrapModal       : 'libs/bootstrap/bootstrap-modal',
    bootstrapTab         : 'libs/bootstrap/bootstrap-tab',
    bootstrapTypeahead   : 'libs/bootstrap/bootstrap-typeahead',
    // bootstrapWysihtml5   : 'libs/bootstrap/bootstrap-wysihtml5',
  },
  shim: {
    underscore: {
      exports: '_'
    },
    backbone: {
      deps: ["underscore", "jquery"],
      exports: "Backbone"
    },
    visualsearch: {
      deps: ['backbone', 'jqueryUIAutocomplete']
    },
    marionette: {
      deps: ['backbone']
    }
  }
});

define([
  'jquery',
  'underscore',
  'backbone',
  'domReady',
  'router',
  'app',
  'models/login',
  'models/post',
  'models/comment',
  'models/webUser',
  'collections/user',
  'collections/post',
  'collections/comment',
  'views/home',
  'views/navbar',
  'views/search',
  'views/login',
  'views/user/list',
  'views/post/list',
  'views/comment/list',
  'views/post/form',
  'views/comment/form',
  'views/user/form',
  'views/post/form',
  'views/alert',
  'models/user',
  'views/post/item',
  'cookie',
  'bootstrapDropdown',
  'bootstrapModal',
  'backboneRelational'
], function($, _, Backbone, domReady,
            Router, App,
            LoginModel, PostModel, CommentModel, WebUser,
            UserCollection, PostCollection, CommentCollection,
            HomeView, NavbarView, SearchView, LoginView,
            UserListView, PostListView, CommentListView,
            PostFormView, CommentFormView, UserForm, PostForm, AlertView,
            UserModel, PostItem) {

  $.ajaxSetup({
    dataFilter: function(data, dataType) {
      if ('Login Required!' === data) {
        window.location.replace('/#login');
        // Return something not json parsable to
        // stop event triggering and ajax loading.
        // Looking for better solution.
        return ';';
      }
      return data;
    }
  });

  // Initialize Router
  App.addInitializer(function (options) {
    this.router = new Router();
    Backbone.history.start();
  });


  // JS sugar for all dropdowns with this class
  App.addInitializer(function (options) {
    $('.dropdown-toggle').dropdown();
  });

  // Cross app collections
  App.users    = new UserCollection;
  App.posts    = new PostCollection;
  App.comments = new CommentCollection;

  // Web User
  App.vent.on('webUser:init', function(data) {

    var model = data instanceof WebUser ? data : new WebUser(data);
    var navbarView = new NavbarView({model: model});

    navbarView.render();
    var searchView = new SearchView({});
    searchView.render();
    model.on('destroy', searchView.close, searchView);
    model.on('destroy',function() {
      navbarView.close();
      App.vent.trigger('login');
    });

    model.on('destroy', function() {App.vent.trigger('login')});
    this.vent.on('logout', model.destroy, model);
  }, App);

  App.vent.on('login', function() {
    Backbone.history.navigate('/#login');
    var model = new WebUser;
    var loginView = new LoginView({model: model});
    this.mainRegion.show(loginView);
    model.on('login', function() {
      App.vent.trigger('webUser:init', this);
      App.vent.trigger('order:new');
    }, model);
  }, App);

  // Alerts

  App.vent.on('alert', function (options) {
    var alertView = new AlertView(options);
    this.headRegion.show(alertView);
  }, App);

  // Users

  App.vent.on('user:list', function () {
    $.when(
      this.users.length || this.users.fetch()
    ).done(function() {
        Backbone.history.navigate('user/list');
        var view = new UserListView({
          collection: App.users
        });
        App.mainRegion.show(view);
      });
  }, App);

  App.vent.on('user:new', function() {
    Backbone.history.navigate('user/new');
    var view = new UserForm({model: new UserModel, vent:this.vent});
    App.mainRegion.show(view);
  }, App);

  App.vent.on('user:new', function () {
    Backbone.history.navigate('user/new');
    App.vent.trigger('user:form', new UserModel);
  }, App);

  App.vent.on('user:edit', function (model, options) {
    $.when(function () {
      if (!model) {
        model = new UserModel(options);
        return model.fetch();
      }
      return model;
    }()).then(function () {
        Backbone.history.navigate('user/edit/' + model.get('id'));
        App.vent.trigger('user:form', model);
      });
  }, App);

  App.vent.on('user:form', function (model) {
    $.when(
//      this.accounts.length || this.accounts.fetch(),
//      this.publications.length || this.publications.fetch(),
//      this.rateTypes.length || this.rateTypes.fetch(),
//      this.representatives.length || this.representatives.fetch()
    ).done(function () {
        var view = new UserForm({model: model});
        App.mainRegion.show(view);
      });
  }, App);

  // Posts
  App.vent.on('post:list', function () {
    $.when(
      this.posts.length || this.posts.fetch()
    ).done(function() {
        Backbone.history.navigate('post/list');
        var view = new PostListView({
          collection : App.posts,
//          user       : this.loginModel,
        });
        App.mainRegion.show(view);
      });
  }, App);

  App.vent.on('post:new', function () {
    Backbone.history.navigate('order/new');
    App.vent.trigger('order:form', new PostModel);
  }, App);

  App.vent.on('post:edit', function (model, options) {
    $.when(function () {
      if (!model) {
        model = new PostModel(options);
        return model.fetch();
      }
      return model;
    }()).then(function () {
      Backbone.history.navigate('post/edit/' + model.get('id'));
      App.vent.trigger('post:form', model);
    });
  }, App);

  App.vent.on('post:form', function (model) {
    $.when(
//      this.accounts.length || this.accounts.fetch(),
//      this.publications.length || this.publications.fetch(),
//      this.rateTypes.length || this.rateTypes.fetch(),
//      this.representatives.length || this.representatives.fetch()
    ).done(function () {
        var view = new PostForm({model: model});
        App.mainRegion.show(view);
      });
  }, App);

  App.vent.on('post:read', function(model, options) {
    $.when(function () {
      if (!model) {
        model = new PostModel(options);
        return model.fetch();
      }
      return model;
    }()).then(function () {
      Backbone.history.navigate('post/read/' + model.get('id'));
      var view = new PostItem({model: model});
      App.mainRegion.show(view);
    });

  }, App);

  var TT = Backbone.View.extend({

    initialize: function() {
      _.bindAll(this,'initSearch','initViews','checkAuth');

      // declare main custom event object
      this.vent = _.extend({}, Backbone.Events);

      this.users    = new UserCollection;
      this.users.fetch();

      this.posts    = new PostCollection;
      this.comments = new CommentCollection;

      // Initialize login view
      this.loginModel = new LoginModel;

      this.initViews();
      this.initSearch();
      this.checkAuth();
    },

    checkAuth: function() {
      var self = this;

      // Check user authentication
      var params = this.getCookieParams();
      if (params) {
        self.loginModel.set('username', params.username);
        self.loginModel.set('token', params.token);
        self.loginModel.set('authenticated', true);
      }
    },

    initSearch: function() {
      // Initialize main search
      var self = this;
      domReady(function() {
        var searchView = new SearchView({
          posts    : self.posts,
          comments : self.comments,
          vent     : self.vent,
        });
      });
    },

    initViews: function() {
      // Login view
      var loginView = new LoginView({model:this.loginModel, vent:this.vent});
      loginView.render();

      // Navbar view
      var navbarView = new NavbarView({vent:this.vent});

      // List views
      var userListView    = new UserListView({collection:this.users, vent:this.vent});
      var postListView = new PostListView({
        collection : this.posts,
        user       : this.loginModel,
        vent       : this.vent,
      });
      var commentListView = new CommentListView({collection:this.comments, vent:this.vent});

      // Form views
      var postFormView = new PostFormView({
        model : new PostModel,
        user  : this.loginModel,
        vent  : this.vent,
      });
      var commentFormView = new CommentFormView({model: new CommentModel, vent:this.vent});
    },


    getCookieParams: function() {
      if ($.cookie('_yiibackbone')) {
        var data = $.cookie('_yiibackbone').split(',');
        var params = {
          username: data[0],
          token: data[1],
        }
        return params;
      }
    }

  });

  // Load code defined on php side in main layout and start an App.
  require(['onLoad']);
  App.start();
});
