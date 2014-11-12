/* jshint quotmark:false, strict:false, eqeqeq:false */
/* global Class, Intersection */
var CollisionTarget = Class.extend({
	points: [],
	action: null,
	
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
	
	checkCollision: function(params) {
		var ctxt = this;
		var pt1 = params.pt1;
		var pt2 = params.pt2;
		var entity = params.entity;
		var result;
		var numPoints = ctxt.points.length;
		var transformedPoints = [];
		var i;

		for (i = 0; i < numPoints; i++) {
			transformedPoints.push(ctxt.points[i].add(new Point2D(parseFloat(entity.sprite.x), parseFloat(entity.sprite.y))));
		}

		result = Intersection.intersectLinePolygon(pt1, pt2, transformedPoints);
		if (result.status !== 'No Intersection') {
			// console.log("CollisionTarget result: ", result);
			// console.log("CollisionTarget ctxt.points: ", ctxt.points);
			// console.log("CollisionTarget transformedPoints: ", transformedPoints);
			// console.log("CollisionTarget boarder line coords: ", pt1, pt2);

			if (typeof ctxt.action === "function") {
				ctxt.action();
			}
		}
	},
	
	_xyz: null
}); // class Collider