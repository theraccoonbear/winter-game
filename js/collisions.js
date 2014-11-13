/* jshint quotmark:false, strict:false, eqeqeq:false */
/* global Class, Intersection */
var CollisionTarget = Class.extend({
	points: [],
	action: null,
	enabled: true,
	disables: [],
	name: 'unnamed',
	
	constructor: function(options) {
		var ctxt = this;
		for (var p in options) {
			this[p] = options[p];
		}
	},
	
	addPoint: function(pt) {
		var ctxt = this;
		
		ctxt.points.push(pt);
	},
	
	drawCollider: function(o) {
		var ctxt = this;
		var entity = o.entity;
		
		var graphics = new createjs.Graphics();
		graphics.setStrokeStyle(1);
		graphics.beginStroke("red");
		
		
		var orig = ctxt.points[0].add(new Point2D(parseFloat(entity.sprite.x), parseFloat(entity.sprite.y)))
		var next;
		graphics.moveTo(orig.x, orig.y);
		for (var i = 1, l = ctxt.points.length; i < l; i++) {
			next = ctxt.points[i].add(new Point2D(parseFloat(entity.sprite.x), parseFloat(entity.sprite.y)))
			graphics.lineTo(next.x, next.y);
		}
		
		return graphics;
		
		//graphics.moveTo(50,(dataList[this.index].magnitude)*100); 
		//graphics.lineTo(50,(dataList[(this.index)++].magnitude)*100);
		
		//createjs.Shape.call(this, graphics);
		
		//this.tick = function() {
		//graphics.moveTo(100,(dataList[this.index].magnitude)*100); 
		//graphics.lineTo(100,(dataList[(this.index)++].magnitude)*100);
		//stage.addChild(graphics);
		//};
	},
	
	checkCollision: function(params) {
		var ctxt = this;
		var pt1 = params.pt1;
		var pt2 = params.pt2;
		var entity = params.entity;
		var result;
		var numPoints = ctxt.points.length;
		var transformedPoints = [];
		var i;

		if (!ctxt.enabled) {
			return;
		}
		
		for (i = 0; i < numPoints; i++) {
			transformedPoints.push(ctxt.points[i].add(new Point2D(parseFloat(entity.sprite.x), parseFloat(entity.sprite.y))));
		}

		result = Intersection.intersectLinePolygon(pt1, pt2, transformedPoints);
		if (result.status !== 'No Intersection') {
			for (var i = 0, l = ctxt.disables.length; i < l; i++) {
				var name = ctxt.disables[i];
				var col = entity.getColliderByName({name: name});
				if (col !== false) {
					console.log('disabled collider: ' + name);
					col.enabled = false;
				}
			}

			if (typeof ctxt.action === "function") {
				ctxt.action();
			}
		}
	},
	
	_xyz: null
}); // class Collider