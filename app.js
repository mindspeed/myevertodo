var express = require('express'),
    util = require('util'),
    jade = require('jade'),
    querystring = require('querystring'),
    config = require('./config.js'),
    routes = require('./routes'),
	page = require('./routes/page'),
	enml = require('enml-js');

var app = express();

var Evernote = require('evernode').Evernote;

var evernote = new Evernote(
		config.evernoteConsumerKey,
		config.evernoteConsumerSecret,
		config.evernoteUsedSandbox
		);

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');

	app.use(express.cookieParser()); 
	app.use(express.bodyParser());
	app.use('/public', express.static(__dirname + '/public'));
	
	app.use(express.session(
		{ secret: "EverestJS" }
	));
	
	app.use(function(req, res, next){
	    res.locals.user = req.session.user;
	    next();
	  });
});

app.all('/', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

app.get('/',routes.index);
app.all('/authentication' , routes.authentication);
app.all('/authentication/callback' , routes.authCallback);
app.get('/logout' , routes.logout);
app.get('/account', routes.account);
app.get('/notebooks',routes.notebooks);
app.get('/notes/:guid',page.notes);
app.get('/todo/:guid',page.todo);
app.listen(config.serverPort);

