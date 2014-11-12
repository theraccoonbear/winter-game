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
	
	checkCollision: function(pt1, pt2) {
		var ctxt = this;
		var result = Intersection.intersectLinePolygon(pt1, pt2, ctxt.points);
		if (result.status !== 'No Intersection') {
			console.log(result);
		}
	},
	
	_xyz: null
}); // class Collider