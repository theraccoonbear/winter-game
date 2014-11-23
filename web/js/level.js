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
		var ctxt = this;
		if (ctxt.alerted !== true) {
			alert("This level does not implement tick logic!");
			ctxt.alerted = true;
		}
		
	},
	
	collision: function(o) {
		
	},
	
	setupEntities: function() {
		var ctxt = this;
		
		$.each(ctxt.entities, function(i, e) {
			var ne = $.extend({}, e);
			
			
			ne.x += ctxt.game.boarder.hill_x;
			ne.y += ctxt.game.boarder.hill_y;
			ne.colCallback = function(o) { ctxt.collision(o); };
			ctxt.game.addEntity(ne);
		});
	},
	
	_xyz: null
});

var EmptyLevel = Level.extend({
	length: false,
	
	constructor: function(options) {
		EmptyLevel.super.constructor.call(this, options);
	},
	
	tick: function(o) {
		var ctxt = this;
		if (ctxt.game.editor === false) { ctxt.game.editor = new Editor({game: ctxt.game}); }
		
		if (!ctxt.game.editor.editing) {
			ctxt.game.editor.begin();
		}
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
		{id: 'tree', hill_x: 0, hill_y: 1250},
		{id: 'tree', hill_x: 100, hill_y: 1350},
		{id: 'tree', hill_x: -50, hill_y: 1450},
		{id: 'jump-left', hill_x: -100, hill_y: 3000},
		{id: 'jump-right', hill_x: -100, hill_y: 4000},
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

var TestLevel = Level.extend({
	entities: [
		{
			"id": "tree",
			"x": 131.94845448369566,
			"y": 490.2608695652174,
			"hill_x": 131.94845448369557,
			"hill_y": 1222.2608695652175
		},
		{
			"id": "tree",
			"x": 198.763671875,
			"y": 404.927536231884,
			"hill_x": 198.76367187499991,
			"hill_y": 1136.927536231884
		},
		{
			"id": "tree",
			"x": 295.2745414402174,
			"y": 468,
			"hill_x": 295.27454144021726,
			"hill_y": 1200
		},
		{
			"id": "tree",
			"x": 286.61330955615944,
			"y": 204.5797101449275,
			"hill_x": 286.6133095561593,
			"hill_y": 936.5797101449275
		},
		{
			"id": "tree",
			"x": 240.83251245471016,
			"y": 268.8888888888889,
			"hill_x": 240.83251245471007,
			"hill_y": 1000.8888888888889
		},
		{
			"id": "tree",
			"x": 118.33794723731884,
			"y": 317.1207729468599,
			"hill_x": 118.33794723731876,
			"hill_y": 1049.12077294686
		},
		{
			"id": "tree",
			"x": 269.2908457880435,
			"y": 438.3188405797102,
			"hill_x": 269.2908457880434,
			"hill_y": 1269.3188405797102
		},
		{
			"id": "tree",
			"x": 203.71294723731882,
			"y": 186.02898550724638,
			"hill_x": 203.7129472373187,
			"hill_y": 1017.0289855072464
		},
		{
			"id": "tree",
			"x": 796.388671875,
			"y": 242.91787439613523,
			"hill_x": 796.3886718749999,
			"hill_y": 1073.9178743961352
		},
		{
			"id": "tree",
			"x": 932.4937443387681,
			"y": 388.8502415458937,
			"hill_x": 932.493744338768,
			"hill_y": 1219.8502415458938
		},
		{
			"id": "tree",
			"x": 951.0535269474638,
			"y": 266.4154589371981,
			"hill_x": 951.0535269474636,
			"hill_y": 1097.415458937198
		},
		{
			"id": "tree",
			"x": 988.1730921648551,
			"y": 212,
			"hill_x": 988.173092164855,
			"hill_y": 1043
		},
		{
			"id": "tree",
			"x": 1032.7165704257247,
			"y": 296.09661835748796,
			"hill_x": 1032.7165704257247,
			"hill_y": 1127.0966183574878
		},
		{
			"id": "tree",
			"x": 1031.479251585145,
			"y": 418.5314009661836,
			"hill_x": 1031.479251585145,
			"hill_y": 1249.5314009661836
		},
		{
			"id": "tree",
			"x": 985.6984544836956,
			"y": 357.9323671497584,
			"hill_x": 985.6984544836955,
			"hill_y": 1188.9323671497584
		},
		{
			"id": "tree",
			"x": 965.9013530344204,
			"y": 434.60869565217394,
			"hill_x": 965.9013530344203,
			"hill_y": 1265.608695652174
		},
		{
			"id": "tree",
			"x": 1103.243744338768,
			"y": 496.9855072463768,
			"hill_x": 1103.243744338768,
			"hill_y": 1327.9855072463768
		},
		{
			"id": "tree",
			"x": 1126.7528023097827,
			"y": 362.8792270531401,
			"hill_x": 1126.7528023097827,
			"hill_y": 1193.87922705314
		},
		{
			"id": "tree",
			"x": 1129.227439990942,
			"y": 139.0338164251208,
			"hill_x": 1129.227439990942,
			"hill_y": 970.0338164251208
		},
		{
			"id": "tree",
			"x": 9.453889266304348,
			"y": 496.9855072463768,
			"hill_x": 9.453889266304246,
			"hill_y": 1327.9855072463768
		},
		{
			"id": "tree",
			"x": 78.74374433876811,
			"y": 496.9855072463768,
			"hill_x": 78.74374433876801,
			"hill_y": 1327.9855072463768
		}
	],
	
	constructor: function(options) {
		TestLevel.super.constructor.call(this, options);
	},
	
	_xyz: null
});