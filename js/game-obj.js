var GameObj = Class.extend({
	collidable: false,   // true/false - can the player interact with this
	jumpable: false,     // true/false - can the player jump this
	fatal: false,        // true/false - is this item fatal on collision
	
	collision: false,    // false or function - action on collision
	jumped: false,       // false or function - action when jumped
	
	sprite: null,        // createjs sprite for item
	
	constructor: function(options) {
		
	},
	
	_xyz: null
});