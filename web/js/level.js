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
			
			
			ne.x = ne.hill_x; // - ctxt.game.boarder.x;
			ne.y = ne.hill_y; // + ctxt.game.boarder.y;
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
			"x": 231.00800533689124,
			"y": 208.86832740213526,
			"hill_x": 231.00800533689116,
			"hill_y": 938.8683274021353
		},
		{
			"id": "tree",
			"x": 113.45363575717145,
			"y": 300.88256227758006,
			"hill_x": 113.45363575717137,
			"hill_y": 1030.88256227758
		},
		{
			"id": "tree",
			"x": 176.33155436957972,
			"y": 350.0782918149466,
			"hill_x": 176.33155436957964,
			"hill_y": 1080.0782918149466
		},
		{
			"id": "tree",
			"x": 266.54769846564375,
			"y": 280.83985765124555,
			"hill_x": 266.54769846564363,
			"hill_y": 1010.8398576512456
		},
		{
			"id": "tree",
			"x": 1093.984656437625,
			"y": 251.68683274021353,
			"hill_x": 1093.984656437625,
			"hill_y": 981.6868327402135
		},
		{
			"id": "tree",
			"x": 999.2121414276185,
			"y": 361.0106761565836,
			"hill_x": 999.2121414276183,
			"hill_y": 1091.0106761565835
		},
		{
			"id": "tree",
			"x": 1086.6944629753168,
			"y": 424.7829181494661,
			"hill_x": 1086.6944629753168,
			"hill_y": 1154.7829181494662
		},
		{
			"id": "tree",
			"x": 242.8545697131421,
			"y": 280.83985765124555,
			"hill_x": 242.85456971314198,
			"hill_y": 1223.8398576512454
		},
		{
			"id": "tree",
			"x": 119.83255503669112,
			"y": 262.61921708185054,
			"hill_x": 119.83255503669099,
			"hill_y": 1259.6192170818506
		},
		{
			"id": "tree",
			"x": 1102.1861240827218,
			"y": 177.8932384341637,
			"hill_x": 1102.1861240827216,
			"hill_y": 1234.8932384341638
		},
		{
			"id": "tree",
			"x": 1060.2675116744497,
			"y": 228.91103202846975,
			"hill_x": 1060.2675116744495,
			"hill_y": 1306.9110320284697
		},
		{
			"id": "tree",
			"x": 101.60707138092062,
			"y": 183.3594306049822,
			"hill_x": 101.60707138092047,
			"hill_y": 1384.3594306049822
		},
		{
			"id": "tree",
			"x": 1111.2988659106072,
			"y": 268.9964412811388,
			"hill_x": 1111.298865910607,
			"hill_y": 1501.9964412811387
		},
		{
			"id": "tree",
			"x": 908.9959973315543,
			"y": 311.81494661921704,
			"hill_x": 908.9959973315542,
			"hill_y": 1556.8149466192172
		},
		{
			"id": "tree",
			"x": 854.3195463642428,
			"y": 444.8256227758007,
			"hill_x": 854.3195463642427,
			"hill_y": 1709.8256227758006
		},
		{
			"id": "tree",
			"x": 1095.807204803202,
			"y": 226.1779359430605,
			"hill_x": 1095.8072048032018,
			"hill_y": 1504.1779359430604
		},
		{
			"id": "tree",
			"x": 742.2328218812542,
			"y": 473.9786476868327,
			"hill_x": 742.232821881254,
			"hill_y": 1777.9786476868326
		},
		{
			"id": "tree",
			"x": 985.5430286857905,
			"y": 411.11743772241994,
			"hill_x": 985.5430286857904,
			"hill_y": 1730.11743772242
		},
		{
			"id": "tree",
			"x": 986.454302868579,
			"y": 186.09252669039148,
			"hill_x": 986.4543028685789,
			"hill_y": 1518.0925266903914
		},
		{
			"id": "tree",
			"x": 0,
			"y": 228.91103202846975,
			"hill_x": -1.6618457064429562e-13,
			"hill_y": 1585.9110320284697
		},
		{
			"id": "tree",
			"x": 92.49432955303536,
			"y": 105.92170818505339,
			"hill_x": 52.725124313652216,
			"hill_y": 1517.2722419083213
		},
		{
			"id": "tree",
			"x": 656.5730486991328,
			"y": 363.7437722419929,
			"hill_x": 597.3735538359197,
			"hill_y": 1787.4013708116856
		},
		{
			"id": "tree",
			"x": 594.606404269513,
			"y": 443.914590747331,
			"hill_x": 526.114162194903,
			"hill_y": 1873.4581768522703
		},
		{
			"id": "tree",
			"x": 673.8872581721148,
			"y": 472.15658362989325,
			"hill_x": 598.6366544892162,
			"hill_y": 1905.9808879422847
		},
		{
			"id": "tree",
			"x": 819.6911274182788,
			"y": 476.71174377224196,
			"hill_x": 735.1477765239833,
			"hill_y": 1916.42203561988
		},
		{
			"id": "tree",
			"x": 1010.1474316210807,
			"y": 491.288256227758,
			"hill_x": 912.932152711244,
			"hill_y": 1939.0248947143687
		},
		{
			"id": "tree",
			"x": 960.9386257505003,
			"y": 414.7615658362989,
			"hill_x": 855.2753948303028,
			"hill_y": 1867.8491020822248
		},
		{
			"id": "tree",
			"x": 0,
			"y": 265.3523131672598,
			"hill_x": -131.00708695127977,
			"hill_y": 1734.492542691131
		},
		{
			"id": "tree",
			"x": 0,
			"y": 164.22775800711742,
			"hill_x": -140.29983416267663,
			"hill_y": 1639.2539750662352
		},
		{
			"id": "tree",
			"x": 78.82521681120747,
			"y": 173.33807829181495,
			"hill_x": -74.99134056804641,
			"hill_y": 1656.9257317658369
		},
		{
			"id": "tree",
			"x": 662.9519679786524,
			"y": 496.9964412811388,
			"hill_x": 482.10196416624404,
			"hill_y": 1997.7069675849689
		},
		{
			"id": "tree",
			"x": 65.1561040693796,
			"y": 312.7259786476868,
			"hill_x": -158.77845499586874,
			"hill_y": 1840.726083524024
		},
		{
			"id": "tree",
			"x": 7.7458305537024685,
			"y": 366.47686832740214,
			"hill_x": -228.86065652708706,
			"hill_y": 1902.503319842712
		},
		{
			"id": "tree",
			"x": 65.1561040693796,
			"y": 481.2669039145908,
			"hill_x": -183.27751582591503,
			"hill_y": 2024.7846122929418
		},
		{
			"id": "tree",
			"x": 133.501667778519,
			"y": 496.9964412811388,
			"hill_x": -125.06949452920867,
			"hill_y": 2046.9352269706678
		},
		{
			"id": "tree",
			"x": 241.03202134756503,
			"y": 496.9964412811388,
			"hill_x": -28.52147857363201,
			"hill_y": 2053.8913940577777
		},
		{
			"id": "tree",
			"x": 215.51634422948635,
			"y": 496.9964412811388,
			"hill_x": -70.93305971243282,
			"hill_y": 2064.593189576408
		},
		{
			"id": "tree",
			"x": 280.2168112074716,
			"y": 496.9964412811388,
			"hill_x": -75.52459014068234,
			"hill_y": 2188.197771378996
		},
		{
			"id": "tree",
			"x": 830.6264176117411,
			"y": 369.2099644128114,
			"hill_x": 474.88501626358715,
			"hill_y": 2102.411294510669
		},
		{
			"id": "tree",
			"x": 925.3989326217478,
			"y": 279.01779359430606,
			"hill_x": 569.6575312735938,
			"hill_y": 2048.2191236921635
		},
		{
			"id": "tree",
			"x": 970.9626417611742,
			"y": 431.16014234875445,
			"hill_x": 615.2212404130203,
			"hill_y": 2244.361472446612
		},
		{
			"id": "tree",
			"x": 215.51634422948635,
			"y": 342.79003558718864,
			"hill_x": -140.2250571186676,
			"hill_y": 2211.991365685046
		},
		{
			"id": "tree",
			"x": 326.69179452968643,
			"y": 449.3807829181494,
			"hill_x": -29.04960681846751,
			"hill_y": 2336.5821130160066
		},
		{
			"id": "tree",
			"x": 882.5690460306872,
			"y": 337.3238434163701,
			"hill_x": 526.8276446825332,
			"hill_y": 2260.5251735142274
		},
		{
			"id": "tree",
			"x": 946.358238825884,
			"y": 156.02846975088968,
			"hill_x": 590.6168374777301,
			"hill_y": 2117.229799848747
		},
		{
			"id": "tree",
			"x": 1046.5983989326219,
			"y": 360.0996441281139,
			"hill_x": 690.856997584468,
			"hill_y": 2373.3009742259715
		},
		{
			"id": "tree",
			"x": 238.29819879919947,
			"y": 359.18861209964416,
			"hill_x": -117.44320254895447,
			"hill_y": 2422.3899421975016
		},
		{
			"id": "tree",
			"x": 370.4329553035357,
			"y": 360.0996441281139,
			"hill_x": 14.691553955381778,
			"hill_y": 2437.3009742259715
		},
		{
			"id": "tree",
			"x": 528.0833889259507,
			"y": 423.8718861209964,
			"hill_x": 172.34198757779671,
			"hill_y": 2543.0732162188538
		},
		{
			"id": "tree",
			"x": 457.00400266844565,
			"y": 291.7722419928826,
			"hill_x": 101.26260132029171,
			"hill_y": 2440.97357209074
		},
		{
			"id": "tree",
			"x": 626.5010006671114,
			"y": 380.1423487544484,
			"hill_x": 270.75959931895744,
			"hill_y": 2547.343678852306
		},
		{
			"id": "tree",
			"x": 627.4122748499,
			"y": 378.3202846975089,
			"hill_x": 332.30223962695345,
			"hill_y": 2622.119218324513
		},
		{
			"id": "tree",
			"x": 701.2254836557705,
			"y": 467.6014234875445,
			"hill_x": 441.59684687633927,
			"hill_y": 2733.8741277036715
		},
		{
			"id": "tree",
			"x": 278.3942628418946,
			"y": 352.81138790035584,
			"hill_x": 37.35112048525707,
			"hill_y": 2630.8560671869764
		},
		{
			"id": "tree",
			"x": 379.545697131421,
			"y": 458.491103202847,
			"hill_x": 163.8464108058658,
			"hill_y": 2752.588475767413
		},
		{
			"id": "tree",
			"x": 901.7058038692461,
			"y": 9.352313167259787,
			"hill_x": 726.5566871934227,
			"hill_y": 2329.133994976538
		},
		{
			"id": "tree",
			"x": 1055.711140760507,
			"y": 109.56583629893238,
			"hill_x": 900.8371089095494,
			"hill_y": 2442.189672730567
		},
		{
			"id": "tree",
			"x": 1045.6871247498332,
			"y": 122.3202846975089,
			"hill_x": 907.7089969195972,
			"hill_y": 2465.6459166477734
		},
		{
			"id": "tree",
			"x": 454.27018012008006,
			"y": 374.6761565836299,
			"hill_x": 353.4630411354317,
			"hill_y": 2741.5457386748812
		},
		{
			"id": "tree",
			"x": 498.0113408939293,
			"y": 454.846975088968,
			"hill_x": 410.7209251258583,
			"hill_y": 2830.2779935951235
		},
		{
			"id": "tree",
			"x": 662.0406937958638,
			"y": 411.11743772241994,
			"hill_x": 588.2670012443702,
			"hill_y": 2795.1098926434797
		},
		{
			"id": "tree",
			"x": 567.2681787858572,
			"y": 201.58007117437722,
			"hill_x": 544.1821982965287,
			"hill_y": 2617.6779126513275
		},
		{
			"id": "tree",
			"x": 803.2881921280854,
			"y": 439.3594306049822,
			"hill_x": 829.2003332988496,
			"hill_y": 2886.49247908596
		},
		{
			"id": "tree",
			"x": 362.231487658439,
			"y": 0,
			"hill_x": 142.3082253277027,
			"hill_y": 2291.421923684939
		},
		{
			"id": "tree",
			"x": 354.0300200133422,
			"y": 46.704626334519574,
			"hill_x": 124.24509397893493,
			"hill_y": 1854.596442560809
		},
		{
			"id": "tree",
			"x": 820.6024016010674,
			"y": 6.619217081850534,
			"hill_x": 671.7691750697918,
			"hill_y": 1609.946074560177
		},
		{
			"id": "tree",
			"x": 447.8912608405604,
			"y": 29.395017793594306,
			"hill_x": 343.21350676553834,
			"hill_y": 1521.1409886821227
		},
		{
			"id": "tree",
			"x": 861.609739826551,
			"y": 66.74733096085409,
			"hill_x": 841.5633079593484,
			"hill_y": 1344.6299358856031
		},
		{
			"id": "tree",
			"x": 182.71047364909938,
			"y": 199.75800711743773,
			"hill_x": 221.53800505690174,
			"hill_y": 1328.866096589123
		},
		{
			"id": "tree",
			"x": 0,
			"y": 85.87900355871886,
			"hill_x": 62.745078988273065,
			"hill_y": 1154.5474461275967
		}
	],
	
	constructor: function(options) {
		TestLevel.super.constructor.call(this, options);
	},
	
	tick: function() {
		
	},
	
	_xyz: null
});