

var GAME = BASE.extend({
	toHook: [
		'#gameArea', '#game', '#touchSteer', window, 'body', '#preloader', '#spinner', '#distance', '#score'
	],
	
	playerVertPositionFactor: 0.3,
	
	touchTargets: ['#touchSteer'],
	
	manifest: [
		{src:"images/boarder-sm.png", id:"boarder"},
		{src:"images/obstacles/snow-rock-1.gif", id:"rock-1"},
		{src:"images/obstacles/snow-tree-1.gif", id:"tree-1"},
		{src:"images/snow-bg.jpg", id:"snow-surface"},
		{src:"sounds/snow.mp3", id: "snow-1", type: createjs.LoadQueue.SOUND}
	],
	
	sprites: {},
	
	movingElements: [],
	
	obstacles: [
		{id: 'rock-1', cls: "Rock"},
		{id: 'tree-1', cls: "Tree"}
	],
	
	bonuses: ['gate', 'coin'],
	
	steerDirections: ['left3', 'left2', 'left1', 'straight', 'right1', 'right2', 'right3'],
	steerSpeeds: {
		'left3': 		{d: 159.51},
		'left2': 		{d: 145.91},
		'left1': 		{d: 124.76},
		'straight': {d: 90},
		'right1': 	{d: 55.24},
		'right2': 	{d: 34.09},
		'right3': 	{d: 20.49}
	},
	
	speed: 20,
	direction: 3,
	stage: null,
	width: 0,
	height: 0,
	
	lastObstAt: 0,
	obstEvery: 100,
	
	score: 0,
	distance: 0,
	
	sounds: {},
	
	constructor: function(o) {
		var ctxt = this;
		
		GAME.super.constructor.call(this, o);
		
		ctxt.hook();
		
		//ctxt.centerElem(ctxt.$spinner, true, true);
		
		var d = ctxt.dimensions();
		ctxt.$game = $('<canvas></canvas>');
		ctxt.$game
			.attr('width', d.width)
			.attr('height', d.height)
			.attr('id', 'game')
			.prependTo('#gameArea');
		
		ctxt.stage = new createjs.Stage("game");
		ctxt.width = ctxt.stage.canvas.width;
		ctxt.height = ctxt.stage.canvas.height;
		
		ctxt.$window.resize(function(e) {
			console.log('resized');
			ctxt.reflowUI();
		});
		
		
		
		ctxt.loader = new createjs.LoadQueue();
		ctxt.loader.installPlugin(createjs.Sound);
		//ctxt.loader.addEventListener("complete", function() { ctxt.init(); });
		ctxt.loader.on('complete', ctxt.init, ctxt);
		ctxt.loader.loadManifest(ctxt.manifest);
	},
	
	init: function() {
		var ctxt = this;
		var d = ctxt.dimensions();
		
		ctxt.$game.css({
			left: ((d.width / 2) - (ctxt.width / 2)),
			top: ((d.height / 2) - (ctxt.height / 2))
		});
		
		ctxt.centerElem(ctxt.$touchSteer, true, false);
		
		//createjs.Sound.registerPlugins([createjs.WebAudioPlugin, createjs.HTMLAudioPlugin, createjs.FlashPlugin]);
		////ctxt.sounds.snow = createjs.Sound.createInstance(ctxt.loader.getResult('snow-1'));
		////ctxt.sounds.snow.play({loop: -1});
		//var inst = createjs.Sound.play('snow-1');
		//var instance = createjs.Sound.createInstance('snow-1');
		//var pinst = instance.play('any', 0, 0, -1);
		
		
		
		ctxt.initSnow();
		
		ctxt.initBoarder();
		
		ctxt.initControls();
		
		ctxt.reflowUI();
		
		ctxt.$preloader.fadeOut(250);
		
		createjs.Ticker.timingMode = createjs.Ticker.RAF;
		createjs.Ticker.addEventListener("tick", function(event) { ctxt.tick(event); });
		
		
	},
	
	initSnow: function() {
		var ctxt = this;
		
		var dim = ctxt.dimensions();
		
		ctxt.groundImg = ctxt.loader.getResult("snow-surface");
		ctxt.ground = new createjs.Shape();
		ctxt.ground.graphics.beginBitmapFill(ctxt.groundImg).drawRect(-ctxt.groundImg.width, 0, dim.width + (2 * ctxt.groundImg.width), dim.height + ctxt.groundImg.height);
		ctxt.ground.tileW = ctxt.groundImg.width;
		ctxt.ground.tileH = ctxt.groundImg.height;
		ctxt.ground.y = dim.height - ctxt.groundImg.height;
		ctxt.stage.addChild(ctxt.ground);
	},
	
	initControls: function() {
		var ctxt = this;
		$(document).on('keydown', function(e) {
			if (e.which == 37) {
				ctxt.steer('left');
			} else if (e.which == 39) {
				ctxt.steer('right');
			}
		});
		
		ctxt.touchHandling();
		ctxt.tiltHandling();
		
		if (ctxt.isTouchDevice()) {
			ctxt.$touchSteer.show();
		}
	},
	
	reflowUI: function() {
		var ctxt = this;
		var dim = ctxt.dimensions();
		
		var height_factor = ctxt.layout() == 'landscape' ? 12 : 6;
		var radius_factor = ctxt.layout() == 'landscape' ? 12 : 10;
		
		var touch_width = Math.min(dim.width - 30, 600);
		var touch_height = Math.round(dim.width / height_factor);
		var radius = Math.round(touch_height / 2); //Math.round(touch_width / radius_factor);
		var font_size = Math.round(touch_height * .7);
		
		ctxt.width = dim.width;
		ctxt.height = dim.height;
		
		ctxt.$game
			.attr('width', dim.width)
			.attr('height', dim.height)
			.css({
				left: ((dim.width / 2) - (ctxt.width / 2)),
				top: ((dim.height / 2) - (ctxt.height / 2))
			});
		
		ctxt.$touchSteer
			.css({
				'-webkit-border-radius': radius + 'px',
				'-moz-border-radius': radius + 'px',
				'border-radius': radius + 'px',
				'font-size': font_size,
				'width': touch_width,
				'height': touch_height
			});
		
		//ctxt.ground.scaleX = ctxt.scaleFactor;
		//ctxt.ground.scaleY = ctxt.scaleFactor;
		ctxt.ground.graphics.beginBitmapFill(ctxt.groundImg).drawRect(-ctxt.groundImg.width, 0, dim.width + (2 * ctxt.groundImg.width), dim.height + ctxt.groundImg.height);
			
		//ctxt.centerElem(ctxt.$spinner, true, true);
		
		ctxt.centerElem(ctxt.$touchSteer, true, false);
		
		var targetHeight = dim.height * 0.1;
		ctxt.scaleFactor = targetHeight / ctxt.boarder.spriteSheet._frameHeight;
		var targetWidth = ctxt.boarder.spriteSheet._frameWidth * ctxt.scaleFactor;
		
		ctxt.boarder.scaleX = ctxt.scaleFactor;
		ctxt.boarder.scaleY = ctxt.scaleFactor;
		
		ctxt.boarder.x = (ctxt.width / 2) - (targetWidth / 2);
		ctxt.boarder.y = (ctxt.height * ctxt.playerVertPositionFactor) - (targetHeight / 2);
		
	},
	
	//tilt: function(o) {
	//	var ctxt = this;
	//	//console.log(ctxt.layout(), o);
	//
	//	return;
	//
	//	var steerAxis = ctxt.layout() === 'landscape' ? o.roll : o.pitch;
	//	
	//	if (steerAxis == null) {
	//		return;
	//	}
	//	
	//	var steerMap = {
	//		6: [-1000, -15],
	//		5: [-15, -10],
	//		4: [-10, -5],
	//		3: [-5, 5],
	//		2: [5, 10],
	//		1: [10, 15],
	//		0: [15, 1000]
	//	};
	//	
	//	var newDir = 3;
	//	$.each(steerMap, function(idx, range) {
	//		if (steerAxis >= range[0] && steerAxis < range[1]) {
	//			newDir = idx;
	//		}
	//	});
	//	
	//	ctxt.steerAbs(newDir);;
	//},
	
	touch: function(event, selector) {
		var ctxt = this;
		
		if (event.type == 'touchmove') {
			var pos = ctxt.$touchSteer.position();
			var x = event.touchX - pos.left;
			var y = event.touchY - pos.top;
			
			var w = parseInt(ctxt.$touchSteer.width());
			
			var moveTick = w / ctxt.steerDirections.length;
			
			var newPos = ctxt.steerDirections.length - Math.round(x / moveTick);
			ctxt.steerAbs(newPos);
			
		}
	},
	
	steerAbs: function(where) {
		var ctxt = this;
		var dirName = ctxt.steerDirections[where];
		ctxt.direction = where;
		ctxt.boarder.gotoAndPlay(dirName);
	},
	
	steer: function(dir) {
		var ctxt = this;
		dir = dir === 'left' ? 'left' : 'right';
		
		if (dir == 'left') {
			if (ctxt.direction < ctxt.steerDirections.length - 1) {
				ctxt.direction++;
			}
		} else {
			if (ctxt.direction > 0) {
				ctxt.direction--;
			}	
		}
		
		ctxt.steerAbs(ctxt.direction);
	},
	
	initBoarder: function() {
		var ctxt = this;
		
		ctxt.sprites.boarder = new createjs.SpriteSheet({
			"images": [ctxt.loader.getResult("boarder")],
			"frames": {"height": 191, "width": 150},
			"animations": {
				"left3": [0],
				"left2": [1],
				"left1": [2],
				"straight": [3],
				"right1": [4],
				"right2": [5],
				"right3": [6]
			}
		});
		
		ctxt.boarder = new createjs.Sprite(ctxt.sprites.boarder, "straight");
		ctxt.boarder.x = (ctxt.width / 2) - (ctxt.boarder.spriteSheet._frameWidth / 2);
		ctxt.boarder.y = (ctxt.height * ctxt.playerVertPositionFactor) - (ctxt.boarder.spriteSheet._frameHeight / 2);
		ctxt.boarder.framerate = 30;
		ctxt.stage.addChild(ctxt.boarder);
	},
	
	getEntityById: function(id) {
		var ctxt = this;
		var ret = false;
		for (var i = 0, l = ctxt.obstacles.length; i < l; i++) {
			var ent = ctxt.obstacles[i];
			if (ent.id == id) {
				ret = ent;
				break;
			}
		}
		
		return ret;
	},
	
	addObst: function(id, o) {
		var ctxt = this;
		
		
		id = typeof id === 'undefined' ? ctxt.obstacles[Math.floor(Math.random() * ctxt.obstacles.length)].id : id;
		
		var ent = ctxt.getEntityById(id);
		if (ent == false) {
			console.log("Missing entity: ", ent, id)
			return;
		}
		
		var entity = new window[ent.cls]({game: ctxt});
		
		//console.log(entity);
		
		//var dim = ctxt.dimensions();
		//
		//var image = ctxt.loader.getResult(id);
		//var myBitmap = new createjs.Bitmap(image);
		//
		//var x = typeof o.x === 'undefined' ? (Math.random() * (dim.width * 1.5)) - (dim.width * 0.25) : o.x;
		//var y = typeof o.y === 'undefined' ? myBitmap.y = dim.height + 50 : o.y;
		//
		//myBitmap.x = x;
		//myBitmap.y = y;
		//myBitmap.scaleX = ctxt.scaleFactor;
		//myBitmap.scaleY = ctxt.scaleFactor;
		//
		//ctxt.stage.addChild(myBitmap);
		
		//ctxt.movingElements.push(myBitmap);
		ctxt.movingElements.push(entity);
		
		// steerSpeeds
		// movingElements
		
	},
	
	getSpeedVector: function() {
		var ctxt = this;
		var dirName = ctxt.steerDirections[ctxt.direction];
		var dir = ctxt.steerSpeeds[dirName];
		
		var rads = (((dir.d + 90)/360)*(2*Math.PI));
		var ret = {
			d: dir.d,
			r: rads,
			x: Math.sin(rads) * ctxt.speed,
			y: Math.cos(rads) * ctxt.speed,
		};
		
		return ret;
	},
	
	tick: function(event) {
		var ctxt = this;
		
		//return;
		
		var t = (new Date()).getTime();
		
		var dirName = ctxt.steerDirections[ctxt.direction];
		var speed = ctxt.steerSpeeds[dirName]; 
		var speedVector = ctxt.getSpeedVector()
		//console.log(speed, speedVector);
		speed = speedVector;
		
		ctxt.ground.x = (ctxt.ground.x + (speed.x * ctxt.scaleFactor)) % ctxt.ground.tileW;
		ctxt.ground.y = (ctxt.ground.y + (speed.y * ctxt.scaleFactor)) % ctxt.ground.tileH;
		
		var distThisTick = (Math.abs(speed.y) * ctxt.scaleFactor) / 32;
		ctxt.distance += distThisTick;
		ctxt.$distance.html(parseInt(ctxt.distance) + "'");
		ctxt.score += distThisTick * 10;
		ctxt.$score.html(parseInt(ctxt.score));
		
		//$.each(ctxt.movingElements, function(i, ent) {
		for (var i = ctxt.movingElements.length - 1; i >= 0; i--) {
			var entity = ctxt.movingElements[i];
			var e = entity.sprite;
			e.x += speed.x * ctxt.scaleFactor;
			e.y += speed.y * ctxt.scaleFactor;
			e.scaleX = ctxt.scaleFactor;
			e.scaleY = ctxt.scaleFactor;
			//console.log(e);
			
			if (e.y + entity.spriteSheet._frameHeight < -100) {
				ctxt.stage.removeChild(e);
				ctxt.movingElements.splice(i, 1);
			}
		}
		//});
		
		var obst_delta = t - ctxt.lastObstAt;
		if (obst_delta >= ctxt.obstEvery) {
			ctxt.addObst();
			ctxt.lastObstAt = t;
		}
		
		ctxt.stage.update(event);
	},
	
	
	_xyz: null
});



var game = new GAME();