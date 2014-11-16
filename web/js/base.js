var BASE = Class.extend({
	baseline: {
		width: 1366,
		height: 768
	},
	
	constructor: function(options) {
		
		
		for (var p in options) {
			this[p] = options[p];
		}
		
		var ctxt = this;
		
		ctxt.helpers();
	},
	
	isTouchDevice: function() {
		return 'ontouchstart' in document.documentElement;
	},
	
	helpers: function() {
		String.prototype.commafy = function () {
			return this.replace(/(^|[^\w.])(\d{4,})/g, function($0, $1, $2) {
				return $1 + $2.replace(/\d(?=(?:\d\d\d)+(?!\d))/g, "$&,");
			});
		}
		
		Number.prototype.commafy = function () {
			return String(this).commafy();
		}
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
		
		$('[id]').each(function(i, e) {
			var $e = $(e);
			var id = $e.attr('id');
			if (!ctxt['$' + id]) {
				ctxt['$' + id] = $e;
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
	
	base64ArrayBuffer: function(arrayBuffer) {
		var base64    = ''
		var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
	 
		var bytes         = new Uint8Array(arrayBuffer)
		var byteLength    = bytes.byteLength
		var byteRemainder = byteLength % 3
		var mainLength    = byteLength - byteRemainder
	 
		var a, b, c, d
		var chunk
	 
		// Main loop deals with bytes in chunks of 3
		for (var i = 0; i < mainLength; i = i + 3) {
			// Combine the three bytes into a single integer
			chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2]
	 
			// Use bitmasks to extract 6-bit segments from the triplet
			a = (chunk & 16515072) >> 18 // 16515072 = (2^6 - 1) << 18
			b = (chunk & 258048)   >> 12 // 258048   = (2^6 - 1) << 12
			c = (chunk & 4032)     >>  6 // 4032     = (2^6 - 1) << 6
			d = chunk & 63               // 63       = 2^6 - 1
	 
			// Convert the raw binary segments to the appropriate ASCII encoding
			base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d]
		}
	 
		// Deal with the remaining bytes and padding
		if (byteRemainder == 1) {
			chunk = bytes[mainLength]
	 
			a = (chunk & 252) >> 2 // 252 = (2^6 - 1) << 2
	 
			// Set the 4 least significant bits to zero
			b = (chunk & 3)   << 4 // 3   = 2^2 - 1
	 
			base64 += encodings[a] + encodings[b] + '=='
		} else if (byteRemainder == 2) {
			chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1]
	 
			a = (chunk & 64512) >> 10 // 64512 = (2^6 - 1) << 10
			b = (chunk & 1008)  >>  4 // 1008  = (2^6 - 1) << 4
	 
			// Set the 2 least significant bits to zero
			c = (chunk & 15)    <<  2 // 15    = 2^4 - 1
	 
			base64 += encodings[a] + encodings[b] + encodings[c] + '='
		}
		
		return base64
	},
	
	_xyz: null
});