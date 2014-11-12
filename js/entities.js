/* jshint quotmark:false, strict:false, eqeqeq:false */
/* global createjs, Class */
var Entity = Class.extend({
	name: "Entity",
	
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
	width: false,
	height: false,
	alwaysUnder: false,
	
	colliders: [],
	
	dimensions: function() {
		var ctxt = this;
		console.log(ctxt.spriteSheet);
	},
	
	addCollider: function(options) {
		var ctxt = this;
		
		var defaults = {
			action: false,
			points: []
		};
		
		options = $.extend({}, defaults, options);
		
		if (typeof options.points === 'string') {
			var pts = [];
			var pt_sets = options.points.split('-');
			for (var i = 0, l = pt_sets.length; i < l; i++) {
				var coords = pt_sets[i].split(',');
				var pt = new Point2D(coords[0], coords[1]);
				pts.push(pt);
			}
			options.points = pts;
		}
		
		ctxt.colliders.push(new CollisionTarget(options));
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
		var x = ctxt.x === false ? (Math.random() * dim.width * buffer) - (dim.width * (buffer / 2)) : ctxt.x;
		var y = ctxt.y === false ? dim.height + 50 : ctxt.y;
		
		ctxt.sprite.x = x;
		ctxt.sprite.y = y;
		
		//ctxt.game.stage.addChild(ctxt.sprite);
		if (ctxt.alwaysUnder) {
			ctxt.game.under.addChild(ctxt.sprite);
		} else {
			ctxt.game.over.addChild(ctxt.sprite);
		}
	},
	
	checkCollisionAgainst: function(options) {
		var ctxt = this;
		
		var pt1 = options.pt1;
		var pt2 = options.pt2;
		
		for (var i = 0, l = ctxt.colliders.length; i < l; i++) {
			if (ctxt.colliders[i].checkCollision(pt1, pt2)) {

				if (typeof ctxt.colliders[i].action) {
					ctxt.colliders[i].action({game: ctxt.game});
				}
			}
		}
	},
	
	_xyz: null
}); // class Entity

var Obstacle = Entity.extend({
	name: "Obstacle",
	
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
		options.width = 170;
		options.height = 267;
		
		Tree.super.constructor.call(this, options);
		
		ctxt.addCollider({
			points: "46,194-66,202-80,198-64,180",
			action: function(o) {
				console.log('Hit!', o);
			}
		});
		
	},
	
	initSprite: function() {
		var ctxt = this;
		
		ctxt.spriteSheet = new createjs.SpriteSheet({
			"images": [ctxt.game.loader.getResult("tree-1")],
			"frames": {"width": ctxt.width, "height": ctxt.height},
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
		options.width = 100;
		options.height = 84;
		Tree.super.constructor.call(this, options);
	},
	
	initSprite: function() {
		var ctxt = this;
		
		ctxt.spriteSheet = new createjs.SpriteSheet({
			"images": [ctxt.game.loader.getResult("stump-1")],
			"frames": {"width": ctxt.width, "height": ctxt.height},
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
	name: "Rock1",
	
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
	name: "Rock2",
	
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
	name: "Rock3",
	
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
	name: "Rock4",
	
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
	name: "StartBanner",
	
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


var Jump = Entity.extend({
	name: "Jump",
	
	contstructor: function(options) {
		var ctxt = this;
		
		options.alwaysUnder = true;
		Jump.super.constructor.call(this, options);
		
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
}); // class Jump


var JumpLeft = Jump.extend({
	name: "JumpLeft",
	
	constructor: function(options) {
		var ctxt = this;
		
		ctxt.imageID = 'jump-left';
		ctxt.width = 208;
		ctxt.height = 150;
		
		JumpLeft.super.constructor.call(this, options);
		
	},
	
	_xyz: null
}); // class JumpLeft

var JumpRight = Jump.extend({
	name: "JumpRight",
	
	
	constructor: function(options) {
		var ctxt = this;
		
		ctxt.imageID = 'jump-right';
		ctxt.width = 220;
		ctxt.height = 145;
		
		JumpRight.super.constructor.call(this, options);
		
	},
	
	_xyz: null
}); // class JumpRight


var JumpCenter = Jump.extend({
	name: "JumpCenter",
	
	constructor: function(options) {
		var ctxt = this;
		
		ctxt.imageID = 'jump-center';
		ctxt.width = 220;
		ctxt.height = 156;
		
		JumpCenter.super.constructor.call(this, options);
		
	},
	
	_xyz: null
}); // class JumpCenter

