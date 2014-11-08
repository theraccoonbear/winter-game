var Entity = Class.extend({
	collidable: false,   // true/false - can the player interact with this
	jumpable: false,     // true/false - can the player jump this
	fatal: false,        // true/false - is this item fatal on collision
	
	collided: false,     // false or function - action on collision
	jumped: false,       // false or function - action when jumped
	
	//sprite: null,        // createjs sprite for item
	spriteAction: 'default',
	spriteSheet: false,
	sprite: false,
	
	footprint: 0,
	
	constructor: function(options) {
		var ctxt = this;
		for (var p in options) {
			this[p] = options[p];
		}
		
		if (typeof ctxt.initSprite === 'function') {
			ctxt.initSprite();
			ctxt.spriteSheet.framerate = 30;
			ctxt.placeSprite();
		}
		
	},
	
	placeSprite: function(o)  {
		var ctxt = this;
		var dim = ctxt.game.dimensions();
		
		o = typeof o === 'undefined' ? {} : o;
		
		ctxt.sprite = new createjs.Sprite(ctxt.spriteSheet, "default");
		
		var bufferAmount = 1;
		var buffer = bufferAmount + 1;
		
		var x = typeof o.x === 'undefined' ? (Math.random() * (dim.width * buffer)) - (dim.width * (buffer / 2)) : o.x;
		var y = typeof o.y === 'undefined' ? dim.height + 50 : o.y;
		
		ctxt.sprite.x = x;
		ctxt.sprite.y = y;
		ctxt.sprite.scaleX = ctxt.game.scaleFactor;
		ctxt.sprite.scaleY = ctxt.game.scaleFactor;
		
		ctxt.game.stage.addChild(ctxt.sprite);
		//ctxt.stage.addChild(myBitmap);
	},
	
	_xyz: null
});

var Obstacle = Entity.extend({
	constructor: function(options) {
		var ctxt = this;
		
		options = $.extend({}, options, {
			collidable: true,
			fatal: true
		});
		
		Obstacle.super.constructor.call(this, options);
		
	},
	
	_xyz: null
});

var Tree = Obstacle.extend({
	name: "Tree",
	
	constructor: function(options) {
		var ctxt = this;
		
		Tree.super.constructor.call(this, options);
	},
	
	initSprite: function() {
		var ctxt = this;
		
		ctxt.spriteSheet = new createjs.SpriteSheet({
			"images": [ctxt.game.loader.getResult("tree-1")],
			"frames": {"width": 242, "height": 444},
			"animations": {
				"default": [0]
			}
		});
		
	},
	
	
	
	collided: function(o) {
		
	},
	
	_xyz: null
});

var Rock = Obstacle.extend({
	name: "Rock",
	
	constructor: function(options) {
		var ctxt = this;
		
		Tree.super.constructor.call(this, options);
	},
	
	collided: function(o) {
		
	},
	
	initSprite: function() {
		var ctxt = this;
		
		ctxt.spriteSheet = new createjs.SpriteSheet({
			"images": [ctxt.game.loader.getResult("rock-1")],
			"frames": {"width": 150, "height": 79},
			"animations": {
				"default": [0]
			}
		});
	},
	
	_xyz: null
});