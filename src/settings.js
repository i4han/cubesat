
x        = {$:{}};
db       = {};
Modules  = {};
exports  = {};

if (Meteor.isServer) {
	Settings = Meteor.settings ? Meteor.settings : {}
} else if (Meteor.isClient) {
	Settings = {};
	'public' in Meteor.settings && (Settings = Meteor.settings.public)

	window.style = {}
	window.o = {$:[]}; 

	o.style = document.createElement('style');
	o.style.setAttribute('id', 'satellite');
 
	o.$.push(function () {
		document.body.appendChild(o.style);
		o.stylesheet = o.style.sheet ? o.style.sheet : o.style.styleSheet;
	});
}
