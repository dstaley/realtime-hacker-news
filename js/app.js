var App = Ember.Application.create();

App.ApplicationAdapter = DS.FirebaseAdapter.extend({
    firebase: new Firebase("https://hacker-news.firebaseio.com/v0")
});

App.Item = DS.Model.extend({
    title: DS.attr('string'),
    by: DS.attr('string'),
    score: DS.attr('number'),
    type: DS.attr('string'),
    url: DS.attr('string'),
    domain: function() {
        var url_parts = (new URL(this.get('url')).hostname).split('.');
        return '%@.%@'.fmt(url_parts[url_parts.length - 2], url_parts[url_parts.length - 1])
    }.property('url'),
    commentsUrl: function() {
        return '//news.ycombinator.com/item?id=%@'.fmt(this.id)
    }.property('id'),
    authorUrl: function() {
        return '//news.ycombinator.com/user?id=%@'.fmt(this.get('by'))
    }.property('by'),
    time: DS.attr('number'),
    publishedDate: function() {
        return moment.unix(this.get('time')).fromNow();
    }.property('time'),
    isUrl: function() { return this.get('type') == 'story' }.property('type'),
    isJob: function() { return this.get('type') == 'job' }.property('type')
});

Ember.Inflector.inflector.uncountable('item');

App.IndexRoute = Ember.Route.extend({
    model: function() {
        var route = this;
        return new Ember.RSVP.Promise(function(resolve, reject) {
            $.getJSON('https://hacker-news.firebaseio.com/v0/topstories.json', function(stories) {
                for (var i = 0; i < 30 + 1; i++) {
                    route.store.find('item', stories[i]);
                }
                resolve(route.store.all('item'));
            });
        });
    }
});