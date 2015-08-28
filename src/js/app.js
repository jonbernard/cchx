angular.module('init', [])
.controller('line', ['$scope', function($scope) {
	var margin = {top: 20, right: 40, bottom: 0, left: 40},
	width = 780 - margin.left - margin.right,
	height = 200 - margin.top - margin.bottom;

	var parseDate = d3.time.format("%b-%y").parse;

	var x = d3.time.scale()
	.range([0, width]);

	var y = d3.scale.linear()
	.range([70, 30]);

	var xAxis = d3.svg.axis()
	.scale(x)
	.orient("top")
	.tickSize(-height, 0, 0)
	.tickPadding(10)
	.tickFormat(d3.time.format("%b"));

	var yAxis = d3.svg.axis()
	.scale(y)
	.orient("left");

	var area = d3.svg.area()
	.x(function(d) { return x(d.date); })
	.y0(height)
	.y1(function(d) { return y(d.close); });

	var line = d3.svg.line()
	.x(function(d) { return x(d.date); })
	.y(function(d) { return y(d.close); });

	var svg = d3.select("#visits .line").append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	d3.tsv("assets/line.tsv", function(error, data) {
		if (error) throw error;

		data.forEach(function(d) {
			d.date = parseDate(d.date);
			d.close = +d.close;
		});

		x.domain(d3.extent(data, function(d) { return d.date; }));
		y.domain(d3.extent(data, function(d) { return d.close; }));

		svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0,0)")
		.style("font-size","12px")
		.call(xAxis);

		svg.append("path")
		.datum(data)
		.attr("class", "area")
		.attr("d", area);

		svg.append("path")
		.datum(data)
		.attr("class", "line")
		.attr("d", line);
	});
}])
.controller('bar', ['$scope', function($scope) {
	var data = [100, 80, 75, 15, 10],
		i = 1;

	var x = d3.scale.linear()
	.domain([0, d3.max(data)])
	.range([0, 650]);

	var barGraph = d3.select(".bar")
	.selectAll("div")
	.data(data)
	.enter().append("section");

	barGraph.append("label").html(function(d) {return "Insurance";});
	barGraph.append("div").style("width", function(d) {
		return x(d) + "px"; 
	}).style("opacity", function(d) {
		i = i - .15;
		return i; 
	});
}])
.controller('map', ['$scope', function($scope) {
	var width = 780,
	height = 400;

	var rateById = d3.map();

	var quantize = d3.scale.quantize()
	.domain([0, .15])
	.range(d3.range(9).map(function(i) { return "q" + i + "-9"; }));

	var projection = d3.geo.albersUsa()
	.scale(2200)
	.translate([0,313]);

	var path = d3.geo.path()
	.projection(projection);

	var zoom = d3.behavior.zoom()
	.scaleExtent([1, 10])
	.on("zoom", zoomFunc);

	var svg = d3.select("#patient-demographics .map").append("svg")
	.attr("width", width)
	.attr("height", height)
	.call(zoom);

	queue()
	.defer(d3.json, "/assets/us.json")
	.defer(d3.tsv, "assets/map.tsv", function(d) { rateById.set(d.id, +d.rate); })
	.await(ready);

	function ready(error, us) {
		if (error) throw error;

		svg.append("g")
		.attr("class", "counties")
		.selectAll("path")
		.data(topojson.feature(us, us.objects.counties).features)
		.enter().append("path")
		.attr("class", function(d) { return quantize(rateById.get(d.id)); })
		.attr("d", path)

		svg.append("path")
		.datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
		.attr("class", "states")
		.attr("d", path)
	}

	function zoomFunc() {
		var translate = d3.event.translate;
		var zoomSvg = d3.select("svg .counties").attr("transform", "translate(" + translate + ")scale(" + d3.event.scale + ")");
		var zoomSvg2 = d3.select("svg .states").attr("transform", "translate(" + translate + ")scale(" + d3.event.scale + ")");
	}

	d3.select(self.frameElement).style("height", height + "px");
}]);