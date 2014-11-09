var Entity = Class.extend({
	collidable: false,   // true/false - can the player interact with this
	jumpable: false,     // true/false - can the player jump this
	fatal: false,        // true/false - is this item fatal on collision
	
	collided: false,     // false or function - action on collision
	jumped: false,       // false or function - action when jumped
	
	mobile: false,       // true/false - is this a moving entity
	
	// createjs sprite for item
	spriteAction: 'default',
	spriteSheet: false,
	sprite: false,
	
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
	
	getFootprint: function() {
		
	},
	
	placeSprite: function(o)  {
		var ctxt = this;
		var dim = ctxt.game.dimensions();
		
		
		var bufferAmount = 1;
		var buffer = bufferAmount + 1;
		
		o = $.extend({}, {
			x: (Math.random() * (dim.width * buffer)) - (dim.width * (buffer / 2)),
			y: dim.height + 50,
			animation: 'default'
		}, o);
		
		//o = typeof o === 'undefined' ? {} : o;
		//
		ctxt.sprite = new createjs.Sprite(ctxt.spriteSheet, o.animation);
		
		
		
		//var x = typeof o.x === 'undefined' ? (Math.random() * (dim.width * buffer)) - (dim.width * (buffer / 2)) : o.x;
		//var y = typeof o.y === 'undefined' ? dim.height + 50 : o.y;
		
		ctxt.sprite.x = o.x;
		ctxt.sprite.y = o.y;
		ctxt.sprite.scaleX = ctxt.game.scaleFactor;
		ctxt.sprite.scaleY = ctxt.game.scaleFactor;
		ctxt.sprite.framerate = 30;
		ctxt.game.stage.addChild(ctxt.sprite);
		//ctxt.stage.addChild(myBitmap);
	},
	
	checkCollide: function(x1, y1, x2, y2) {
		var ctxt = this;
	},
	
	reflow: function() {
		var dim = ctxt.game.dimensions();
		
		ctxt.targetHeight = dim.height * 0.1;
		ctxt.scaleFactor = ctxt.targetHeight / ctxt.spriteSheet._frameHeight;
		var targetWidth = ctxt.spriteSheet._frameWidth * ctxt.game.scaleFactor;
		
		ctxt.sprite.scaleX = ctxt.game.scaleFactor;
		ctxt.sprite.scaleY = ctxt.game.scaleFactor;
	},
	
	tick: function(event) {
		var ctxt = this;
		
		ctxt.reflow();
	},
	
	_xyz: null
});

var MobileEntity = Entity.extend({
	constructor: function(options) {
		
	},
});

var Boarder = MobileEntity.extend({
	constructor: function(options) { 
		var ctxt = this;
		
		options = $.extend({}, options, {
			collidable: true
		});
		
		Boarder.super.constructor.call(this, options);
	},
	
	initSprite: function() {
		var ctxt = this;
		
		ctxt.spriteSheet = new createjs.SpriteSheet({
			"images": [ctxt.game.getResult("boarder")],
			"frames": {"height": 191, "width": 150},
			"animations": {
				"left3":    [0],
				"left2":    [1],
				"left1":    [2],
				"straight": [3],
				"right1":   [4],
				"right2":   [5],
				"right3":   [6]
			}
		});
		
		//ctxt.sprite = new createjs.Sprite(ctxt.sprites.boarder, "straight");
		//ctxt.sprite.x = (ctxt.width / 2) - (ctxt.sprite.spriteSheet._frameWidth / 2);
		//ctxt.spriter.y = (ctxt.height * ctxt.game.playerVertPositionFactor) - (ctxt.sprite.spriteSheet._frameHeight / 2);
		//ctxt.sprite.framerate = 30;
		//ctxt.stage.addChild(ctxt.boarder);
	},
	
	
	reflow: function() {
		var ctxt = this;
		
		Boader.super.reflow.call(this);
		ctxt.sprite.x = (ctxt.game.width / 2) - (targetWidth / 2);
		ctxt.sprite.y = (ctxt.game.height * ctxt.game.playerVertPositionFactor) - (ctxt.targetHeight / 2);	
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