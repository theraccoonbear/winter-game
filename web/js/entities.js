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
	playerPassed: false,
	
	colliders: [],
	_drawnColliders: [],
	
	dimensions: function() {
		var ctxt = this;
		//console.log(ctxt.spriteSheet);
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
		var ctxt = this;

		var colors = ['red','green','blue','orange','purple'];
		var c = 0;
		
		for (var j = 0, length = this._drawnColliders.length; j < length; j++) {
			ctxt.container.removeChild(this._drawnColliders[j]);
		}

		if (ctxt.colliders.length > 0) {
			var g = false;
			for (var i = 0, l = ctxt.colliders.length; i < l; i++) {
				var opts = {
					entity: ctxt,
					color: colors[c]
				};
				
				c++;
				if (c > colors.length - 1) {
					c = 0;
				}
				
				if (g !== false) {
					opts.graphics = g;
				}
				g = ctxt.colliders[i].drawCollider(opts);
			}
			var s = new createjs.Shape(g);
			this._drawnColliders.push(ctxt.container.addChild(s));
		}

	},
	
	remove: function() {
		var ctxt = this;
		
		//console.log('Found at: ', ctxt.game.stage.getChildIndex(ctxt.container));
		
		for (var i = 0, l = ctxt.game.movingElements.length; i < l; i++) {
			var ent = ctxt.game.movingElements[i];
			if (ent == ctxt) {
				//console.log(ent.sprite, i);
				ctxt.game.movingElements.splice(i, 1);
				ctxt.game.stage.removeChild(ctxt.container);
				break;
			}
		}
	},
	
	rectContainsRect: function(rect_1_pt1, rect_1_pt2, rect_2_pt1, rect_2_pt2) {
		var left_in = rect_1_pt1.x > rect_2_pt1.x && rect_1_pt1.x < rect_2_pt2.x;
		var top_in = rect_1_pt1.y > rect_2_pt1.y && rect_1_pt1.y < rect_2_pt2.y;
		var right_in = rect_1_pt2.x > rect_2_pt1.x && rect_1_pt2.x < rect_2_pt2.x;
		var bottom_in = rect_1_pt2.y > rect_2_pt1.y && rect_1_pt2.y < rect_2_pt2.y;
		
		return left_in && top_in && right_in && bottom_in;
	},
	
	findOpenGround: function(o) {
		var ctxt = this;
		var w = o.width;
		var h = o.height;
		var dim = ctxt.game.baseline;
		var x;
		var y;
		var inter = {status: 'No Intersection'};
		var attempts = 0;
		
		do {
			attempts++;
			x = Math.random() * dim.width;
			y = (dim.height + 50);
			var proposed_pt_1 = new Point2D(x, y);
			var proposed_pt_2 = new Point2D(x + w, y + h);
			
			for (var i = 0, l = ctxt.game.movingElements.length; i < l; i++) {
				var ent = ctxt.game.movingElements[i];
				var existing_pt_1 = new Point2D(ent.sprite.x, ent.sprite.y);
				var existing_pt_2 = new Point2D(ent.sprite.x + ent.spriteSheet._frameWidth, ent.sprite.y + ent.spriteSheet._frameHeight);
				if (ctxt.rectContainsRect(proposed_pt_1, proposed_pt_2, existing_pt_1, existing_pt_2) || ctxt.rectContainsRect(existing_pt_1, existing_pt_2, proposed_pt_1, proposed_pt_2)) {
					inter.status = 'Intersection';
					break;
				} else {
					inter = Intersection.intersectRectangleRectangle(proposed_pt_1, proposed_pt_2, existing_pt_1, existing_pt_2);
					if (inter.status === 'Intersection') {
						break;
					}
				}
			}
		} while (inter.status === 'Intersection' && attempts < 20);
		
		return {x: x, y: y};
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
		
		//console.log(ctxt.findOpenGround({width: ctxt.spriteSheet._frameWidth, height: ctxt.spriteSheet._frameHeight}));
		
		//var x = ctxt.x === false ? (Math.random() * dim.width * buffer) - (dim.width * (buffer / 2)) : ctxt.x;
		//var y = ctxt.y === false ? (dim.height + 50) * 1 : ctxt.y;
		var x = ctxt.x;
		var y = ctxt.y;
		if (x === false || y === false) {
			var newXY = ctxt.findOpenGround({width: ctxt.spriteSheet._frameWidth, height: ctxt.spriteSheet._frameHeight});
			x = newXY.x;
			y = newXY.y;
		}
		
		ctxt.sprite.x = x;
		ctxt.sprite.y = y;
		ctxt.sprite.entity = ctxt;
	
		if (ctxt.alwaysUnder) {
			//console.log('Placing new ' + ctxt.name + ' on bottom');
			//console.log('Boarder at: ', ctxt.game.stage.getChildIndex(ctxt.game.boarder), ', ' + ctxt.name + ' at: ', ctxt.game.stage.getChildIndex(ctxt.container));
			ctxt.game.stage.addChildAt(ctxt.container, 1);
		} else {
			ctxt.game.stage.addChild(ctxt.container);
		}
		
		//ctxt.drawBounds();
	},
	
	checkCollisionAgainst: function(options) {
		var ctxt = this;

		//if (ctxt.jumpable && ctxt.game.jumping) {
		//	return;
		//}
		
		var checkCollisionOptions = {};

		checkCollisionOptions.entity = ctxt;
		checkCollisionOptions.game = ctxt.game;

		if (options.points !== undefined) {
			checkCollisionOptions.points = options.points;
		} else {
			checkCollisionOptions.pt1 = options.pt1;
			checkCollisionOptions.pt2 = options.pt2;
		}
		
		for (var i = 0, l = ctxt.colliders.length; i < l; i++) {
			if (ctxt.colliders[i].checkCollision(checkCollisionOptions)) {
				// we collided

				//if (ctxt.jumpable && ctxt.game.jumping) {
				//	if (typeof ctxt.colliders[i].jumpAction === 'function') {
				//		ctxt.colliders[i].jumpAction({game: ctxt.game});
				//	}
				//} else if (typeof ctxt.colliders[i].action) {
				//	ctxt.colliders[i].action({game: ctxt.game});
				//}
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

var Bonus = Entity.extend({
	name: "Bonus",
	
	constructor: function(options) {
		var ctxt = this;
		
		options = $.extend({}, options, {
			collidable: true,
			fatal: false
		});
		
		Obstacle.super.constructor.call(this, options);
	},
	
	_xyz: null
}); // class Bonus

var Coin = Bonus.extend({
	
	constructor: function(options) {
		var ctxt = this;
		Coin.super.constructor.call(this, options);
		this.addCollider({
			points: "8,30-8,42-42,42-42,30-8,30",
			action: function(o) {
				//console.log('Tree Hit!', typeof o !== "undefined" ? o : "");
				ctxt.game.score += 3000;
				ctxt.game.sweetMessage({message:'Spare Change!'});
				ctxt.remove();
			}
		});
	},
	
	initSprite: function() {
		var ctxt = this;
		
		ctxt.spriteSheet = new createjs.SpriteSheet({
			"images": [ctxt.game.loader.getResult("coin")],
			"frames": {"width": 50, "height": 50},
			"animations": {
				"default": [0,14,'default',0.5]
			}
		});
		
	},
	_xyz: null
}); // class Coin

var Beer = Bonus.extend({
	
	constructor: function(options) {
		var ctxt = this;
		Beer.super.constructor.call(this, options);
		
		this.addCollider({
			points: "8,30-8,42-42,42-42,30-8,30",
			action: function(o) {
				//console.log('Tree Hit!', typeof o !== "undefined" ? o : "");
				ctxt.game.score += 1000;
				ctxt.game.sweetMessage({message:'Beer Bonus!'});
				ctxt.remove();
			}
		});
		
	},
	
	initSprite: function() {
		var ctxt = this;
		
		ctxt.spriteSheet = new createjs.SpriteSheet({
			"images": [ctxt.game.loader.getResult("beer")],
			"frames": {"width": 50, "height": 50},
			"animations": {
				"default": [0,22,'default',0.5]
			}
		});
		
	},
	_xyz: null
}); // class Beer

var Tree = Obstacle.extend({
	name: "Tree",
	
	constructor: function(options) {
		var ctxt = this;
		
		options.width = 170;
		options.height = 267;
		
		Tree.super.constructor.call(this, options);
		
		this.addCollider({
			//points: "46,194-66,202-80,198-64,180-46,194",
			points: "38,192-55,203-81,203-94,192-81,181-55,181-38,192",
			action: function(o) {
				//('Tree Hit!', typeof o !== "undefined" ? o : "");
				ctxt.game.crash();
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
		options.jumpable = true;
		
		Tree.super.constructor.call(this, options);
		
		this.addCollider({
			points: "4,45-12,50-13,64-22,66-35,60-45,56-56,55-47,41-28,37-14,36-4,45",
			action: function(o) {
				//console.log('Stump Hit!', typeof o !== "undefined" ? o : "");
				ctxt.game.crash();
			},
			jumpAction: function(o) {
				ctxt.game.score += 1000;
				ctxt.game.sweetMessage({message: 'Nicely cleared!'});
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
	jumpable: true,
	alwaysUnder: true,
	imageID: false,
	
	constructor: function(options) {
		var ctxt = this;
		
		//options.alwaysUnder = true;
		//options.jumpable = true;
		//
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
				//('Rock 1 Hit!', typeof o !== "undefined" ? o : "");
				ctxt.game.crash();
			},
			jumpAction: function(o) {
				ctxt.game.score += 1000;
				ctxt.game.sweetMessage({message: 'Nicely cleared!'});
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

		this.addCollider({
			points: "2,23-28,4-37,7-38,22-88,17-92,21-88,26-86,38-95,52-78,71-17,75-10,68-20,60-14,40-20,35-18,29-2,23",
			action: function(o) {
				//('Rock 2 Hit!', typeof o !== "undefined" ? o : "");
				ctxt.game.crash();
			},
			jumpAction: function(o) {
				ctxt.game.score += 1000;
				ctxt.game.sweetMessage({message: 'Nicely cleared!'});
			}
		});
		
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

		this.addCollider({
			points: "2,18-12,9-27,4-47,12-58,2-83,11-84,18-91,22-91,29-86,36-93,48-90,52-78,51-72,57-57,56-53,51-9,48-4,43-1,33-2,18",
			action: function(o) {
				//console.log('Rock 3 Hit!', typeof o !== "undefined" ? o : "");
				ctxt.game.crash();
			},
			jumpAction: function(o) {
				ctxt.game.score += 1000;
				ctxt.game.sweetMessage({message: 'Nicely cleared!'});
			}
		});
		
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

		this.addCollider({
			points: "13,19-37,2-63,18-73,39-68,56-39,77-9,60-1,40-13,19",
			action: function(o) {
				//('Rock 4 Hit!', typeof o !== "undefined" ? o : "");
				ctxt.game.crash();
			},
			jumpAction: function(o) {
				ctxt.game.score += 1000;
				ctxt.game.sweetMessage({message: 'Nicely cleared!'});
			}
		});
		
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
	alwaysUnder: true,
	
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
		options.width = 264;
		options.height = 190;
		options.alwaysUnder = true;
		
		JumpLeft.super.constructor.call(this, options);

		//collide with sides
		this.addCollider({
			points: "105,22-14,92-128,166-210,85",
			name: 'crash-edges',
			action: function(o) {
				//('JumpLeft side collision!');
				ctxt.game.crash();
			}
		});

		//enter ramp
		this.addCollider({
			points: "89,31-118,12-208,52",
			name: 'enter-ramp',
			disables: ['crash-edges', 'enter-ramp'],
			enables: ['jump-edge', 'exit-ramp'],
			action: function(o) {
				//('Enter Ramp!');
			}
		});
		
		//trigger jump
		this.addCollider({
			enabled: false, //disabled by default
			points: "70,38-32,57-132,112-170,91",
			name: 'jump-edge',
			disables: ['jump-edge'],
			action: function(o) {
				//('Launch!');
				ctxt.game.boost();
				ctxt.game.jump();
				ctxt.game.score += 1000;
				ctxt.game.sweetMessage({message:'Sick Air Bro!'});
			}
		});

		//clear ramp
		this.addCollider({
			enabled: false, //disabled by default
			points: "129,5-6,97-129,178-251,50-129,5",
			name: 'exit-ramp',
			disables: ['jump-edge', 'exit-ramp'],
			enables: ['crash-edges', 'enter-ramp'],
			action: function(o) {
				//('Exit ramp!')
			}
		});
		
	},
	
	_xyz: null
}); // class JumpLeft

var JumpRight = Jump.extend({
	name: "JumpRight",
	
	
	constructor: function(options) {
		var ctxt = this;
		options.alwaysUnder = true;
		options.imageID = 'jump-right';
		options.width = 264;
		options.height = 190;
		
		JumpRight.super.constructor.call(this, options);

		//collide with sides
		this.addCollider({
			points: "37,84-120,170-240,91-149,22",
			name: 'crash-edges',
			action: function(o) {
				//('Jump side collision!');
				ctxt.game.crash();
			}
		});

		//enter ramp
		this.addCollider({
			points: "44,55-138,12-156,24",
			name: 'enter-ramp',
			disables: ['crash-edges', 'enter-ramp'],
			enables: ['jump-edge', 'exit-ramp'],
			action: function(o) {
				//('Enter Ramp!');
			}
		});
		
		//trigger jump
		this.addCollider({
			enabled: false, //disabled by default
			points: "84,89-118,117-227,57-179,35",
			name: 'jump-edge',
			disables: ['jump-edge'],
			action: function(o) {
				//('Launch!');
				ctxt.game.boost();
				ctxt.game.jump();
				ctxt.game.score += 1000;
				ctxt.game.sweetMessage({message:'Sick Air Bro!'});
			}
		});

		//clear ramp
		this.addCollider({
			enabled: false, //disabled by default
			points: "0,48-126,0-253,96-116,185-0,48",
			name: 'exit-ramp',
			disables: ['jump-edge', 'exit-ramp'],
			enables: ['crash-edges', 'enter-ramp'],
			action: function(o) {
				//('Exit ramp!');
			}
		});
		
	},
	
	_xyz: null
}); // class JumpRight


var JumpCenter = Jump.extend({
	name: "JumpCenter",
	
	constructor: function(options) {
		var ctxt = this;
		options.imageID = 'jump-center';
		options.width = 280;
		options.height = 198;
		options.alwaysUnder = true;
		
		JumpCenter.super.constructor.call(this, options);

		//collide with sides
		this.addCollider({
			points: "50,44-23,166-256,170-224,45",
			name: 'crash-edges',
			action: function(o) {
				//('Jump side collision!');
				ctxt.game.crash();
			}
		});

		//enter ramp
		this.addCollider({
			points: "56,36-56,26-221,26-221,36",
			name: 'enter-ramp',
			disables: ['crash-edges', 'enter-ramp'],
			enables: ['jump-edge', 'exit-ramp'],
			action: function(o) {
				//('Enter Ramp!');
			}
		});
		
		//trigger jump
		this.addCollider({
			enabled: false, //disabled by default
			points: "47,78-37,122-238,124-227,77",
			name: 'jump-edge',
			disables: ['jump-edge'],
			action: function(o) {
				//('Launch!');
				ctxt.game.boost();
				ctxt.game.jump();
				ctxt.game.score += 1000;
				ctxt.game.sweetMessage({message:'Sick Air Bro!'});
			}
		});

		//clear ramp
		this.addCollider({
			enabled: false, //disabled by default
			points: "26,8-0,196-280,194-234,12-26,8",
			name: 'exit-ramp',
			disables: ['jump-edge', 'exit-ramp'],
			enables: ['crash-edges', 'enter-ramp'],
			action: function(o) {
				//('Exit ramp!');
			}
		});
		
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
