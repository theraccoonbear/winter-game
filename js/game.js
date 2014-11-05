var GAME = Class.extend({
	lastItemAt: 0,
	
	obstFreq: 250,
	lastFreqIncrease: 0,
	obstacles: [],
	score: 0,
	lastTrack: 0,
	level: 0,
	tickRate: 100,
	
	constructor: function() {
		var ctxt = this;
		ctxt.$game = $('#game');
		ctxt.$gameOver = $('#gameOver');
		ctxt.$scoreBox = $('#scoreBox');
		ctxt.$score = $('#score');
		ctxt.$level = $('#level');
		ctxt.$message = $('#message');
		
		ctxt.$window = $(window);
		
		ctxt.player = new PLAYER({
			x: Math.floor(ctxt.$window.width() / 2),
			y: Math.floor(ctxt.$window.height() / 2)
		});

		ctxt.centerElem(ctxt.$gameOver, true, true);
		ctxt.centerElem(ctxt.$scoreBox, true, false);
		ctxt.centerElem(ctxt.$message, true, true);
		
		ctxt.$game.append(ctxt.player.$elem);
		
		ctxt.start();
		
		$(document).on('keydown', function(e) {
			//console.log(e.which);
			if (e.which == 37) {
				ctxt.player.setDir('left');
			} else if (e.which == 39) {
				ctxt.player.setDir('right');
			}
		});
		
	},
	
	showMessage: function(m, dur) {
		var ctxt = this;
		dur = typeof dur === 'undefined' ? 1500 : dur;
		ctxt.$message.html(m).show().fadeOut(dur);
	},
	
	centerElem: function(e, x, y) {
		var ctxt = this;
		x = x === true;
		y = y === true;
		
		var $e = $(e);
		
		if (x) {
			$e.css({
				left: Math.floor(ctxt.$window.width() / 2) - Math.floor($e.width() / 2)
			});
		}
		
		if (y) {
			$e.css({
				top: Math.floor(ctxt.$window.height() / 2) - Math.floor($e.height() / 2)
			});
		}
		
	},
	
	start: function() {
		var ctxt = this;
		
		ctxt.$game.focus();
		
		ctxt.tickInt = setInterval(function() {
			var t = (new Date()).getTime();
			var delta = t - ctxt.lastItemAt
			
			if (delta > ctxt.obstFreq) {
				ctxt.addObstacle();
				ctxt.lastItemAt = t;
			}
			
			var trackDelta = t - ctxt.lastTrack;
			if (trackDelta > 250) {
				ctxt.addTrack();
			}
			
			
			ctxt.score += 10;
			ctxt.$score.html(ctxt.score);
			
			if (t - ctxt.lastFreqIncrease > 30000) {
				ctxt.showMessage("Level " + ++ctxt.level);
				ctxt.$level.html(ctxt.level);
				ctxt.lastFreqIncrease = t;
				ctxt.obstFreq *= .9;
			}
			
			ctxt.animate();
			
		}, ctxt.tickRate);
	},
	
	animate: function() {
		var ctxt = this;
		var toRm = [];
		
		var xDelta = ctxt.player.direction === 'left' ? 15 : -15;
		
		$.each(ctxt.obstacles, function(i, e) {
			var $e = e.$elem;
			e.y -= ctxt.player.speed;
			if (e.y < 0) {
				toRm.push(i);
			}
			
			e.x += xDelta;
			
			if (e.collidable) {
				if (ctxt.checkCollision(e)) {
					if (typeof e.action === 'function') {
						e.action(ctxt);
					}
					
					if (e.fatal) {
						clearInterval(ctxt.tickInt);
						ctxt.$gameOver.fadeIn(1000);
					}
				}
			}
			
			
			
			$e.css({
				top: e.y,
				left: e.x
			});
		});
		
		$.each(toRm.reverse(), function(i, eIdx) {
			var item = ctxt.obstacles[eIdx];
			item.$elem.remove();
			ctxt.obstacles.splice(eIdx, 1);
		});
		
	},
	
	checkCollision: function(e) {
		var ctxt = this;
		var p = ctxt.player;
		
		var pCenter = {
			x: (p.x + Math.floor(p.$elem.width() / 2)),
			y: (p.y + Math.floor(p.$elem.height() / 2)),
		};
		
		var eCenter = {
			x: (e.x + Math.floor(e.$elem.width() / 2)),
			y: (e.y + Math.floor(e.$elem.height() / 2)),
		};
		
		var dist = Math.sqrt(Math.pow(Math.abs(eCenter.x - pCenter.x), 2) + Math.pow(Math.abs(eCenter.y - pCenter.y), 2));
	
		return dist < p.$elem.width();
		
	},
	
	rand: function(dim) {
		var ctxt = this;
		var val = 0;
		if (dim.toLowerCase() === 'w') {
			val = Math.ceil(Math.random() * ctxt.$window.width());
		} else {
			val = Math.ceil(Math.random() * ctxt.$window.height());
		}
		return val;
	},
	
	maxDim: function(dim) {
		var ctxt = this;
		var val = 0;
		
		if (dim.toLowerCase() === 'w') {
			val = ctxt.$window.width();
		} else {
			val = ctxt.$window.height();
		}
		
		return val;
	},
	
	addTrack: function() {
		var ctxt = this;
		var p = ctxt.player;
		var track = new TRACK({
			direction: p.direction,
			x: p.x,
			y: p.y + 10
		});
		
		ctxt.$game.append(track.$elem);
		ctxt.obstacles.push(track);	
	},
	
	addObstacle: function(type) {
		var ctxt = this;
		var itemType = Math.ceil(Math.random() * 4);
		var $item = null;
		var opts = {x: ctxt.rand('w'), y: ctxt.maxDim('h')};
		switch (itemType) {
			case 1:
				item = new ROCK(opts);
				break;
			case 2:
				item = new BUSH(opts);
				break;
			case 3:
				item = new TREE(opts);
				break;
			case 4:
				item = new GATE(opts);
				break;
			
		}
		
		ctxt.$game.append(item.$elem);
		ctxt.obstacles.push(item);
	},
	
	_xyz: null
});

var SPRITE = Class.extend({
	x: 0,
	y: 0,
	collidable: true,
	fatal: true,
	action: false,
	tall: false,
	
	$elem: null,
	
	constructor: function(o) {
		var ctxt = this;
		$.extend(this, o);
		ctxt.$elem = $('<div></div>');
		ctxt.$elem.addClass('sprite');
	},
	
	_xyz: null
});

var PLAYER = SPRITE.extend({
	direction: 'left',
	speed: 20,
	
	constructor: function(o) {
		var ctxt = this;
		
		
		PLAYER.super.constructor.call(this, o);
		
		this.collidable = false;
		this.fatal = false;
		
		ctxt.$elem
			.addClass('player left')
			.css({
				left: ctxt.x,
				top: ctxt.y
			});
		
		ctxt.animInt = setInterval(function() {
			ctxt.$elem.toggleClass('step2');
		}, 1000);
	},
	
	setDir: function(newDir) {
		var ctxt = this;
		newDir = newDir.toLowerCase();
		if (newDir == 'left') {
			ctxt.direction = 'left';
			ctxt.$elem.removeClass('right').addClass('left');
		} else {
			ctxt.direction = 'right';
			ctxt.$elem.removeClass('left').addClass('right');
		}
	},
	
	_xyz: null
});

var ROCK = SPRITE.extend({
	constructor: function(o) {
		var ctxt = this;
		ROCK.super.constructor.call(this, o);
		ctxt.$elem
			.addClass('rock')
			.css({
				left: ctxt.x,
				top: ctxt.y
			});
	},
	
	_xyz: null
});

var GATE = SPRITE.extend({
	
	constructor: function(o) {
		var ctxt = this;
		
		GATE.super.constructor.call(this, o);
		
		this.fatal = false;
		this.action = function(game) {
			game.score += 1000;
			game.showMessage('Bonus 1000 Points!');
			ctxt.action = false;
		};
		
		ctxt.$elem
			.addClass('gate')
			.css({
				left: ctxt.x,
				top: ctxt.y
			});
	},
	
	_xyz: null
});

var BUSH = SPRITE.extend({
	constructor: function(o) {
		var ctxt = this;
		BUSH.super.constructor.call(this, o);
		
		ctxt.$elem
			.addClass('bush')
			.css({
				left: ctxt.x,
				top: ctxt.y
			});
	},
	
	_xyz: null
});

var TREE = SPRITE.extend({
	constructor: function(o) {
		var ctxt = this;
		TREE.super.constructor.call(this, o);
		
		ctxt.$elem
			.addClass('tree tall')
			.css({
				left: ctxt.x,
				top: ctxt.y
			});
	},
	
	_xyz: null
});

var TRACK = SPRITE.extend({
	direction: 'left',
	
	constructor: function(o) {
		var ctxt = this;
		TRACK.super.constructor.call(this, o);
		
		ctxt.collidable = false;
		ctxt.fatal = false;
		ctxt.direction = o.direction == 'left' ? 'left' : 'right';
		
		
		ctxt.$elem
			.addClass('track ' + ctxt.direction)
			.css({
				left: ctxt.x,
				top: ctxt.y
			});
	},
	
	_xyz: null
});


var game = new GAME();