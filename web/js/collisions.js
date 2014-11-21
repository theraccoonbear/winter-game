/* jshint quotmark:false, strict:false, eqeqeq:false */
/* global createjs, Class, Intersection, Point2D */
var CollisionTarget = Class.extend({
	points: [],
	action: null,
	jumpAction: null,
	enabled: true,
	enables: [],
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
		
		var def = {
			graphics: new createjs.Graphics(),
			color: 'red',
		};
		
		//console.log('drawing ' + ctxt.name);
		
		o = $.extend({}, def, o);
		var entity = o.entity;
		
		var graphics = o.graphics;
		graphics.setStrokeStyle(2);
		graphics.beginStroke(o.color);
		
		var container = new createjs.Container();
		
		
		var orig = ctxt.points[0].add(new Point2D(parseFloat(entity.sprite.x), parseFloat(entity.sprite.y)));
		var next;
		graphics.moveTo(orig.x, orig.y);
		for (var i = 1, l = ctxt.points.length; i < l; i++) {
			next = ctxt.points[i].add(new Point2D(parseFloat(entity.sprite.x), parseFloat(entity.sprite.y)));
			graphics.lineTo(next.x, next.y);
		}
		
		graphics.lineTo(orig.x, orig.y);
		
		//var text = new createjs.Text(entity.name + ' - ' + ctxt.name, "10px Arial", "#0000");
		//text.x = orig.x
		//text.y = orig.y;
		////text.textBaseline = "alphabetic";
		//
		//container.addChild(new createjs.Shape(graphics))
		
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
		var points = params.points;
		var entity = params.entity;
		var result;
		var numPoints = ctxt.points.length;
		var transformedPoints = [];
		var i, l;
		var name;
		var col;
		var drawnCollider;

		//switch to check for exactly false so true/undefined will be equivalent to enabled
		if (ctxt.enabled === false) {
			return {status: 'No Intersection', points: []};
		}
		
		for (i = 0; i < numPoints; i++) {
			transformedPoints.push(ctxt.points[i].add(new Point2D(parseFloat(entity.sprite.x), parseFloat(entity.sprite.y))));
		}

		if (points !== undefined) {
			result = Intersection.intersectPolygonPolygon(points, transformedPoints);
		} else {
			result = Intersection.intersectLinePolygon(pt1, pt2, transformedPoints);
		}

		if (result.status !== 'No Intersection') {
			console.log("Hit collider called \"" + ctxt.name + '" on "' + entity.name + '" entity');
			for (i = 0, l = ctxt.disables.length; i < l; i++) {
				name = ctxt.disables[i];
				col = entity.getColliderByName({name: name});
				if (col !== false) {
					console.log('    disabled collider: ' + name);
					col.enabled = false;
				}
			}

			for (i = 0, l = ctxt.enables.length; i < l; i++) {
				name = ctxt.enables[i];
				col = entity.getColliderByName({name: name});
				if (col !== false) {
					console.log('    enabled collider: ' + name);
					col.enabled = true;
				}
			}
			console.log('==========================================');

			//disable collider so it doesn't trigger again
			ctxt.enabled = false;

			//draw hit boxes
			if (params.game.debug) {
				var graphics = new createjs.Graphics();
				graphics.setStrokeStyle(1);
				graphics.beginStroke("green");

				if (points === undefined) {
					points = [];
					points.push(pt1);
					points.push(pt2);
				}
				
				var orig = points[0];
				var next;
				graphics.moveTo(orig.x, orig.y);
				for (i = 1, l = points.length; i < l; i++) {
					next = points[i];
					graphics.lineTo(next.x, next.y);
				}

				drawnCollider = [params.game.stage.addChild(new createjs.Shape(graphics))];

				graphics = new createjs.Graphics();
				graphics.setStrokeStyle(2);
				graphics.beginStroke("blue");
				
				orig = transformedPoints[0];
				graphics.moveTo(orig.x, orig.y);
				for (i = 1, l = transformedPoints.length; i < l; i++) {
					next = transformedPoints[i];
					graphics.lineTo(next.x, next.y);
				}

				drawnCollider.push(params.game.stage.addChild(new createjs.Shape(graphics)));

				params.game.stage.update();
			}

			if (entity.jumpable && params.game.jumping && typeof ctxt.jumpAction === 'function') {
				ctxt.jumpAction();
			} else if (typeof ctxt.action === "function") {
				ctxt.action();
			}

			if (params.game.debug) {
				for (i = 0, l = drawnCollider.length; i < l; i++) {
					params.game.stage.removeChild(drawnCollider[i]);
				}
			}
		}
		
		return result;
	},
	
	_xyz: null
}); // class Collider