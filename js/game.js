/* jshint quotmark:false, strict:false, eqeqeq:false */
/* global createjs, BASE, Point2D */
var GAME = BASE.extend({
	toHook: [
		'#gameArea',
		'#game',
		'#touchSteer',
		window,
		'body',
		'#preloader',
		'#spinner',
		'#progBox',
		'#progBar',
		'#distance',
		'#score',
		'#dispPercent',
		'#scorePanel',
		'#pauseState',
		'#menuButton'
	],
	
	playerVertPositionFactor: 0.2,
	
	touchTargets: ['#touchSteer'],
	
	manifest: [
		{src:"images/boarder-small.png", id:"boarder-small"},
		{src:"images/obstacles/rock-1.png", id:"rock-1"},
		{src:"images/obstacles/rock-2.png", id:"rock-2"},
		{src:"images/obstacles/rock-3.png", id:"rock-3"},
		{src:"images/obstacles/rock-4.png", id:"rock-4"},
		
		{src:"images/obstacles/tree-single.png", id:"tree-1"},
		{src:"images/obstacles/tree-stump.png", id:"stump-1"},
		
		{src:"images/banners/start.png", id:"start-banner"},
		
		{src:"images/interaction/jump-center.jpg", id:"jump-center"},
		{src:"images/interaction/jump-left.jpg", id:"jump-left"},
		{src:"images/interaction/jump-right.jpg", id:"jump-right"},

		{src:"images/snow-bg.jpg", id:"snow-surface"},
		{src:"sounds/snow-1.ogg", id: "snow-1", type: createjs.LoadQueue.SOUND},
		{src:"sounds/snow-2.ogg", id: "snow-2", type: createjs.LoadQueue.SOUND},
		{src:"sounds/snow-3.ogg", id: "snow-3", type: createjs.LoadQueue.SOUND},
		{src:"sounds/snow-4.ogg", id: "snow-4", type: createjs.LoadQueue.SOUND}
	],
	
	totalBytesLoaded: 0,
	
	sprites: {},
	
	movingElements: [],
	
	
	props: [
		{id: 'start-banner', cls: 'StartBanner'}
	],
	
	interactives: [
		{id: 'jump-left', cls: 'JumpLeft'},
		{id: 'jump-center', cls: 'JumpCenter'},
		{id: 'jump-right', cls: 'JumpRight'},
	],
	
	obstacles: [
		{id: 'rock-1', cls: "Rock1"},
		{id: 'rock-2', cls: "Rock2"},
		{id: 'rock-3', cls: "Rock3"},
		{id: 'rock-4', cls: "Rock4"},
		{id: 'tree', cls: "Tree"},
		{id: 'stump', cls: "Stump"}
	],
	
	bonuses: ['gate', 'coin'],
	
	steerDirections: ['left3', 'left2', 'left1', 'straight', 'right1', 'right2', 'right3'],
	steerSpeeds: {
		'left3': 		{d: 147.65, sound: 'snow-1'},
		'left2': 		{d: 131.59, sound: 'snow-2'},
		'left1': 		{d: 111.59, sound: 'snow-3'},
		'straight': {d: 90.00,  sound: 'snow-4'},
		'right1': 	{d: 68.41,  sound: 'snow-3'},
		'right2': 	{d: 48.81,  sound: 'snow-2'},
		'right3': 	{d: 32.35,  sound: 'snow-1'}
	},
	
	speed: 10,
	level: 1,
	nextLevelAt: 150,
	score: 0,
	distance: 0,
	
	direction: 3,
	stage: null,
	width: 0,
	height: 0,
	
	lastObstAt: 0,
	obstEvery: 500,
	
	lastInterAt: 0,
	interEvery: 1000,
	
	under: null,
	between: null,
	over: null,
	
	jumping: false,
	
	sounds: {},
	
	state: 'loading',
	
	constructor: function(o) {
		var ctxt = this;
		
		GAME.super.constructor.call(this, o);
		
		ctxt.hook();
		
		ctxt.$game = $('<canvas></canvas>');
		ctxt.$game
			.attr('width', ctxt.baseline.width)
			.attr('height', ctxt.baseline.height)
			.attr('id', 'game')
			.prependTo('#gameArea');
		
		ctxt.stage = new createjs.Stage("game");
		
		ctxt.width = ctxt.stage.canvas.width;
		ctxt.height = ctxt.stage.canvas.height;
		
		ctxt.$window.resize(function(e) {
			//console.log('resized');
			ctxt.reflowUI();
		});
		
		ctxt.$menuButton.on('click', function(e) {
			ctxt.pause();
		});
		
		ctxt.getManSize(function() {
			ctxt.state = 'loading';
			ctxt.loader = new createjs.LoadQueue();
			ctxt.loader.installPlugin(createjs.Sound);
			//ctxt.loader.addEventListener("complete", function() { ctxt.init(); });
			ctxt.loader.on('complete', ctxt.init, ctxt);
			ctxt.loader.on('fileload', ctxt.fileComplete, ctxt);
			//ctxt.loader.on('progress', ctxt.loadProgress, ctxt);
			ctxt.loader.on('fileprogress', ctxt.fileProg, ctxt);
			ctxt.loader.loadManifest(ctxt.manifest);
		});
	},
	
	getManSize: function(after) {
		var ctxt = this;
		
		$.post('manifest-size.php', {manifest: ctxt.manifest}, function(data) {
			ctxt.manifestSizes = data;
			if (typeof after === 'function') {
				after.apply(ctxt);
			}
		}, 'json');
	},
	
	updateProgress: function() {
		var ctxt = this;
		
		
		ctxt.totalBytesLoaded = 0;
		$.each(ctxt.manifestSizes.assets, function(id, e) {
			ctxt.totalBytesLoaded += e.loaded || 0;
		});
		
		var total_percent = ((ctxt.totalBytesLoaded / ctxt.manifestSizes.total) * 100);
		var disp_total_percent = total_percent.toFixed(2) + '%';
		ctxt.$progBar.val(total_percent);
		ctxt.$dispPercent.html(disp_total_percent);
	},
	
	fileProg: function(ev) {
		var ctxt = this;
		var manID = ev.item.id;
		var file = ctxt.manifestSizes.assets[manID];
		var bytesLoaded = file.size * ev.progress;
		ctxt.manifestSizes.assets[manID].loaded = bytesLoaded;
		
		var file_percent = ((bytesLoaded / file.size) * 100).toFixed(2) + '%';
		var total_percent = ((ctxt.totalBytesLoaded / ctxt.manifestSizes.total) * 100).toFixed(2) + '%';
		ctxt.updateProgress();
		
		//console.log('PROGRESS', ev.item.id, ev.item.src, file_percent, total_percent);
	},
	
	fileComplete: function(ev) {
		var ctxt = this;
		
		ctxt.manifestSizes.assets[ev.item.id].loaded = ctxt.manifestSizes.assets[ev.item.id].size;
		ctxt.updateProgress();
		//console.log('COMPLETE', ev.item.id, ev.item.src);
	},
	
	
	init: function() {
		var ctxt = this;
		var d = ctxt.dimensions();
		
		ctxt.state = 'initializing';
		
		// ctxt.$game.css({
		// 	left: ((d.width / 2) - (ctxt.width / 2)),
		// 	top: ((d.height / 2) - (ctxt.height / 2))
		// });
		
		ctxt.centerElem(ctxt.$touchSteer, true, false);
		
		
		
		ctxt.initHill();
		
		ctxt.initLayers();
		
		ctxt.initBoarder();
		
		ctxt.setupStart();
		
		ctxt.initControls();
		
		ctxt.reflowUI();
		
		ctxt.$preloader.fadeOut(250);
		
		ctxt.initSound();
		
		ctxt.start();
		
		
		
	},
	
	start: function() {
		var ctxt = this;
		
		createjs.Ticker.timingMode = createjs.Ticker.RAF;
		//createjs.Ticker.setPaused(true)
		createjs.Ticker.addEventListener("tick", function(event) {
			ctxt.tick(event);
		});
		
		ctxt.reflowUI();
		ctxt.stage.update();
	},
	
	initLayers: function() {
		var ctxt = this;
		ctxt.under = new createjs.Container();
		ctxt.between = new createjs.Container();
		ctxt.over = new createjs.Container();
		
		
		//ctxt.over.x = ctxt.stage.x;
		//ctxt.over.y = ctxt.stage.y;
		//ctxt.over.width = ctxt.stage.canvas.width;
		//ctxt.over.height = ctxt.stage.canvas.height;
		
		ctxt.stage.addChild(ctxt.under);
		ctxt.stage.addChild(ctxt.between);
		ctxt.stage.addChild(ctxt.over);
	},
	
	pause: function() {
		var ctxt = this;
		var pause = createjs.Ticker.getPaused();
		pause = !pause;
		createjs.Ticker.setPaused(pause);
		if (pause) {
			ctxt.$pauseState.show();
		} else {
			ctxt.$pauseState.hide();
		}
		
	},
	
	setupStart: function() {
		var ctxt = this;
		
		var banner = ctxt.getAssetById('start-banner');
		if (banner) {
			ctxt.addEntity({
				id: 'start-banner',
				x: (ctxt.baseline.width / 2) - (banner.tag.width / 2),
				y: 800
			});
		}
	},
	
	initSound: function() {
		var ctxt = this;
		
		//ctxt.snowSound = createjs.Sound.play('snow-4');
	},
	
	initHill: function() {
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
			console.log('key ' + e.which);
			switch (e.which) {
				case 37:
					ctxt.steer('left');
					break;
				case 39:
					ctxt.steer('right');
					break;
				case 32:
					ctxt.jump();
					break;
				case 38:
					ctxt.speed++;
					break;
				case 40:
					ctxt.speed--;
					break;
				case 80:
					ctxt.pause();
					break;
			}
		});
		
		ctxt.touchHandling();
		ctxt.tiltHandling();
		
		if (ctxt.isTouchDevice()) {
			ctxt.$touchSteer.show();
		}
	},
	
	jump: function() {
		var ctxt = this;
		if (ctxt.jumping) {
			return;
		}
		ctxt.jumping = true;
		var dirName = ctxt.steerDirections[ctxt.direction];
		ctxt.boarder.gotoAndPlay(dirName + "-jump");
	},
	
	reflowUI: function() {
		var ctxt = this;
		var dim = ctxt.baseline; //ctxt.dimensions();
		
		var height_factor = ctxt.layout() == 'landscape' ? 12 : 6;
		var radius_factor = ctxt.layout() == 'landscape' ? 12 : 10;
		
		var touch_width = Math.min(dim.width - 30, 600);
		var touch_height = Math.round(dim.width / height_factor);
		var radius = Math.round(touch_height / 2); //Math.round(touch_width / radius_factor);
		var font_size = Math.round(touch_height * .7);
		
		ctxt.width = dim.width;
		ctxt.height = dim.height;

		var viewportWidth = ctxt.$window.width();
		var viewportHeight = ctxt.$window.height();
		var scale = Math.min(viewportWidth / ctxt.baseline.width, viewportHeight / ctxt.baseline.height);
		ctxt.stage.scaleX = scale;
		ctxt.stage.scaleY = scale;
		ctxt.stage.canvas.width = ctxt.baseline.width * scale;
		ctxt.stage.canvas.height = ctxt.baseline.height * scale;
		ctxt.stage.update();
		
		ctxt.centerElem(ctxt.$scorePanel, true, false);
		
		ctxt.centerElem(ctxt.$game, true, true);
		
		ctxt.$scorePanel.css({
			width: ctxt.baseline.width * scale,
			top: $(ctxt.stage.canvas).css('top')
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
		
		ctxt.ground.graphics.beginBitmapFill(ctxt.groundImg).drawRect(-ctxt.groundImg.width, 0, dim.width + (2 * ctxt.groundImg.width), dim.height + ctxt.groundImg.height);
			
		
		ctxt.centerElem(ctxt.$touchSteer, true, false);
	},
	
	touch: function(event, selector) {
		var ctxt = this;
		
		switch (event.type) {
			case 'touchmove':
				var pos = ctxt.$touchSteer.position();
				var x = event.touchX - pos.left;
				var y = event.touchY - pos.top;
				
				var w = parseInt(ctxt.$touchSteer.width());
				
				var moveTick = w / ctxt.steerDirections.length;
				
				var newPos = ctxt.steerDirections.length - Math.round(x / moveTick);
				ctxt.steerAbs(newPos);
				break;
			case 'click':
				ctxt.jump();
				break;
		}
	},
	
	steerAbs: function(where) {
		var ctxt = this;
		
		if (where == ctxt.direction || ctxt.jumping) {
			return;
		}
		
		var dirName = ctxt.steerDirections[where];
		var speed = ctxt.steerSpeeds[dirName];
		
		//console.log(dirName);
		
		//ctxt.snowSound.stop();
		//ctxt.snowSound = createjs.Sound.play(speed.sound);
		ctxt.direction = where;
		
		ctxt.boarder.gotoAndPlay(dirName);
	},
	
	steer: function(dir) {
		var ctxt = this;
		dir = dir === 'left' ? 'left' : 'right';
		
		var where = ctxt.direction;
		
		if (dir == 'left') {
			if (ctxt.direction < ctxt.steerDirections.length - 1) {
				where++;
			}
		} else {
			if (ctxt.direction > 0) {
				where--;
			}	
		}
		
		ctxt.steerAbs(where);
	},
	
	initBoarder: function() {
		var ctxt = this;
		
		var animations = {};
		
		$.each(ctxt.steerDirections, function(i, d) {
			animations[d] = (i * 13);
			animations[d + '-jump'] = [i * 13, (i * 13) + 12, d, 0.5];
		});
		
		//console.log(animations);
		
		ctxt.sprites.boarder = new createjs.SpriteSheet({
			"images": [ctxt.loader.getResult("boarder-small")],
			"frames": {"width": 100, "height": 125},
			"animations": animations
		});
		
		ctxt.boarder = new createjs.Sprite(ctxt.sprites.boarder, "straight");
		ctxt.boarder.on('animationend', function() {
			ctxt.jumping = false;
		});
		ctxt.boarder.x = (ctxt.$game.width() / 2) - (ctxt.boarder.spriteSheet._frameWidth / 2);
		ctxt.boarder.y = (ctxt.$game.height() * ctxt.playerVertPositionFactor) - (ctxt.boarder.spriteSheet._frameHeight / 2);
		ctxt.boarder.framerate = 30;
		//ctxt.stage.addChild(ctxt.boarder);
		ctxt.between.addChild(ctxt.boarder);
	},
	
	getAssetById: function(id) {
		var ctxt = this;
		var ret = false;
		
		for (var i = 0, l = ctxt.manifest.length; i < l; i++) {
			var asset = ctxt.manifest[i];
			if (asset.id == id) {
				ret = asset;
				break;
			}
		}
		
		return ret;
	},
	
	getEntityById: function(id) {
		var ctxt = this;
		var ret = false;
		
		
		var pool = [];
		
		pool = pool.concat(ctxt.obstacles, ctxt.interactives, ctxt.props);
		
		for (var i = 0, l = pool.length; i < l; i++) {
			var ent = pool[i];
			if (ent.id == id) {
				ret = ent;
				break;
			}
		}
		//
		//if (ret === false) {
		//		
		//	for (var i = 0, l = ctxt.obstacles.length; i < l; i++) {
		//		var ent = ctxt.obstacles[i];
		//		if (ent.id == id) {
		//			ret = ent;
		//			break;
		//		}
		//	}
		//}
		
		return ret;
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
	
	sweetMessage: function(o) {
		var ctxt = this;
		var opts = {
			message: "No message",
			x: ctxt.baseline.width / 2,
			y: ctxt.boarder.y
		};
		
		opts = $.extend({}, opts, o);
		
		var $message = $('<span></span>');
		$message
			.addClass('sweetMessage')
			.hide()
			.appendTo(ctxt.$body)
			.html(opts.message);
			
			
		console.log($message.width() + 'x' + $message.height());
			
		$message
			.show()
			.css({
				left: opts.x - ($message.width() / 2),
				top: opts.y - ($message.height() / 2)
			})
			.animate({
				top: '-=25px'
			}, 500, function() {
				$message.remove();
			});
	},
	
	addEntity: function(o) {
		var ctxt = this;
		var defaults = {
			obstacles: true,
			interactives: false,
			props: false
		};
		
		o = $.extend({}, defaults, o);
		
		var pool = [];
		
		if (o.obstacles) { pool = pool.concat(ctxt.obstacles); }
		if (o.interactives) { pool = pool.concat(ctxt.interactives); }
		if (o.props) { pool = pool.concat(ctxt.props); }
		
		
		//id = typeof id === 'undefined' ? ctxt.obstacles[Math.floor(Math.random() * ctxt.obstacles.length)].id : id;
		o.id = typeof o.id === 'undefined' ? pool[Math.floor(Math.random() * pool.length)].id : o.id;
		
		var ent = ctxt.getEntityById(o.id);
		if (ent == false) {
			console.log("Missing entity: ", o.id)
			return false;
		}
		
		o.game = ctxt;
		
		var entity = new window[ent.cls](o);
		ctxt.movingElements.push(entity);
		return entity;
	},
	
	tick: function(event) {
		var ctxt = this;
		
		if (createjs.Ticker.getPaused()) {
			return;
		}
		
		var t = (new Date()).getTime();
		
		var dirName = ctxt.steerDirections[ctxt.direction];
		var speed = ctxt.steerSpeeds[dirName]; 
		var speedVector = ctxt.getSpeedVector();
		speed = speedVector;
		
		ctxt.ground.x = (ctxt.ground.x + speed.x) % ctxt.ground.tileW;
		ctxt.ground.y = (ctxt.ground.y + speed.y) % ctxt.ground.tileH;
		
		var distThisTick = Math.abs(speed.y);
		ctxt.distance += distThisTick / 20;
		ctxt.$distance.html(parseInt(ctxt.distance).commafy() + "'");
		ctxt.score += distThisTick * 10;
		ctxt.$score.html(parseInt(ctxt.score).commafy());

		var boarderBottomCenterX = ctxt.boarder.x + ctxt.boarder.spriteSheet._frameWidth / 2;
		var boarderBottomCenterY = ctxt.boarder.y + ctxt.boarder.spriteSheet._frameHeight;
		var boarder_pt1 = new Point2D(boarderBottomCenterX - speed.x, boarderBottomCenterY - speed.y);
		var boarder_pt2 = new Point2D(boarderBottomCenterX, boarderBottomCenterY);
		
		for (var i = ctxt.movingElements.length - 1; i >= 0; i--) {
			var entity = ctxt.movingElements[i];
			var e = entity.sprite;

			e.x += speed.x;
			e.y += speed.y;
			
			if (e.y + entity.spriteSheet._frameHeight < -100) {
				//ctxt.stage.removeChild(e);
				ctxt.under.removeChild(e);
				ctxt.movingElements.splice(i, 1);
			} else if (e.y + entity.spriteSheet._frameHeight < ctxt.boarder.y + ctxt.boarder.spriteSheet._frameHeight) {
				if (!entity.alwaysUnder) {
					ctxt.over.removeChild(e);
					ctxt.under.addChild(e);
				}
			}
			
			entity.checkCollisionAgainst({pt1: boarder_pt1, pt2: boarder_pt2});
			
		}
		
		var obst_delta = t - ctxt.lastObstAt;
		if (obst_delta >= ctxt.obstEvery) {
			ctxt.addEntity({interactives: false, obstacles: true});
			ctxt.lastObstAt = t;
		}
		
		var inter_delta = t - ctxt.lastInterAt;
		if (inter_delta >= ctxt.interEvery) {
			ctxt.addEntity({interactives: true, obstacles: false});
			ctxt.lastInterAt = t;
		}
		
		if (ctxt.distance > ctxt.nextLevelAt) {
			//ctxt.nextLevelAt *= 2;
			//ctxt.level++;
			//ctxt.sweetMessage({message: "Level " + ctxt.level});
		}
		
		//ctxt.reflowUI();
		ctxt.stage.update(event);
	},
	
	
	_xyz: null
});



var game = new GAME();
