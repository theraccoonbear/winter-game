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
			"frames": {"width": 229, "height": 287},
			"animations": {
				"default": [0]
			}
		});
		
	},
	
	
	
	collided: function(o) {
		
	},
	
	_xyz: null
});

var Stump = Obstacle.extend({
	name: "Stump",
	
	constructor: function(options) {
		var ctxt = this;
		
		Tree.super.constructor.call(this, options);
	},
	
	initSprite: function() {
		var ctxt = this;
		
		ctxt.spriteSheet = new createjs.SpriteSheet({
			"images": [ctxt.game.loader.getResult("stump-1")],
			"frames": {"width": 100, "height": 84},
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
	
	width: 0,
	height: 0,
	imageID: false,
	
	constructor: function(options) {
		var ctxt = this;
		
		Rock.super.constructor.call(this, options);
	},
	
	collided: function(o) {
		
	},
	
	initSprite: function() {
		var ctxt = this;
		
		ctxt.spriteSheet = new createjs.SpriteSheet({
			"images": [ctxt.game.loader.getResult(ctxt.imageID)],
			"frames": {"width": ctxt.width, "height": ctxt.height},
			"animations": {
				"default": [0]
			}
		});
	},
	
	_xyz: null
});

var Rock1 = Rock.extend({
	constructor: function(options) {
		var ctxt = this;
		
		ctxt.width = 111;
		ctxt.height = 94;
		ctxt.imageID = 'rock-1';
		
		Rock1.super.constructor.call(this, options);
		
	},
	
	_xyz: null
});

var Rock2 = Rock.extend({
	constructor: function(options) {
		var ctxt = this;
		
		ctxt.width = 109;
		ctxt.height = 88;
		ctxt.imageID = 'rock-2';
		
		Rock2.super.constructor.call(this, options);
		
	},
	
	_xyz: null
});

var Rock3 = Rock.extend({
	constructor: function(options) {
		var ctxt = this;
		
		ctxt.width = 105;
		ctxt.height = 76;
		ctxt.imageID = 'rock-3';
		
		Rock3.super.constructor.call(this, options);
		
	},
	
	_xyz: null
});

var Rock4 = Rock.extend({
	constructor: function(options) {
		var ctxt = this;
		
		ctxt.width = 98;
		ctxt.height = 89;
		ctxt.imageID = 'rock-4';
		
		Rock4.super.constructor.call(this, options);
		
	},
	
	_xyz: null
});