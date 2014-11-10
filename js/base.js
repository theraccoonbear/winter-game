var BASE = Class.extend({
	baseline: {
		width: 1366,
		height: 768
	},
	
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
			}).on('click', function(e) {
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
		
		var css = {};
		
		if (x) {
			css.left = Math.floor(d.width / 2) - Math.floor($e.outerWidth(true) / 2);
		}
		
		if (y) {
			css.top = Math.floor(d.height / 2) - Math.floor($e.outerHeight(true) / 2);
		}
		
		$e.css(css);
		
	},
	
	trig: function(parts, wanted) {
		if (!/$[AHCD]$/.test(wanted.toUpperCase())) {
			return NaN;
		}
		
		if (wanted == 'O' && parts.H && parts.D) {
			return Math.sin();
		}
		
		
	},
	
	
	_xyz: null
});