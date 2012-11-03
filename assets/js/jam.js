ko.utils.stringStartsWith = function (string, startsWith) {        	
	string = string || "";
	if (startsWith.length > string.length)
		return false;
	return string.substring(0, startsWith.length) === startsWith;
};

function uniqId () {
    
	var S4 = function () {
        return Math.floor(Math.random() * 0x10000 /* 65536 */).toString(16);
    };
    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}

var Application = function(application) {
	
	var self = this;
	self.id = application.id
	self.mail = ko.observable(application.mail);
	self.content = ko.observable(application.content);
	self.company = ko.observable(application.company);
	self.state = ko.observable(application.state);
	
	self.set_state = function(index) { self.state(index); };
	self.get_state = function() { return self.state(); };
};

var ApplicationsModel = function(applications) {

	var self = this;
	
	self.states = ['Waiting for answer', 'In progress', 'Declined', 'Hired !'];
	
	self.chosenApplicationData = ko.observable();

	self.applications = ko.observableArray(applications);

	self.isUserDefined = ko.observable(0);
	
	self.filter_email = ko.observable("");
	self.filter_name = ko.observable("");
	self.filter_wait = ko.observable(false);
	self.filter_progress = ko.observable(false);
	self.filter_declined = ko.observable(false);
	self.filter_hired = ko.observable(false);
	
	self.startNew = function() {
		
		var id = uniqId();
		$.getJSON('/new/' + id, function(data) {
		
			location.hash = id;
		});
	};
	
	Sammy(function() {
	
		this.get('#:appId', function() {
		
			self.isUserDefined(this.params.appId);
			$.getJSON(BASE_URL + this.params.appId, function(data) {
				
				console.log(data);
				self.isUserDefined(data._id);
				var mappedApplications = $.map(data.applications, function(application) { return new Application(application) });
				self.applications(mappedApplications);
			});
		});		
		this.get('', function() { 
			
			self.isUserDefined(0);
			//this.app.runRoute('get', '/#');
		});
	}).run();
	
	self.addApplication = function() {
		
		var newApp = new Application({
		
			id: uniqId(),
			mail: 'jobs@company.com',
			company: 'Company',
			content: 'My cover letter',
			state: 0
		});
		
		self.applications.push(newApp);
		self.chosenApplicationData(newApp);
	};
	
	self.save = function() {
	
		$.ajax({
			url: '/edit', 
			type: 'POST',
			dataType: 'json',
			data: ko.toJSON({id: self.isUserDefined(), applications: self.applications}), 
			contentType: 'application/json',
			success: function(data) {
			
				console.log(data);
			},
			error: function(a, b, c) {
			
				console.log(a);
				console.log(b);
				console.log(c);
			}			
		});
	};
	
	self.is_state_filter_checked = ko.computed(function() {
		console.log(self.filter_wait() || self.filter_progress() || self.filter_declined() || self.filter_hired());
		return self.filter_wait() || self.filter_progress() || self.filter_declined() || self.filter_hired();
	});	
	
	self.filteredApps = ko.computed(function() {
	
		var filter_name = self.filter_name().toLowerCase();
		var filter_email = self.filter_email().toLowerCase();
		
		if (!filter_name && !filter_email && !self.is_state_filter_checked()) {
			
			return self.applications();
		}
		else {
		
			return ko.utils.arrayFilter(self.applications(), function(application) {
				
				if (application.state() == 0 && self.filter_wait()) return true;
				if (application.state() == 1 && self.filter_progress()) return true;
				if (application.state() == 2 && self.filter_declined()) return true;
				if (application.state() == 3 && self.filter_hired()) return true;
				
				if (filter_name && filter_email)
					return (ko.utils.stringStartsWith(application.mail().toLowerCase(), filter_email)
							&& ko.utils.stringStartsWith(application.company().toLowerCase(), filter_name));
				else if (filter_name && !filter_email)
					return ko.utils.stringStartsWith(application.company().toLowerCase(), filter_name);
				else if (!filter_name && filter_email)
					return ko.utils.stringStartsWith(application.mail().toLowerCase(), filter_email);
			});
		}
	});
	
	self.waitingForAnswer = ko.computed(function() {
		
		return ko.utils.arrayFilter(self.applications(), function(application) { return application.state() === 0 && !application._destroy });
	});
	
	self.inProgress = ko.computed(function() {
	
		return ko.utils.arrayFilter(self.applications(), function(application) { return application.state() === 1 && !application._destroy });
	});
	
	self.closed = ko.computed(function() {
	
		return ko.utils.arrayFilter(self.applications(), function(application) { return application.state() === 2 && !application._destroy });
	});
	
	self.hired = ko.computed(function() {
	
		return ko.utils.arrayFilter(self.applications(), function(application) { return application.state() === 3 && !application._destroy });
	});
	
	self.chooseApplication = function(application) {
		
		self.chosenApplicationData(application);
	};
		
	self.removeApplication = function(application) {
	
		self.applications.destroy(application);
	};
		
	self.display = function() {
	
		console.log(JSON.stringify(ko.toJS(self.applications), null, 2));
	};
};

ko.applyBindings(new ApplicationsModel([]));