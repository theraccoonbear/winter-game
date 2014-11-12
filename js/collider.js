var Collider = Class.extend({
	
	constructor: function(options) {
		var ctxt = this;
		for (var p in options) {
			this[p] = options[p];
		}
	},
	
	
	_xyz: null
}); // class Collider