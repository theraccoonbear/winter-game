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
	container: false,
	
	x: false,
	y: false,
	width: false,
	height: false,
	alwaysUnder: false,
	isUnder: false,
	
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
				var pt = new Point2D(parseFloat(coords[0]), parseFloat(coords[1]));
				pts.push(pt);
			}
			options.points = pts;
		}
		
		ctxt.colliders.push(new CollisionTarget(options));
	},
	
	getColliderByName: function(o) {
		var ctxt = this;
		var name = o.name;
		
		var ret = false;
		
		for (var i = 0, l = ctxt.colliders.length; i < l; i++) {
			if (ctxt.colliders[i].name == name) {
				ret = ctxt.colliders[i];
				break;
			}
		}
		
		return ret;
	},
	
	constructor: function(options) {
		var ctxt = this;
		for (var p in options) {
			this[p] = options[p];
		}
		
		this.colliders = [];
		
		if (typeof this.initSprite === 'function') {
			this.initSprite();
			this.spriteSheet.framerate = 30;
			this.placeSprite();
		}
		
	},
	
	drawBounds: function() {
		//var ctxt = this;
		//if (ctxt.colliders.length > 0) {
		//	for (var i = 0, l = ctxt.colliders.length; i < l; i++) {
		//		var g = ctxt.colliders[0].drawCollider({entity: ctxt});
		//		ctxt.container.addChild(new createjs.Shape(g));
		//	}
		//}
	},
	
	placeSprite: function(o)  {
		var ctxt = this;
		var dim = ctxt.game.baseline;
		
		o = typeof o === 'undefined' ? {} : o;
		
		ctxt.sprite = new createjs.Sprite(ctxt.spriteSheet, "default");
		ctxt.container = new createjs.Container();
		ctxt.container.addChild(ctxt.sprite);
		
		
		var bufferAmount = 1;
		var buffer = bufferAmount + 1;
		var x = ctxt.x === false ? (Math.random() * dim.width * buffer) - (dim.width * (buffer / 2)) : ctxt.x;
		var y = ctxt.y === false ? (dim.height + 50) * 1 : ctxt.y;
		
		ctxt.sprite.x = x;
		ctxt.sprite.y = y;	
	
		if (ctxt.alwaysUnder) {
			ctxt.game.under.addChild(ctxt.container);
			ctxt.isUnder = true;
		} else {
			ctxt.game.over.addChild(ctxt.container);
		}
		
		ctxt.drawBounds();
	},
	
	checkCollisionAgainst: function(options) {
		var ctxt = this;
		
		var pt1 = options.pt1;
		var pt2 = options.pt2;
		
		for (var i = 0, l = ctxt.colliders.length; i < l; i++) {
			if (ctxt.colliders[i].checkCollision({pt1: pt1, pt2: pt2, entity: ctxt})) {

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
		
		this.addCollider({
			points: "46,194-66,202-80,198-64,180-46,194",
			action: function(o) {
				console.log('Tree Hit!', typeof o !== "undefined" ? o : "");
				ctxt.game.jump();
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
		
		this.addCollider({
			points: "4,45-12,50-13,64-22,66-35,60-45,56-56,55-47,41-28,37-14,36-4,45",
			action: function(o) {
				console.log('Stump Hit!', typeof o !== "undefined" ? o : "");
				ctxt.game.jump();
			}
		});
		
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
		
		options.alwaysUnder = true;
		
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
		
		options.width = 111;
		options.height = 94;
		options.imageID = 'rock-1';
		
		Rock1.super.constructor.call(this, options);
		
		this.addCollider({
			points: "20,7-12,15-8,24-4,30-6,48-23,64-34,70-59,75-72,67-78,54-74,39-70,29-76,20-70,16-64,17-59,6-45,2-34,6-20,7",
			action: function(o) {
				console.log('Rock 1 Hit!', typeof o !== "undefined" ? o : "");
				ctxt.game.jump();
			}
		});
		
	},
	
	_xyz: null
}); // class Rock1

var Rock2 = Rock.extend({
	name: "Rock2",
	
	constructor: function(options) {
		var ctxt = this;
		
		options.width = 109;
		options.height = 88;
		options.imageID = 'rock-2';
		
		Rock2.super.constructor.call(this, options);
		
	},
	
	_xyz: null
}); // class Rock2

var Rock3 = Rock.extend({
	name: "Rock3",
	
	constructor: function(options) {
		var ctxt = this;
		
		options.width = 105;
		options.height = 76;
		options.imageID = 'rock-3';
		
		Rock3.super.constructor.call(this, options);
		
	},
	
	_xyz: null
}); // class Rock3

var Rock4 = Rock.extend({
	name: "Rock4",
	
	constructor: function(options) {
		var ctxt = this;
		
		options.width = 98;
		options.height = 89;
		options.imageID = 'rock-4';
		
		Rock4.super.constructor.call(this, options);
		
	},
	
	_xyz: null
}); // class Rock4

var StartBanner = Entity.extend({
	name: "StartBanner",
	
	constructor: function(options) {
		var ctxt = this;
		
		options.collidable = false;
		StartBanner.super.constructor.call(this, options);
		
		
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
		options.imageID = 'jump-left';
		options.width = 208;
		options.height = 150;
		
		JumpLeft.super.constructor.call(this, options);
		
		this.addCollider({
			points: "85,23-198,52",
			name: 'jump-edge',
			disables: ['crash-edges'],
			action: function(o) {
				console.log('Launch!');
				ctxt.game.jump();
			}
		});
		
		this.addCollider({
			points: "85,23-15,86-154,122-198,52",
			name: 'crash-edges',
			action: function(o) {
				console.log('Crash');
				//ctxt.game.jump();
			}
		});
		
	},
	
	_xyz: null
}); // class JumpLeft

var JumpRight = Jump.extend({
	name: "JumpRight",
	
	
	constructor: function(options) {
		options.imageID = 'jump-right';
		options.width = 220;
		options.height = 145;
		
		JumpRight.super.constructor.call(this, options);
		
	},
	
	_xyz: null
}); // class JumpRight


var JumpCenter = Jump.extend({
	name: "JumpCenter",
	
	constructor: function(options) {
		options.imageID = 'jump-center';
		options.width = 220;
		options.height = 156;
		
		JumpCenter.super.constructor.call(this, options);
		
	},
	
	_xyz: null
}); // class JumpCenter


var Sinistar = Obstacle.extend({
	constructor: function(options) {
		Sinistar.super.constructor.call(this, options);
	},
	
	initSprite: function() {
		var ctxt = this;
		
		ctxt.spriteSheet = new createjs.SpriteSheet({
			"images": [ctxt.game.loader.getResult('sinistar')],
			"frames": {"width": 480, "height": 360},
			"animations": {
				"default": [0,17,'default',1]
			}
		});
	},
	
	_xyz: null
});