var GAME = Class.extend({
	constructor: function() {
		var ctxt = this;
		
		ctxt.$body = $('body');
		ctxt.$game = $('#game');
		
		ctxt.boarder = new BOARDER();
		
		ctxt.$game.append(ctxt.boarder.$elem);
		
		$(document).on('keydown', function(e) {
			if (e.which == 37) {
				ctxt.boarder.steerTo('left');
			} else if (e.which == 39) {
				ctxt.boarder.steerTo('right');
			}
		});
		
	},
});


var BOARDER = Class.extend({
	steer: 0,
	
	constructor: function() {
		var ctxt = this;
		
		ctxt.$elem = $('<div></div>');
		
		ctxt.$elem
			.addClass('boarder')
			.attr('data-steer', ctxt.steer);
	},
	
	steerTo: function(dir) {
		var ctxt = this;
		dir = dir === 'left' ? 'left' : 'right';
		
		if (dir === 'left') {
			if (ctxt.steer < 3) { ctxt.steer++; }
		} else {
			if (ctxt.steer > -3) { ctxt.steer--; }
		}
		
		ctxt.$elem.attr('data-steer', ctxt.steer);
		
	},
	
	_xyz: null
});


var game = new GAME();