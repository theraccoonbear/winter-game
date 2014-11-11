/* jshint quotmark:false, strict:false, eqeqeq:false */
/* global createjs, Class */
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
	
	x: false,
	y: false,
	
	collisionProperties: {
		x: 0,
		y: 0,
		w: 0,
		h: 0
	},
	
	dimensions: function() {
		var ctxt = this;
		console.log(ctxt.spriteSheet);
	},
	
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
		var dim = ctxt.game.baseline;
		
		o = typeof o === 'undefined' ? {} : o;
		
		ctxt.sprite = new createjs.Sprite(ctxt.spriteSheet, "default");
		
		var bufferAmount = 1;
		var buffer = bufferAmount + 1;
		
		//var x = typeof o.x === 'undefined' ? (Math.random() * (dim.width * buffer)) - (dim.width * (buffer / 2)) : o.x;
		//var y = typeof o.y === 'undefined' ? dim.height + 50 : o.y;
		var x = ctxt.x === false ? (Math.random() * dim.width * buffer)) - (dim.width * (buffer / 2)) : ctxt.x;
		var y = ctxt.y === false ? dim.height + 50 : ctxt.y;
		
		ctxt.sprite.x = x;
		ctxt.sprite.y = y;
		
		ctxt.game.stage.addChild(ctxt.sprite);
	},
	
	checkCollisionAgainst: function(entity) {
		
	},
	
	_xyz: null
}); // class Entity

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
}); // class Obstacle

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
			"frames": {"width": 170, "height": 267},
			"animations": {
				"default": [0]
			}
		});
		
	},
	
	
	
	collided: function(o) {
		
	},
	
	_xyz: null
}); // class Tree

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
}); // class Stump

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
}); // class Rock

var Rock1 = Rock.extend({
	constructor: function(options) {
		var ctxt = this;
		
		ctxt.width = 111;
		ctxt.height = 94;
		ctxt.imageID = 'rock-1';
		
		Rock1.super.constructor.call(this, options);
		
	},
	
	_xyz: null
}); // class Rock1

var Rock2 = Rock.extend({
	constructor: function(options) {
		var ctxt = this;
		
		ctxt.width = 109;
		ctxt.height = 88;
		ctxt.imageID = 'rock-2';
		
		Rock2.super.constructor.call(this, options);
		
	},
	
	_xyz: null
}); // class Rock2

var Rock3 = Rock.extend({
	constructor: function(options) {
		var ctxt = this;
		
		ctxt.width = 105;
		ctxt.height = 76;
		ctxt.imageID = 'rock-3';
		
		Rock3.super.constructor.call(this, options);
		
	},
	
	_xyz: null
}); // class Rock3

var Rock4 = Rock.extend({
	constructor: function(options) {
		var ctxt = this;
		
		ctxt.width = 98;
		ctxt.height = 89;
		ctxt.imageID = 'rock-4';
		
		Rock4.super.constructor.call(this, options);
		
	},
	
	_xyz: null
}); // class Rock4

var StartBanner = Entity.extend({
	constructor: function(options) {
		var ctxt = this;
		
		StartBanner.super.constructor.call(this, options);
		
		ctxt.collidable = false;
	},
	
	initSprite: function() {
		var ctxt = this;
		
		ctxt.spriteSheet = new createjs.SpriteSheet({
			"images": [ctxt.game.loader.getResult('start-banner')],
			"frames": {"width": 715, "height": 163},
			"animations": {
				"default": [0]
			}
		});
	},
	
	_xyz: null
}); // class StartBanner



