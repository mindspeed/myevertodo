exports.notes = function(req, res) {
	var util = require('util'), querystring = require('querystring'), config = require('../config.js');

	var Evernote = require('evernode').Evernote;
	var evernote = new Evernote(config.evernoteConsumerKey,
			config.evernoteConsumerSecret, config.evernoteUsedSandbox);

	if (!req.session.user)
		return res.send('Unauthenticate', 401);

	var userInfo = req.session.user;
	var offset = req.query.offset || 0;
	var count = req.query.count || 50;
	var words = req.query.words || '';
	var sortOrder = req.query.sortOrder || 'UPDATED';
	var ascending = req.query.ascending || false;
	var notebookguid = req.params.guid;

	evernote.findNotes(userInfo, words, {
		offset : offset,
		count : count,
		sortOrder : sortOrder,
		ascending : ascending
	}, function(err, noteList) {
		if (err) {
			if (err == 'EDAMUserException')
				return res.send(err, 403);
			return res.send(err, 500);
		} else {
			var note = noteList['notes'], notes = [];

			for ( var i = 0, len = note.length; i < len; i++) {
				if (note[i]['notebookGuid'] == notebookguid) {
					notes.push(noteList['notes'][i]);
				}
			}
			var finaldata = {
				"NotesData" : notes
			};
			res.render('page', {
				notes : JSON.stringify(finaldata),
				scripts : [ '/public/lib/jquery/jquery.js',
						'/public/lib/jquery/jquery.dataTables.js' ]
			});
		}
	});
};
exports.todo = function(req, res) {
	var util = require('util'), querystring = require('querystring'), config = require('../config.js'), enml = require('enml-js');

	var Evernote = require('evernode').Evernote;
	var evernote = new Evernote(config.evernoteConsumerKey,
			config.evernoteConsumerSecret, config.evernoteUsedSandbox);

	if (!req.session.user)
		return res.send('Unauthenticate', 401);
	if (!req.body)
		return res.send('Invalid content', 400);

	var userInfo = req.session.user;
	var guid = req.params.guid;
	var option = {
		withContent : true,
		withResourcesData : true,
		withResourcesRecognition : true,
		withResourcesAlternateData : true
	};

	evernote.getNote(userInfo, guid, option, function(err, note) {

		if (err) {
			if (err == 'EDAMUserException')
				return res.send(err, 403);
			return res.send(err, 500);
		}
		var todotext = enml.TodosOfENML(note.content);
		var todohtmlcontent = "";
		for ( var i = 0; i < todotext.length; i++) {
			todohtmlcontent += '<p style="color: #53A753;"><u><em>' + todotext[i].text + "</p>";
		}
		if (todotext == "") {
			todohtmlcontent = " No Task Found !!";
		}

		todohtmlcontent = '<!DOCTYPE html><html><head> <link media="screen" rel="stylesheet" '+
							'href="/public/lib/bootstrap/css/bootstrap.css"><style>#btnn{float: left;width: 17%;'+
							'height: 104px;margin-left: 14%;margin-top:3%;}</style></head><body>'+
							'<div style="width: 100%; float: left;"><div style="float: left; width: 34%; '+
							'margin-top: 10%; margin-left: 31%;"><h1 style="color: #53A753;">To Do List </h1>'+todohtmlcontent+
							'</div><div id="btnn" class="container"><a href="/logout" class="btn btn-success btn-medium">'+
							'<i class="icon-white icon-user"></i> Log out</a></div></div><script src="http://code.jquery.com/jquery.js">'+
							'</script><script src="js/bootstrap.min.js"></script></body></html>';
		res.send(todohtmlcontent, 200);

		/*
		 * var finaldata = { "Todolist" : todotext };
		 * 
		 * res.render('todo', { todolist: JSON.stringify(finaldata), scripts : [
		 * '/public/lib/jquery/jquery.js',
		 * '/public/lib/jquery/jquery.dataTables.js' ] });
		 */

	});
};
