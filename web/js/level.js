var Zone = BASE.extend({
	
	startsAt: 0, // distance down hill where zone begins
	endsAt: 1000, // distance down hill where zone ends
	
	constructor: function(options) {
		Zone.super.constructor.call(this, options);
	},
	
	_xyz: null
});

var Level = BASE.extend({
	
	name: "Unnamed",
	description: "A dummy level.  Do not play this.",
	
	length: 10000, // how long the hill is in feet.  false for endless.
	game: null,
	zones: [],
	
	entities: [],
	
	constructor: function(options) {
		Level.super.constructor.call(this, options);
		this.setupEntities();
	},
	
	tick: function(o) {
		alert("This level does not implement tick logic!");
	},
	
	collision: function(o) {
		
	},
	
	setupEntities: function() {
		var ctxt = this;
		
		$.each(ctxt.entities, function(i, e) {
			var ne = $.extend({}, e);
			
			
			ne.x += ctxt.game.boarder.x;
			ne.y += ctxt.game.boarder.y;
			ne.colCallback = function(o) { ctxt.collision(o); };
			ctxt.game.addEntity(ne);
		});
	},
	
	_xyz: null
});


var RandomLevel = Level.extend({
	
	name: "Random Ride",
	description: "Endless ride mode with random obstacles, jumps, and bonuses.  Ride as long as you can and get a high score.",
	
	length: false,
	
	constructor: function(options) {
		RandomLevel.super.constructor.call(this, options);
	},
	
	tick: function(o) {
		var ctxt = this;
		
		var d = ctxt.game.distance;
		
		if (d > 20) {
			var obst_delta = d - ctxt.game.lastObstAt;
			var bonus_delta = d - ctxt.game.lastBonusAt;
			var inter_delta = d - ctxt.game.lastInterAt;
			
			//console.log('Inter = ' + inter_delta + ' of ' + ctxt.interEvery);
			//console.log('Obst = ' + obst_delta + ' of ' + ctxt.obstEvery);
			//console.log('Bonus = ' + bonus_delta + ' of ' + ctxt.bonusEvery);
			
			
			if (obst_delta >= ctxt.game.obstEvery) {
				ctxt.game.addEntity({interactives: false, obstacles: true, bonus: false});
				ctxt.game.lastObstAt = d;
			}
			
			
			if (bonus_delta >= ctxt.game.bonusEvery) {
				ctxt.game.addEntity({interactives: false, obstacles: false, bonus: true});
				ctxt.game.lastBonusAt = d;
			}
			
			
			if (inter_delta >= ctxt.game.interEvery) {
				ctxt.game.addEntity({interactives: true, obstacles: false, bonus: false});
				ctxt.game.lastInterAt = d;
			}
			
			
			
			
		}
	},
	
	_xyz: null
});

var JumpLevel = Level.extend({
	
	length: 1500,
	
	entities: [
		{id: 'tree', x: 0, y: 1250},
		{id: 'tree', x: 100, y: 1350},
		{id: 'tree', x: -50, y: 1450},
		{id: 'jump-left', x: -100, y: 3000},
		{id: 'jump-right', x: -100, y: 4000},
	],
	
	constructor: function(options) {
		var ctxt = this;
		JumpLevel.super.constructor.call(this, options);
	},
	
	collision: function(o) {
		console.log('Trigger callback for entity \"' + o.entity.name + '\" on trigger \"' + o.collider.name + '\"');
	},
	
	tick: function(o) {
		var ctxt = this;
		
		if (ctxt.length !== false && ctxt.game.distance >= ctxt.length) {
			
		}
	},
	
	_xyz: null
});