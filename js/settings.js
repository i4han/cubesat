

cube     = {}
Sat      = {
	// cube:     {},
	module:   {},
	part:     {},
	attrPart: {},
	setting:  {},
	_server_startups: [],
	_client_startups: []
}

// module   = {}
// Modules  = {}
// Parts    = {}

if (Meteor.isServer) {
	Settings = Meteor.settings ? Meteor.settings : {}
} else if (Meteor.isClient) {
	Settings = {}
	Meteor.settings = Meteor.settings || {}
	'public' in Meteor.settings && (Settings = Meteor.settings.public)
}