var Editor = BASE.extend({
	game: null,
	edCont: null,
	entities: {},
	editing: false,
	level: [],
	
	constructor: function Editor(options) {
		var ctxt = this;
		
		Editor.super.constructor.call(this, options);
		
		ctxt.enumEntities();
		ctxt.setup();
	},
	
	enumEntities: function() {
		var ctxt = this;
		
		for (var p in window) {
			if (typeof window[p] === 'function' && typeof window[p].prototype !== 'undefined' && window[p].prototype._isConcreteClass === true) {
				//console.log(p, typeof window[p]);
				//console.log(p, ' = ', typeof window[p].prototype.initSprite);
				ctxt.entities[window[p].prototype.id] = window[p];
			}
		}
	},
	
	scales: function() {
		var ctxt = this;
		return {
			x: ctxt.game.stage.scaleX,
			y: ctxt.game.stage.scaleY
		};
	},
	
	setActiveElem: function(id) {
		var ctxt = this;
		var val = typeof id === 'undefined' ? ctxt.$palette.find(':selected').val() : id;
		
		var s = ctxt.scales();
		
		var w = ((ctxt.entities[val].prototype.width || 10) + 4) * s.x;
		var h = ((ctxt.entities[val].prototype.height || 10) + 4) * s.y;
		
		
		ctxt.$entBounds.css({
			width: w,
			height: h,
		}).data('width', w).data('height', h).data('id', val)	;
	},
	
	moveEntBox: function(e) {
		var ctxt = this;
		var w = ctxt.$entBounds.data('width');
		var h = ctxt.$entBounds.data('height');
		var l = parseInt(e.clientX) - (w / 2);
		var t = parseInt(e.clientY) - (h / 2);
		
		var $c = ctxt.game.$game;
		
		if (l < $c.position().left) {
			l = $c.position().left;
		}
		
		if (t < $c.position().top) {
			t = $c.position().top;
		}
		
		if (l + w > $c.position().left + $c.width()) {
			l = $c.position().left + $c.width() - w;
		}
		
		if (t + h > $c.position().top + $c.height()) {
			t = $c.position().top + $c.height() - h;
		}
		
		
		ctxt.$entBounds.css({
			left: l,
			top: t
		});
	},
	
	addEntity: function() {
		var ctxt = this;
		
		var pos = ctxt.$entBounds.position();
		var gp = ctxt.game.$game.position();
		var gwh = {
			w: ctxt.game.$game.width(),
			h: ctxt.game.$game.height(),
		}
		var id = ctxt.$entBounds.data('id');
		var s = ctxt.scales();
		
		pos.left = ((pos.left - gp.left) / gwh.w) * ctxt.game.baseline.width;
		pos.top = ((pos.top - gp.top) / gwh.h) * ctxt.game.baseline.height;
		
		var ent_opts = {
			id: id,
			x: pos.left,
			y: pos.top,
			hill_x: ctxt.game.hill_x + pos.left,
			hill_y: ctxt.game.hill_y + pos.top
		};
		
		ctxt.level.push(ent_opts);
		console.log(JSON.stringify(ctxt.level, false, 2))
		localStorage.currentLevel = JSON.stringify(ctxt.level, false, 2);
		
		ctxt.game.addEntity({
			id: id,
			x: pos.left,
			y: pos.top
		});
		
		ctxt.game.stage.update();
		
	},
	
	setup: function() {
		var ctxt = this;
		
		ctxt.edCont = new createjs.Container();
			
		ctxt.$palette = $('<select></select>');
		
		$.each(ctxt.entities, function(k, e) {
			var $opt = $('<option></option>');
			$opt.val(k).html(e.prototype.name);
			ctxt.$palette.append($opt);
		});
		
		
		
		ctxt.$panel = $('<div></div>');
		ctxt.$panel
			.addClass('editPanel')
			.append(ctxt.$palette)
			.appendTo('body');
			
		ctxt.$entBounds = $('<div></div>');
		ctxt.$entBounds
			.addClass('entityBoundingBox')
			.appendTo('body');
			
			
			
		ctxt.$palette.on('change', function(e) {
			ctxt.setActiveElem();
		});
		
		ctxt.setActiveElem();
		
		
		ctxt.$totalOverlay = $('<div></div>');
		ctxt.$totalOverlay
			.addClass('totalOverlay')
			.appendTo('body')
			.on({
				mousemove: function(e) {
					ctxt.moveEntBox(e);
				},
			
				click: function(e) {
					ctxt.addEntity();
				}
			});
			
		$(window).resize(function(e) {
			ctxt.setActiveElem();
		});
		
	},
	
	jqem: function(call) {
		var ctxt = this;
		for (var p in ctxt) {
			if (p.charAt(0) == '$') {
				ctxt[p][call]();
			}
		}
	},
	
	begin: function() {
		var ctxt = this;
		
		
		ctxt.jqem('show');
		
		ctxt.editing = true;
		ctxt.game.speed = 0;
	},
	
	end: function() {
		var ctxt = this;
		
		ctxt.jqem('hide');
		
		ctxt.editing = false;
		
		ctxt.game.speed = ctxt.game.initSpeed;
		
		
		
	},
	
	_xyz: null
});

