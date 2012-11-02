var sys = require('sys'),
	express = require('express'),
	mongoose= require('mongoose'),
	db = mongoose.createConnection('localhost', 'jam'),
	app = express();
	
db.on('error', console.error.bind(console, 'connection_error:'));
app.listen(3000);

var Application = mongoose.Schema({

	id: Number,
	company: String,
	email: String,
	content: String,
	state: Number
});	

var Applicant = mongoose.Schema({
	
	applications: [Application]
});

var User = db.model('users', Applicant);

db.once('open', function() {
	
	app.get('/new', function(req, res) {
		
		var newUser = new User({applications: []});
		
		newUser.save(function(err) {
			
			if (err) {
			
				console.log(err);
			}
			else {
			
				res.send(newUser);
			}
		});
	});
	
	app.get('/:id', function(req, res){
	
		var id = req.params.id;
		
		User.findOne({'_id': id}, function(err, user) {
		
			if (err) {
				
				console.log(err);
				res.send('Bad id');
				return;
			}
			
			res.send(user);
		});
	});	
});