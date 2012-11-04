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
	
	self.set_state = function(state) { self.state(state); };
	self.get_state = function() { return self.state(); };
};

var ApplicationsModel = function(applications) {

	var self = this;
	
	self.states = ['Waiting for answer', 'In progress', 'Declined', 'Hired'];
	
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
			$.getJSON('/' + this.params.appId, function(data) {
				
				console.log(data);
				self.isUserDefined(data.id);
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
			state: 'Waiting for answer'
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
	
	self.state_filter_flags = ko.observableArray([]);
	
	self.filteredApps = ko.computed(function() {
	
		var filter_name = self.filter_name().toLowerCase();
		var filter_email = self.filter_email().toLowerCase();
		var state_index = {};
		var checked = false;
		
		ko.utils.arrayForEach(self.state_filter_flags(), function(flag) {
			
			checked = true;
			state_index[flag] = true;
		});
		
		if (!filter_name && !filter_email && !checked) {
			
			return self.applications();
		}
		else {
		
			var textFilters = ko.utils.arrayFilter(self.applications(), function(application) {
				
				if (filter_name && filter_email)
					return (ko.utils.stringStartsWith(application.mail().toLowerCase(), filter_email)
							&& ko.utils.stringStartsWith(application.company().toLowerCase(), filter_name));
				else if (filter_name && !filter_email)
					return (ko.utils.stringStartsWith(application.company().toLowerCase(), filter_name));
				else if (!filter_name && filter_email)
					return (ko.utils.stringStartsWith(application.mail().toLowerCase(), filter_email));
				else
					return true;
			});
			
			if (!checked) return textFilters;
			
			return ko.utils.arrayFilter(textFilters, function(application) {
				
				return state_index[application.state()] === true;
			});
		}
	});

	self.waitingForAnswer = ko.computed(function() {
		
		return ko.utils.arrayFilter(self.applications(), function(application) { return application.state() === 'Waiting for answer' && !application._destroy });
	});
	
	self.inProgress = ko.computed(function() {
	
		return ko.utils.arrayFilter(self.applications(), function(application) { return application.state() === 'In progress' && !application._destroy });
	});
	
	self.closed = ko.computed(function() {
	
		return ko.utils.arrayFilter(self.applications(), function(application) { return application.state() === 'Declined' && !application._destroy });
	});
	
	self.hired = ko.computed(function() {
	
		return ko.utils.arrayFilter(self.applications(), function(application) { return application.state() === 'Hired' && !application._destroy });
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