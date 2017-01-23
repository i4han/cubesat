

db       = {}
cube     = {}
Sat      = {
	cube:     {},
	module:   {},
	part:     {},
	attrPart: {},
	setting:  {}
}

Modules  = {}
Parts    = {}
exports  = {}

if (Meteor.isServer) {
	Settings = Meteor.settings ? Meteor.settings : {}
} else if (Meteor.isClient) {
	Settings = {}
	Meteor.settings = Meteor.settings || {}
	'public' in Meteor.settings && (Settings = Meteor.settings.public)
}
