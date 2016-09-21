import { Meteor } from 'meteor/meteor';
import { Links } from '../imports/collections/links';
import { WebApp } from 'meteor/webapp';
import ConnectRoute from 'connect-route';

Meteor.startup(() => {
  Meteor.publish('links', function() {
    return Links.find({});
  });
});

// localhost:3000/ NO MATCH
// localhost:3000/books/harry_potter NO MATCH
// localhost:3000/abcd MATCH

// Executed whenever user visits a route like localhost:3000/abcd
function onRoute(req, res, next) {
  // Take the token out of the URL and try to find a matching link in the links collection
  const link = Links.findOne({ token: req.params.token });

  if (link) {
  // If we find a link object, redirect the user to the long URL
    res.writeHead(307, { 'Location': link.url });
    res.end();
    Links.update(link, { $inc: { clicks: 1 }});
  } else {
  // If we don't find a link object, send the user to our normal React app
    next();
  }
}

const middleWare = ConnectRoute(function(router) {
  router.get('/:token', onRoute);
});

WebApp.connectHandlers.use(middleWare);