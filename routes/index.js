/*
 * GET home page.
 */

exports.index = function(req, res) {
	if (!req.session.user)
		return res.redirect('/public/login.html');

	return res.redirect('/public/account.html');
};
exports.account = function(req, res) {
	if (!req.session.user)
		return res.redirect('/public/login.html');

	return res.redirect('/public/account.html');
}

exports.authentication = function(req, res) {
	var util = require('util'), querystring = require('querystring'), config = require('../config.js');

	var Evernote = require('evernode').Evernote;
	var evernote = new Evernote(config.evernoteConsumerKey,
			config.evernoteConsumerSecret, config.evernoteUsedSandbox);

	var evernote_callback = config.serverUrl + '/authentication/callback';

	evernote.oAuth(evernote_callback).getOAuthRequestToken(
			function(error, oauthToken, oauthTokenSecret, results) {

				if (error)
					return res.send("Error getting OAuth request token : "
							+ util.inspect(error), 500);

				req.session.oauthRequestToken = oauthToken;
				res.redirect(evernote.oAuthRedirectUrl(oauthToken));
			});

};

exports.authCallback = function(req, res) {
	var util = require('util'), querystring = require('querystring'), config = require('../config.js');
	// routes = require('./routes'),
	// user = require('./routes/user');

	var Evernote = require('evernode').Evernote;
	var evernote = new Evernote(config.evernoteConsumerKey,
			config.evernoteConsumerSecret, config.evernoteUsedSandbox);

	var evernote_callback = config.serverUrl
			+ '/evernote/authentication/callback';

	evernote.oAuth(evernote_callback).getOAuthAccessToken(
			req.session.oauthRequestToken, req.session.oauthRequestTokenSecret,
			req.query.oauth_verifier,
			function(err, authToken, accessTokenSecret, results) {

				if (err)
					return res.send("Error getting accessToken", 500);

				evernote.getUser(authToken, function(err, edamUser) {

					if (err)
						return res.send("Error getting userInfo", 500);

					req.session.authToken = authToken;
					req.session.user = edamUser;

					res.redirect('/');
				});
			});
};
exports.logout = function(req, res) {
	var callback = req.query.callback;
	req.session.authToken = null;
	req.session.user = null;		
	return res.redirect('/public/login.html');


};
exports.notebooks = function(req, res) {
	var util = require('util'), querystring = require('querystring'), config = require('../config.js');

	var Evernote = require('evernode').Evernote;
	var evernote = new Evernote(config.evernoteConsumerKey,
			config.evernoteConsumerSecret, config.evernoteUsedSandbox);
	if (!req.session.user)
		return res.send('Unauthenticate', 401);

	var userInfo = req.session.user;

	evernote.listNotebooks(userInfo, function(err, tagList) {
		if (err) {
			if (err == 'EDAMUserException')
				return res.send(err, 403);
			return res.send(err, 500);
		} else {
			console.log(JSON.stringify(tagList));
			return res.send(tagList, 200);
		}
	});
};
