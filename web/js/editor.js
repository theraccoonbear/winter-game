var Editor = BASE.extend({
	game: null,
	prevCont: false,
	previewEnt: false,
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
		
		var base_w = ctxt.entities[val].prototype.width;
		var base_h = ctxt.entities[val].prototype.height;
		var w = ((base_w || 10) + 4) * s.x;
		var h = ((base_h || 10) + 4) * s.y;
		var imageID = ctxt.entities[val].prototype.imageID;
		
		ctxt.$entBounds.css({
			width: w,
			height: h,
		}).data('width', w).data('height', h).data('id', val)	;
		
		var pos = ctxt.$entBounds.position();
		
		ctxt.spriteSheet = new createjs.SpriteSheet({
			"images": [ctxt.game.loader.getResult(imageID)],
			"frames": {"width": base_w, "height": base_h},
			"animations": {
				"default": [0]
			}
		});
		
		if (ctxt.previewEnt !== false) {
			ctxt.prevCont.removeChild(ctxt.previewEnt);
		}
		
		ctxt.previewEnt = new createjs.Sprite(ctxt.spriteSheet, "default");
		ctxt.previewEnt.x = 0;
		ctxt.previewEnt.y = 0;
		ctxt.prevCont.addChild(ctxt.previewEnt);
		
		//ctxt.previewEnt = ctxt.game.addEntity({
		//	id: ctxt.$entBounds.data('id'),
		//	autoPlace: false,
		//	x: pos.left,
		//	y: pos.top
		//});
		
		//ctxt.prevCont.addChild(ctxt.previewEnt);
		
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
		
		ctxt.updateCoords();
		
		//ctxt.previewEnt.scaleX = ctxt.game.stage.scaleX;
		//ctxt.previewEnt.scaleY = ctxt.game.stage.scaleY;
		ctxt.previewEnt.x = (l - $c.position().left) / ctxt.game.stage.scaleX;
		ctxt.previewEnt.y = (t - $c.position().top) / ctxt.game.stage.scaleY;
		
	},
	
	getPos: function() {
		var ctxt = this;
		
		var pos = ctxt.$entBounds.position();
		var gp = ctxt.game.$game.position();
		var gwh = {
			w: ctxt.game.$game.width(),
			h: ctxt.game.$game.height(),
		}
		
		pos.left = ((pos.left - gp.left) / gwh.w) * ctxt.game.baseline.width;
		pos.top = ((pos.top - gp.top) / gwh.h) * ctxt.game.baseline.height;
		
		var ent_opts = {
			x: pos.left,
			y: pos.top,
			hill_x: ctxt.game.hill_x + pos.left,
			hill_y: ctxt.game.hill_y + pos.top
		};
		
		return ent_opts;
	},
	
	updateCoords: function() {
		var ctxt = this;
		var pos = ctxt.getPos();
		ctxt.$coords.html('x = ' + pos.hill_x.toFixed(0).commafy() + ' ::: y = ' + pos.hill_y.toFixed(0).commafy());
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
		//console.log(JSON.stringify(ctxt.level, false, 2))
		localStorage.currentLevel = JSON.stringify(ctxt.level, false, 2);
		ctxt.$json.val(localStorage.currentLevel);
		
		ctxt.game.addEntity({
			id: id,
			x: pos.left,
			y: pos.top
		});
		
		var mm = ctxt.level.reduce(function(p, c) {
			var n = p;
			n.min_x = Math.min(n.min_x, c.hill_x)
			n.max_x = Math.max(n.max_x, c.hill_x)
			n.min_y = Math.min(n.min_y, c.hill_y)
			n.max_y = Math.max(n.max_y, c.hill_y)
			return n;
		}, {
			min_x: 0,
			max_x: 0,
			min_y: 0,
			max_y: 0
		});
		
		console.log(mm);
		
		ctxt.game.stage.update();
		
	},
	
	setup: function() {
		var ctxt = this;
		
		ctxt.prevCont = new createjs.Container();
		ctxt.game.stage.addChild(ctxt.prevCont);
		
		ctxt.$coords = $('<div></div>');
		
		ctxt.$palette = $('<select></select>');
		ctxt.$palLbl = $('<label></label>');
		ctxt.$palLbl
			.html('Entity:<br>')
			.append(ctxt.$palette);
		
		$.each(ctxt.entities, function(k, e) {
			var $opt = $('<option></option>');
			$opt.val(k).html(e.prototype.name);
			ctxt.$palette.append($opt);
		});
		
		ctxt.$json = $('<textarea></textarea>');
		ctxt.$json.addClass('jsonOut').val('[]');
		
		ctxt.$panel = $('<div></div>');
		ctxt.$panel
			.addClass('editPanel')
			.append(ctxt.$palLbl)
			.append(ctxt.$coords)
			.append(ctxt.$json)
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
					var pos = ctxt.game.$game.position();
					var edges = {
						left:pos.left,
						right: pos.left + ctxt.game.$game.width(),
						top: pos.top,
						bottom: pos.top + ctxt.game.$game.height()
					}
					
					//console.log(e.clientX + ', ' + e.clientY, pos.left + ' <=> ' + (pos.left + parseFloat(ctxt.game.$game.width())));
					if (e.clientX >= edges.left && e.clientX <= edges.right && e.clientY >= edges.top && e.clientY <= edges.bottom) {
						ctxt.addEntity();
					}
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
		ctxt.coordInt = setInterval(function() {
			ctxt.updateCoords();
		}, 100);
		
	},
	
	end: function() {
		var ctxt = this;
		
		ctxt.jqem('hide');
		
		ctxt.editing = false;
		
		if (ctxt.previewEnt !== false) {
			ctxt.prevCont.removeChild(ctxt.previewEnt);
		}
		
		ctxt.game.speed = ctxt.game.initSpeed;
		clearInterval(ctxt.coordInt);
		
		
	},
	
	_xyz: null
});

