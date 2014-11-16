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
		'#menuButton',
		'#highScores'
	],
	
	playerVertPositionFactor: 0.2,
	
	touchTargets: ['#touchSteer'],
	
	manifestSizes: "{{manifest-sizes}}",
	manifest: "{{manifest-data}}",
	
	//manifest: [
	//	{src:"images/boarder-large.png", id:"boarder-large"},
	//	{src:"images/sprite-boarder.png", id:"boarder-small"},
	//	{src:"images/obstacles/rock-1.png", id:"rock-1"},
	//	{src:"images/obstacles/rock-2.png", id:"rock-2"},
	//	{src:"images/obstacles/rock-3.png", id:"rock-3"},
	//	{src:"images/obstacles/rock-4.png", id:"rock-4"},
	//	
	//	{src:"images/obstacles/tree-single.png", id:"tree-1"},
	//	{src:"images/obstacles/tree-stump.png", id:"stump-1"},
	//	
	//	{src:"images/banners/start.png", id:"start-banner"},
	//	
	//	{src:"images/bonuses/beer.png", id:"beer"},
	//	{src:"images/bonuses/coin.png", id:"coin"},
	//	
	//	{src:"images/interaction/jump-center.png ", id:"jump-center", type: createjs.LoadQueue.IMAGE},
	//	{src:"images/interaction/jump-left.png", id:"jump-left", type: createjs.LoadQueue.IMAGE},
	//	{src:"images/interaction/jump-right.png", id:"jump-right", type: createjs.LoadQueue.IMAGE},
	//
	//	//{src:"images/misc/sinistar-sprite.gif", id:"sinistar"},
	//	
	//	//{src:"images/snow-bg.jpg", id:"snow-surface"},
	//	{src:"images/snow-bg-2.jpg", id:"snow-surface-2"},
	//	//
	//	{src:"sounds/snow-1.xogg", id: "snow-1", type: createjs.LoadQueue.BINARY}
	//	//,
	//	//{src:"sounds/snow-2.xogg", id: "snow-2", type: createjs.LoadQueue.BINARY},
	//	//{src:"sounds/snow-3.xogg", id: "snow-3", type: createjs.LoadQueue.BINARY},
	//	//{src:"sounds/snow-4.xogg", id: "snow-4", type: createjs.LoadQueue.BINARY}
	//],
	
	totalBytesLoaded: 0,
	
	sprites: {},
	
	movingElements: [],
	
	bonuses: [
		{id: 'coin', cls: 'Coin'},
		{id: 'beer', cls: 'Beer'},
	],
	
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
		//,
		//{id: 'sinistar', cls: "Sinistar"}
	],
	
	//bonuses: ['beer', 'coin'],
	
	steerDirections: ['left3', 'left2', 'left1', 'straight', 'right1', 'right2', 'right3'],
	steerSpeeds: {
		'left3': 		{d: 147.65, sound: {id: 'snow-1', rate: 0.25}, boardTip: {x: 713, y: 237}},
		'left2': 		{d: 131.59, sound: {id: 'snow-1', rate: 0.5}, boardTip: {x: 713, y: 223}},
		'left1': 		{d: 111.59, sound: {id: 'snow-1', rate: 0.75}, boardTip: {x: 690, y: 230}},
		'straight': {d: 90.00,  sound: {id: 'snow-1', rate: 1}, boardTip: {x: 679, y: 235}},
		'right1': 	{d: 68.41,  sound: {id: 'snow-1', rate: 0.75}, boardTip: {x: 670, y: 230}},
		'right2': 	{d: 48.81,  sound: {id: 'snow-1', rate: 0.5}, boardTip: {x: 655, y: 235}},
		'right3': 	{d: 32.35,  sound: {id: 'snow-1', rate: 0.25}, boardTip: {x: 648, y: 225}}
	},
	
	initSpeed: 15,
	speed: 15,
	level: 1,
	nextLevelAt: 150,
	score: 0,
	distance: 0,
	
	direction: 3,
	stage: null,
	width: 0,
	height: 0,
	
	lastObstAt: 0,
	obstEvery: 5,
	
	lastBonusAt: 0,
	bonusEvery: 25,
	
	lastInterAt: 0,
	interEvery: 30,
	
	under: null,
	between: null,
	over: null,
	
	jumping: false,
	crashing: false,
	stopping: false,
	
	menuOpen: false,

	_drawnBoarderCollider: null,
	debug: false,
	
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
		
		if (localStorage.initSpeed) {
			ctxt.speed = localStorage.initSpeed;
		}
		
		ctxt.stage = new createjs.Stage("game");
		
		ctxt.width = ctxt.stage.canvas.width;
		ctxt.height = ctxt.stage.canvas.height;
		
		ctxt.$window.resize(function(e) {
			var t = new Date();
			console.log('resize');
			setTimeout(function() {
				ctxt.reflowUI();
				console.log('resize done ' + ((new Date()).getTime() - t.getTime()));
			}, 100);
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
		
		//ctxt.manifestSizes = {
		//	assets: ctxt.manifest,
		//	total: ctxt.manifestSize
		//};
		
		if (typeof after === 'function') {
			after.apply(ctxt);
		}
		
		//$.post('manifest-size.php', {manifest: ctxt.manifest}, function(data) {
		//	ctxt.manifestSizes = data;
		//	if (typeof after === 'function') {
		//		after.apply(ctxt);
		//	}
		//}, 'json');
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
		
		console.log('PROGRESS', ev.item.id, ev.item.src, file_percent);
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
		
		
		if (localStorage && localStorage.highScoreName) {
			ctxt.$highScoreName.val(localStorage.highScoreName);
		}
		
		ctxt.initHill();
		
		ctxt.initLayers();
		
		ctxt.initBoarder();
		
		
		ctxt.initControls();
		
		ctxt.reflowUI();
		
		ctxt.$preloader.fadeOut(250);
		
		ctxt.initSound();
		
		createjs.Ticker.timingMode = createjs.Ticker.RAF;
		createjs.Ticker.addEventListener("tick", function(event) {
			ctxt.tick(event);
		});
		
		ctxt.start();
		
		
		
	},
	
	start: function() {
		var ctxt = this;
		
		for (var i = ctxt.movingElements.length - 1; i >= 0; i--) {
			var ent = ctxt.movingElements[i];
			ent.remove();
		}
		
		ctxt.distance = 0;
		ctxt.score = 0;
		ctxt.direction = 3;
		ctxt.jumping = false;
		ctxt.crashing = false;
		ctxt.stopping = false;
		
		ctxt.lastObstAt = 0;
		ctxt.lastBonusAt = 0;
		ctxt.lastInterAt = 0;
		ctxt.speed = ctxt.initSpeed;
		
		ctxt.setupStart();
		
		var dirName = ctxt.steerDirections[ctxt.direction];
		ctxt.boarder.gotoAndPlay(dirName);
		
		ctxt.reflowUI();
		
		createjs.Ticker.setPaused(false);
		
		ctxt.stage.update();
	},
	
	initLayers: function() {
		var ctxt = this;
		//ctxt.under = new createjs.Container();
		//ctxt.between = new createjs.Container();
		//ctxt.over = new createjs.Container();
		
		
		//ctxt.over.x = ctxt.stage.x;
		//ctxt.over.y = ctxt.stage.y;
		//ctxt.over.width = ctxt.stage.canvas.width;
		//ctxt.over.height = ctxt.stage.canvas.height;
		
		//ctxt.stage.addChild(ctxt.under);
		//ctxt.stage.addChild(ctxt.between);
		//ctxt.stage.addChild(ctxt.over);
	},
	
	paused: function() {
		return createjs.Ticker.getPaused();
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
	
	stopSound: function() {
		var ctxt = this;
		
		if (!ctxt.audio.paused) {
			ctxt.audio.pause();
		}
	},
	
	playSound: function(o) {
		var ctxt = this;
		
		return;
		
		var def = {
			id: 'snow-1',
			rate: 1
		};
		
		o = $.extend({}, def, o);
		
		var data_uri = 'data:audio/ogg;charset=utf-8;base64,' + ctxt.base64ArrayBuffer(ctxt.loader.getResult(o.id));
		if (!ctxt.audio.paused) {
			ctxt.stopSound();
		}
		
		ctxt.audio.playbackRate = o.rate;
		ctxt.$audio.attr('src', data_uri);
		//ctxt.audio.currentTime = 0;
		ctxt.$audio[0].play();
	},
	
	initSound: function() {
		var ctxt = this;
		
		ctxt.$audio = $('<audio></audio>');
		ctxt.$audio.appendTo('body');
		ctxt.audio = ctxt.$audio[0];
		//ctxt.audio.currentTime = 0;
		ctxt.playSound({id: 'snow-1', rate: 1});
		ctxt.audio.addEventListener('ended', function() {
			this.currentTime = 0;
			this.play();
		}, false);
		
		//console.log(ctxt.base64ArrayBuffer(ctxt.loader.getResult('snow-4')));
		//$.each(ctxt.manifest, function(i, o) {
		//	if (/\.xogg/.test(o.src) ) {
		//		//console.log(o);
		//		var data_uri = 'data:audio/ogg;charset=utf-8;base64,' + ctxt.base64ArrayBuffer(ctxt.loader.getResult(o.id));
		//		//createjs.Sound.registerSound(data_uri, o.id);
		//		var $audio = $('<audio></audio>');
		//		$audio.appendTo('body');
		//		$audio.attr('autoplay', true);
		//		$audio.attr('src', data_uri);
		//	}
		//});
		
		//ctxt.snowSound = createjs.Sound.play('snow-4');
	},
	
	initHill: function() {
		var ctxt = this;
		
		var dim = ctxt.dimensions();
		
		ctxt.groundImg = ctxt.loader.getResult("snow-surface-2");
		ctxt.ground = new createjs.Shape();
		ctxt.ground.graphics.beginBitmapFill(ctxt.groundImg).drawRect(-ctxt.groundImg.width, -dim.height, dim.width + (2 * ctxt.groundImg.width), dim.height + ctxt.groundImg.height);
		ctxt.ground.tileW = ctxt.groundImg.width;
		ctxt.ground.tileH = ctxt.groundImg.height;
		ctxt.ground.y = dim.height - ctxt.groundImg.height;
		
		ctxt.stage.addChild(ctxt.ground);
		
	},
	
	initControls: function() {
		var ctxt = this;
		
		
		
		$(document).on('keydown', function(e) {
			if (ctxt.menuOpen) {
				return;
			}
			
			var which = String.fromCharCode(e.which).toUpperCase().charCodeAt(0);
			
			switch (which) {
				case 37:
					ctxt.steer('left');
					break;
				case 39:
					ctxt.steer('right');
					break;
				case 32:
					ctxt.jump();
					break;
				case 67:
					ctxt.crash();
					break;
				case 68:
					ctxt.debug = !ctxt.debug;
					break;
				case 82:
					ctxt.start();
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
		if (ctxt.jumping || ctxt.crashing || ctxt.stopping) {
			return;
		}
		ctxt.jumping = true;
		var dirName = ctxt.steerDirections[ctxt.direction];
		ctxt.boarder.gotoAndPlay(dirName + "-jump");
	},
	
	boost: function(o) {
		var ctxt = this;
		
		if (ctxt.crashing || ctxt.stopping) {
			return;
		}
		
		var def = {
			percentage: 50,
			duration: 5000,
			interval: 100
		};
		
		o = $.extend({}, def, o);;
		var origSpeed = ctxt.speed;
		ctxt.speed *= (1 + (o.percentage / 100))//1.5;
		
		var per = (ctxt.speed - origSpeed) / (o.duration / o.interval)//20;
		
		var boostInt = setInterval(function() {
			ctxt.speed -= per;
			if (ctxt.speed <= origSpeed && !ctxt.crashing && !ctxt.stopping) {
				ctxt.speed = origSpeed;
				clearInterval(boostInt);
			}
		}, o.interval);
		
	},

	crash: function () {
		var ctxt = this;
		if (ctxt.crashing || ctxt.stopping) {
			ctxt.sweetMessage({message: '-1000 points'});
			ctxt.score -= 1000;
		} else {
			ctxt.crashing = true;
			var dirName = ctxt.steerDirections[ctxt.direction];
			ctxt.boarder.gotoAndPlay(dirName + "-crash");
			ctxt.sweetMessage({message: 'Ouch! You Bit It!'});
		}
	},
	
	reflowUI: function() {
		var ctxt = this;
		var dim = ctxt.baseline; //ctxt.dimensions();
		
		var height_factor = ctxt.layout() == 'landscape' ? 12 : 6;
		var radius_factor = ctxt.layout() == 'landscape' ? 12 : 10;
		
		var touch_width = Math.min(dim.width - 30, 600);
		var touch_height = Math.round(dim.height / height_factor);
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
		
		if (where == ctxt.direction || ctxt.jumping || ctxt.crashing || ctxt.stopping) {
			return;
		}
		
		var dirName = ctxt.steerDirections[where];
		var speed = ctxt.steerSpeeds[dirName];
		
		//console.log(dirName);
		
		//ctxt.snowSound.stop();
		//ctxt.snowSound = createjs.Sound.play(speed.sound);
		ctxt.playSound(speed.sound);
		
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
		
		var framesPerDir = 31; //26;
		
		$.each(ctxt.steerDirections, function(i, d) {
			animations[d] = [(i * framesPerDir), (i * framesPerDir) + 7, d, 0.5];
			animations[d + '-jump'] = [(i * framesPerDir) + 8, (i * framesPerDir) + 18, d, 0.5];
			animations[d + '-crash'] = [(i * framesPerDir) + 19, (i * framesPerDir) + 30, false, 0.5];
			animations[d + '-twitch'] = [(i * framesPerDir) + 27, (i * framesPerDir) + 30, d + '-twitch', 0.7];
		});
		
		//$.each(ctxt.steerDirections, function(i, d) {
		//	animations[d] = [(i * framesPerDir), (i * framesPerDir) + 1, d, .01];
		//	animations[d + '-jump'] = [i * framesPerDir, (i * framesPerDir) + 12, d, 0.5];
		//	animations[d + '-crash'] = [(i * framesPerDir) + 13, (i * framesPerDir) + 25, false, 0.5];
		//	animations[d + '-twitch'] = [(i * framesPerDir) + 21, (i * framesPerDir) + 22, d + '-twitch', 0.5];
		//});
		
		//console.log(animations);
		
		ctxt.sprites.boarder = new createjs.SpriteSheet({
			"images": [ctxt.loader.getResult("boarder-small")],
			"frames": {"width": 128, "height": 256},
			"animations": animations
		});
		
		ctxt.boarder = new createjs.Sprite(ctxt.sprites.boarder, "straight");
		ctxt.boarder.on('animationend', function() {
			if (ctxt.crashing) {
				var dirName = ctxt.steerDirections[ctxt.direction];
				ctxt.boarder.gotoAndPlay(dirName + "-twitch");
				ctxt.stopping = true;
			}
			ctxt.jumping = false;
			ctxt.crashing = false;
		});
		ctxt.boarder.x = (ctxt.$game.width() / 2) - (ctxt.boarder.spriteSheet._frameWidth / 2);
		ctxt.boarder.y = (ctxt.$game.height() * ctxt.playerVertPositionFactor) - (ctxt.boarder.spriteSheet._frameHeight / 2);
        
		ctxt.boarder.framerate = 30;
		ctxt.stage.addChild(ctxt.boarder);
		//ctxt.between.addChild(ctxt.boarder);
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
		
		pool = pool.concat(ctxt.obstacles, ctxt.interactives, ctxt.props, ctxt.bonuses);
		
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
	
	getSpeedVector: function(options) {
		var ctxt = this;
		var dirName = ctxt.steerDirections[ctxt.direction];
		var dir = ctxt.steerSpeeds[dirName];
		var speed = (options !== undefined && typeof options.speed === "number" ? options.speed : ctxt.speed);
		var angle = (options !== undefined && typeof options.angle === "number" ? options.angle : dir.d);
		
		var rads = (((angle + 90)/360)*(2*Math.PI));
		var ret = {
			d: dir.d,
			r: rads,
			x: Math.sin(rads) * speed,
			y: Math.cos(rads) * speed,
		};
		
		return ret;
	},
	
	sweetMessage: function(o) {
		var ctxt = this;
		var opts = {
			message: "No message",
			x: ctxt.dimensions().width / 2,
			y: ctxt.boarder.y + 100,
			ms: 1500
		};
		
		opts = $.extend({}, opts, o);
		
		var $message = $('<span></span>');
		$message
			.addClass('sweetMessage')
			.hide()
			.appendTo(ctxt.$body)
			.html(opts.message);
						
		$message
			.show()
			.css({
				left: opts.x - ($message.width() / 2),
				top: opts.y - ($message.height() / 2)
			})
			.animate({
				top: '-=50px',
				left: '+=50px',
				fontSize: '+=20px',
				opacity: 0
			}, opts.ms, function() {
				$message.remove();
			});
	},
	
	addEntity: function(o) {
		var ctxt = this;
		var defaults = {
			obstacles: true,
			interactives: false,
			props: false,
			bonus: false
		};
		
		o = $.extend({}, defaults, o);
		
		var pool = [];
		
		if (o.obstacles) { pool = pool.concat(ctxt.obstacles); }
		if (o.interactives) { pool = pool.concat(ctxt.interactives); }
		if (o.props) { pool = pool.concat(ctxt.props); }
		if (o.bonus) { pool = pool.concat(ctxt.bonuses); }

		if (pool.length < 1) {
			return false;
		}
		
		
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
	
	spriteSorter: function(obj1, obj2, ctxt) {
		
		if (obj1 == ctxt.ground) {
			return -1
		} else if (obj2 == ctxt.ground) {
			return 1;
		}
		
		if (obj1.entity && obj1.entity.alwaysUnder) {
			return -1;
		} else if (obj2.entity && obj2.entity.alwaysUnder) {
			return 1;
		}
		
		if (obj1.y + obj1.tileH > ctxt.boarder.y + ctxt.boarder.spriteSheet._frameHeight) { return 1; }
		if (obj1.y + obj2.tileH  < ctxt.boarder.y + ctxt.boarder.spriteSheet._frameHeight) { return -1; }
		return 0;
	},
	
	doSorting: function() {
		var ctxt = this;
		ctxt.stage.sortChildren(function(a, b, o) { return ctxt.spriteSorter(a, b, ctxt); });
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
		ctxt.score += ctxt.crashing || ctxt.stopping ? 0 : distThisTick;
		ctxt.$score.html(parseInt(ctxt.score).commafy());

		var boarderBottomCenterX = ctxt.steerSpeeds[ctxt.steerDirections[ctxt.direction]].boardTip.x;
		var boarderBottomCenterY = ctxt.steerSpeeds[ctxt.steerDirections[ctxt.direction]].boardTip.y;
		var boarderPerpendicularLeft = ctxt.getSpeedVector({angle: ctxt.steerSpeeds[ctxt.steerDirections[ctxt.direction]].d + 90, speed: 10});
		var boarderPerpendicularRight = ctxt.getSpeedVector({angle: ctxt.steerSpeeds[ctxt.steerDirections[ctxt.direction]].d - 90, speed: 10});
		var boarderParallel = ctxt.getSpeedVector({speed: 4});
		var boarderFrontLeft = {
			x: boarderBottomCenterX + boarderPerpendicularLeft.x,
			y: boarderBottomCenterY + boarderPerpendicularLeft.y
		};
		var boarderFrontRight = {
			x: boarderBottomCenterX + boarderPerpendicularRight.x,
			y: boarderBottomCenterY + boarderPerpendicularRight.y
		};
		var boarderCollisionBox = {
			upperLeft: {
				x: boarderFrontLeft.x - boarderParallel.x,
				y: boarderFrontLeft.y - boarderParallel.y
			},
			upperRight: {
				x: boarderFrontRight.x + boarderParallel.x,
				y: boarderFrontRight.y - boarderParallel.y
			},
			lowerLeft: {
				x: boarderFrontLeft.x - boarderParallel.x,
				y: boarderFrontLeft.y + boarderParallel.y
			},
			lowerRight: {
				x: boarderFrontRight.x + boarderParallel.x,
				y: boarderFrontRight.y + boarderParallel.y
			}
		};

		var boarderPoints = [];
		boarderPoints.push(new Point2D(boarderCollisionBox.upperLeft.x, boarderCollisionBox.upperLeft.y));
		boarderPoints.push(new Point2D(boarderCollisionBox.upperRight.x, boarderCollisionBox.upperRight.y));
		boarderPoints.push(new Point2D(boarderCollisionBox.lowerRight.x, boarderCollisionBox.lowerRight.y));
		boarderPoints.push(new Point2D(boarderCollisionBox.lowerLeft.x, boarderCollisionBox.lowerLeft.y));
		boarderPoints.push(new Point2D(boarderCollisionBox.upperLeft.x, boarderCollisionBox.upperLeft.y)); //close the polygon

		if (ctxt.debug) {
			if (ctxt._drawnBoarderCollider !== undefined) {
				ctxt.stage.removeChild(ctxt._drawnBoarderCollider);
			}

			var graphics = new createjs.Graphics();
			graphics.setStrokeStyle(2);
			graphics.beginStroke("yellow");
			
			var orig = boarderPoints[0];
			var next;
			graphics.moveTo(orig.x, orig.y);
			for (var i = 1, l = boarderPoints.length; i < l; i++) {
				next = boarderPoints[i];
				graphics.lineTo(next.x, next.y);
			}

			ctxt._drawnBoarderCollider = ctxt.stage.addChild(new createjs.Shape(graphics));
		}

		// var boarder_pt1 = new Point2D(boarderBottomCenterX - speed.x, boarderBottomCenterY - speed.y);
		// var boarder_pt2 = new Point2D(boarderBottomCenterX, boarderBottomCenterY);
		
		var performSorting = false;
		
		ctxt.stage.setChildIndex(ctxt.ground, 0);
		
		for (var i = ctxt.movingElements.length - 1; i >= 0; i--) {
			var entity = ctxt.movingElements[i];
			var e = entity.sprite;
			//var e = entity.container;

			e.x += speed.x;
			e.y += speed.y;
			
			if (ctxt.debug) {
				entity.drawBounds();
			}
			
			if (entity.alwaysUnder) {
				ctxt.stage.setChildIndex(entity.container, 1);
			}

			if (e.y + entity.spriteSheet._frameHeight < -100) {
				entity.remove();
			} else if (e.y + entity.spriteSheet._frameHeight < ctxt.boarder.y + ctxt.boarder.spriteSheet._frameHeight && !entity.playerPassed) {
				ctxt.movingElements[i].playerPassed = true;
				performSorting = true;
			}
			
			entity.checkCollisionAgainst({points: boarderPoints});
			
		}
		
		if (performSorting) {
			ctxt.doSorting();
		}
		
		
		t = ctxt.distance;
		
		if (ctxt.stopping) {
			ctxt.speed -= .1;
			if (ctxt.speed <= 0) {
				ctxt.speed = 0;
				ctxt.stopSound();
				createjs.Ticker.setPaused(true);
				ctxt.gameEnded();
			}
		}
		
		if (t > 20) {
			var obst_delta = t - ctxt.lastObstAt;
			if (obst_delta >= ctxt.obstEvery) {
				ctxt.addEntity({interactives: false, obstacles: true, bonus: false});
				ctxt.lastObstAt = t;
			}
			
			var bonus_delta = t - ctxt.lastBonusAt;
			if (bonus_delta >= ctxt.bonusEvery) {
				ctxt.addEntity({interactives: false, obstacles: false, bonus: true});
				ctxt.lastBonusAt = t;
			}
			
			var inter_delta = t - ctxt.lastInterAt;
			if (inter_delta >= ctxt.interEvery) {
				ctxt.addEntity({interactives: true, obstacles: false, bonus: false});
				ctxt.lastInterAt = t;
			}
			
			if (ctxt.distance > ctxt.nextLevelAt) {
				//ctxt.nextLevelAt *= 2;
				//ctxt.level++;
				//ctxt.sweetMessage({message: "Level " + ctxt.level});
			}
		}
		
		//ctxt.reflowUI();
		ctxt.stage.update(event);
	},
	
	loadHighScores: function(o) {
		var ctxt = this;
		
		o = $.extend({}, o);
		//$('.popupPanel').hide();
		ctxt.$highScores.show();
		$.getJSON('/scores/list', function(data) {
			var $table = ctxt.$highScores.find('table > tbody');
			$table.empty();
			if (data.payload.length == 0) {
				data.payload.push({name: "No high scores", score: "", created: ""});
			}
			$.each(data.payload, function(idx, entry) {
				var dateObj = new Date(Date.parse(entry.created));
				var date = ctxt.month(dateObj.getMonth(), true) + ' ' + dateObj.getDate() + ', ' + dateObj.getFullYear();
				var $row = $('<tr class="hs-entry"><td class="hs-place">' + (idx + 1) + '</td><td class="hs-name">' + entry.name + '</td><td class="hs-score">' + entry.score.commafy() + '</td><td class="hs-data">' + date + "</tr>");
				$table.append($row);
			});
			
			if (typeof o.after === 'function') {
				o.after();
			}
			
		});
	},
	
	gameEnded: function() {
		var ctxt = this;
		ctxt.$submitScore.show();
		
		ctxt.$submitScoreOpener.click();
		
		ctxt.$submitHighScore.on('click', function(e) {
			var name = ctxt.$highScoreName.val().trim();
			if (localStorage) {
				localStorage.highScoreName = name;
			}
			if (name.length > 0) {
				var payload = {name: name, score: parseInt(ctxt.score)}
				$.post('/scores/submit', payload, function(data) {
					if (data.success) {
						//var magnificPopup = $.magnificPopup.instance; 
						//magnificPopup.close();
						ctxt.loadHighScores({
							after: function() { ctxt.$highScoreOpener.click(); }
						});
					}
				}, 'json');
			}
		});
	},
	
	_xyz: null
});



var game = new GAME();
