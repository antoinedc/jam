var sys = require('sys'),
	express = require('express'),
	mongoose= require('mongoose'),
	db = mongoose.createConnection('localhost', 'jam'),
	app = express();
	
db.on('error', console.error.bind(console, 'connection_error:'));
var port = process.env.PORT || 3000;
app.listen(port);
sys.puts('Running on port ' + port);

var Application = mongoose.Schema({

	id: String,
	company: String,
	mail: String,
	content: String,
	state: String
});	

var Applicant = mongoose.Schema({
	
	id: String,
	applications: [Application]
});

var User = db.model('users', Applicant);

db.once('open', function() {
	
	app.use(express.bodyParser());
	app.configure(function(){
		app.use('/assets', express.static(__dirname + '/assets'));
		app.use(express.static(__dirname));
	});
	app.configure(function(){

		// disable layout
		app.set("view options", {layout: false});
		app.engine('html', require('ejs').renderFile);
	});
	
	app.get('/', function(req, res) {
		
		res.render("index.html");
	});
	
	app.get('/new/:id', function(req, res) {
		
		res.header("Access-Control-Allow-Origin", "*"); 
		res.header("Access-Control-Allow-Headers", "X-Requested-With");
		
		var newUser = new User({id: req.params.id, applications: []});
		
		newUser.save(function(err) {
			
			if (err) {
			
				console.log(err);
			}
			else {
			
				res.send(newUser);
			}
		});
	});
	
	app.get('/:id', function(req, res) {
		
		res.header("Access-Control-Allow-Origin", "*"); 
		res.header("Access-Control-Allow-Headers", "X-Requested-With");
		
		var id = req.params.id;
		
		User.findOne({'id': id}, function(err, user) {
		
			if (err) {
				
				console.log(err);
				res.send('Bad id');
				return;
			}
			console.log(user);
			res.json(user);
		});
	});

	app.post('/edit', function(req, res) {
	
		res.header("Access-Control-Allow-Origin", "*"); 
		res.header("Access-Control-Allow-Headers", "X-Requested-With");
		
		var id = req.body.id;
		var applications = req.body.applications;
		
		User.findOne({'id': id}, function(err, user) {
		
			if (err){
			
				console.log(err);
				res.send('Bad id');
				return;
			}
		});
		
		var toDestroy = [];
		var toUpdate = [];
		for (i in applications)
			if (!applications[i]._destroy)
				toUpdate.push(applications[i]);

		User.update({'id': id}, {applications: toUpdate}, function(err, numberAffected, raw) {
		
			if (err) {
			
				console.log(err);
				return;
			}
			
			console.log('Updating');
			console.log('Affected documents: ', numberAffected);
			console.log('Raw response: ', raw);
		});
	});
});