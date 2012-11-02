var Application = function() {

	var self = this;
	self.id = 0;
	self.mail = ko.observable('jobs@company.com');
	self.content = ko.observable('My cover letter');
	self.company = ko.observable('Company');
	self.state = ko.observable(0);
	
	self.set_state = function(index) { self.state(index); };
	self.get_state = function() { return self.state(); };
};

var application1 = new Application();
application1.id = 1;
application1.mail('job@company.com');
application1.content('Hi !');
application1.company('company');
application1.state(0);

var application2 = new Application();
application2.id = 2;
application2.mail('job@startup.com');
application2.content('i love startups');
application2.company('startup');
application2.state(1);

var application3 = new Application();
application3.id = 3;
application3.mail('job@bigcompany.com');
application3.content('i didnt find anything else');
application3.company('big company');
application3.state(2);


var testData = [
	application1,
	application2,
	application3
];

var ApplicationsModel = function(applications) {

	var self = this;
	
	self.states = ['Waiting for answer', 'In progress', 'Declined', 'Hired !'];
	
	self.chosenApplicationData = ko.observable();

	self.applications = ko.observableArray(applications);

	self.addApplication = function() {
	
		self.applications.push(new Application());
	};
	
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

ko.applyBindings(new ApplicationsModel(testData));