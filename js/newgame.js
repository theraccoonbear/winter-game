var BASE = Class.extend({
	
	constructor: function(o) {
		var ctxt = this;
		//ctxt.touchHandling();
		//ctxt.tiltHandling();
	},
	
	isTouchDevice: function() {
		return 'ontouchstart' in document.documentElement;
	},
	
	touchHandling: function() {
		var ctxt = this;
		
		$.each(ctxt.touchTargets, function(i, sel) {
			$(sel).on('touchstart', function(e) {
				ctxt._touch(e, sel);
			}).on('touchmove', function(e) {
				ctxt._touch(e, sel);
			}).on('touchend', function(e) {
				ctxt._touch(e, sel);
			});
		});
		//$('body').on('ontouchstart', function(e) {
		//	ctxt._touch(e);
		//});
	},
	
	_touch: function(e, sel) {
		var ctxt = this;
		if (typeof ctxt.touch === 'function') {
			if (e.type == 'touchmove') {
				e.touchX = e.originalEvent.touches[0].pageX;
				e.touchY = e.originalEvent.touches[0].pageY;
			} else {
				e.touchX = 0;
				e.touchY = 0;
			}
			
			ctxt.touch(e, sel);
		}
	},
	
	tiltHandling: function() {
		var ctxt = this;
		
		if (window.DeviceOrientationEvent) {
			window.addEventListener("deviceorientation", function () {
				ctxt._tilt({roll: event.beta, pitch: event.gamma});
			}, true);
		} else if (window.DeviceMotionEvent) {
			window.addEventListener('devicemotion', function () {
				ctxt._tilt({roll: event.acceleration.x * 2, pitch: event.acceleration.y * 2});
			}, true);
		} else {
			window.addEventListener("MozOrientation", function () {
				ctxt._tilt({roll: orientation.x * 50, pitch: orientation.y * 50});
			}, true);
		}
	},
	
	_tilt: function(o) {
		var ctxt = this;
		if (typeof ctxt.tilt === 'function') {
			ctxt.tilt(o);
		}
	},
	
	dimensions: function() {
		return {
			width: Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
			height: Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
		};
	},
	
	hook: function()  {
		var ctxt = this;
		$.each(ctxt.toHook, function(i, s) {
			if (s == window) {
				ctxt.$window = $(window);
			} else if (s == document) {
				ctxt.$document = $(document);
			} else {
				ctxt['$' + s.replace(/^[#\.]/, '')] = $(s);
			}
		});
		
		ctxt.$debug = $('#debug');
	},
	
	layout: function() {
		var ctxt = this;
		var dim = ctxt.dimensions();
		return dim.width > dim.height ? 'landscape' : 'portrait';
	},
	
	centerElem: function(e, x, y) {
		var ctxt = this;
		x = x === true;
		y = y === true;
		
		var $e = $(e);
		
		var d = ctxt.dimensions();
		
		if (x) {
			$e.css({
				left: Math.floor(d.width / 2) - Math.floor($e.outerWidth(true) / 2)
			});
		}
		
		if (y) {
			$e.css({
				top: Math.floor(d.height / 2) - Math.floor($e.outerHeight(true) / 2)
			});
		}
		
	},
	
	_xyz: null
});

var GAME = BASE.extend({
	toHook: [
		'#gameArea', '#game', '#touchSteer', window, 'body', '#preloader', '#spinner'
	],
	
	touchTargets: ['#touchSteer'],
	
	manifest: [
		{src:"images/boarder-sm.png", id:"boarder"},
		{src:"images/obstacles/bush.png", id:"bush"},
		{src:"images/obstacles/tree.png", id:"tree"},
		{src:"images/obstacles/rock.png", id:"rock"},
		{src:"images/obstacles/fire.gif", id:"fire"},
		{src:"images/bonuses/coin.gif", id:"coin"},
		{src:"images/bonuses/gate.png", id:"gate"}
	],

	sprites: {},
	
	obstacles: ['bush', 'tree', 'rock', 'fire'],
	
	bonuses: ['gate', 'coin'],
	
	steerDirections: ['left3', 'left2', 'left1', 'straight', 'right1', 'right2', 'right3'],
	direction: 3,
	stage: null,
	width: 0,
	height: 0,
	
	constructor: function(o) {
		var ctxt = this;
		
		GAME.super.constructor.call(this, o);
		
		ctxt.hook();
		
		ctxt.centerElem(ctxt.$spinner, true, true);
		
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
		
		
		
		loader = new createjs.LoadQueue();
		loader.addEventListener("complete", function() { ctxt.init(); });
		loader.loadManifest(ctxt.manifest);
	},
	
	init: function() {
		var ctxt = this;
		var d = ctxt.dimensions();
		
		ctxt.$game.css({
			left: ((d.width / 2) - (ctxt.width / 2)),
			top: ((d.height / 2) - (ctxt.height / 2))
		});
		
		ctxt.centerElem(ctxt.$touchSteer, true, false);
		
		
		createjs.Ticker.timingMode = createjs.Ticker.RAF;
		createjs.Ticker.addEventListener("tick", function(event) { ctxt.tick(event); });
		
		ctxt.initControls();
		ctxt.initBoarder();
		
		ctxt.reflowUI();
		ctxt.$preloader.fadeOut(250);
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
		var font_size = Math.round(touch_height * .9);
		
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
			
		ctxt.centerElem(ctxt.$spinner, true, true);
		
		ctxt.centerElem(ctxt.$touchSteer, true, false);
		ctxt.boarder.x = (ctxt.width / 2) - (ctxt.boarder.spriteSheet._frameWidth / 2);
		ctxt.boarder.y = (ctxt.height / 2) - (ctxt.boarder.spriteSheet._frameHeight / 2);
		
	},
	
	tilt: function(o) {
		var ctxt = this;
		//console.log(ctxt.layout(), o);
	
		return;
	
		var steerAxis = ctxt.layout() === 'landscape' ? o.roll : o.pitch;
		
		if (steerAxis == null) {
			return;
		}
		
		var steerMap = {
			6: [-1000, -15],
			5: [-15, -10],
			4: [-10, -5],
			3: [-5, 5],
			2: [5, 10],
			1: [10, 15],
			0: [15, 1000]
		};
		
		var newDir = 3;
		$.each(steerMap, function(idx, range) {
			if (steerAxis >= range[0] && steerAxis < range[1]) {
				newDir = idx;
			}
		});
		
		ctxt.steerAbs(newDir);;
	},
	
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
		
		ctxt.boarder.gotoAndPlay(ctxt.steerDirections[ctxt.direction]);
	},
	
	initBoarder: function() {
		var ctxt = this;
		
		ctxt.sprites.boarder = new createjs.SpriteSheet({
			"images": [loader.getResult("boarder")],
			"frames": {"height": 191, "width": 150},
			// define two animations, run (loops, 1.5x speed) and jump (returns to run):
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
		ctxt.boarder.y = (ctxt.height / 2) - (ctxt.boarder.spriteSheet._frameHeight / 2);
		ctxt.boarder.framerate = 30;
		ctxt.stage.addChild(ctxt.boarder);
	},
	
	
	tick: function(event) {
		var ctxt = this;
		ctxt.stage.update(event);
	},
	
	
	_xyz: null
});



var game = new GAME();