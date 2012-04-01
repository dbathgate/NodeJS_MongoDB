/**
 * Module dependencies.
 */

var express = require('express'), routes = require('./routes');

var app = module.exports = express.createServer();

// Configuration

app.configure(function() {
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(__dirname + '/public'));
});

app.configure('development', function() {
	app.use(express.errorHandler({
	  dumpExceptions : true,
	  showStack : true
	}));
});

app.configure('production', function() {
	app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);

var mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/node", function(err) {
	if (err) {
		throw err;
	} else {
		console.log("Connected to MongoDB");
	}
});

var Schema = mongoose.Schema, ObjectId = Schema.ObjectId;

var Task = new Schema({
	task : String
});

var Task = mongoose.model("Task", Task);

app.get("/tasks", function(req, resp) {
	Task.find({}, function(err, docs) {
		resp.render("tasks/index", {
		  title : "Tasks",
		  layout : "twitter.jade",
		  docs : docs
		});
	});
});

app.post("/tasks", function(req, resp){
	var task = new Task(req.body.task);
	
	task.save(function(err){
		if(err){
			resp.redirect("/tasks/new");
		}else{
			resp.redirect("/tasks");
		}
	});
});

app.put("/tasks/:id", function(req, resp){
	Task.findById(req.params.id, function(err, doc){
		if(err){
			resp.redirect("/tasks");
		}else{
			doc.task = req.body.task.task;
			doc.save(function(err){
				if(err){
					throw err;
				}else{
					resp.redirect("/tasks");
				}
			});
		}
	});
});

app.get("/tasks/new", function(req, resp) {
	resp.render("tasks/new.jade", {
		title: "New Task",
		layout: "twitter.jade"
	});
});

app.get("/tasks/:id/edit", function(req, resp){
	Task.findById(req.params.id, function(err, doc){
		if(err){
			resp.redirect("/tasks/new");
		}else{
			resp.render("tasks/edit.jade",{
				title: "Edit Task",
				task: doc,
				layout: "twitter.jade"
			});
		}
	});
});


app.listen(8080);
console.log("Express server listening on port %d in %s mode",
    app.address().port, app.settings.env);
