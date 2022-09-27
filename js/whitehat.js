var margin = {
    top: 10,
    bottom: 10,
    left: 10,
    right:10
}, width = parseInt(d3.select('.viz').style('width'))
    , mapRatio = 0.5
    , height = width * mapRatio
    , active = d3.select(null);

var cityCountsData = null;
var cityVictimsData = null;
var stateCountsData = null;
var victims = null;
var isLoaded = false;

var color = d3.scaleSqrt()
    .domain([2, 20])
    .range(d3.schemeBlues[9]);

function getColor(scheme) {
    return d3.scaleLinear()
        .domain([0, 3])
        .range(scheme)
}

Object.defineProperty(Array.prototype, 'flat', {
    value: function(depth = 1) {
        return this.reduce(function (flat, toFlatten) {
            return flat.concat((Array.isArray(toFlatten) && (depth-1)) ? toFlatten.flat(depth-1) : toFlatten);
        }, []);
    }
});

var svg = d3.select('.viz').append('svg')
    .attr('class', 'center-container')
    .attr('height', height + margin.top + margin.bottom)
    .attr('width', width + margin.left + margin.right)
    .on('click', function () {
        return reset();
    });

Promise.all([d3.json('resource/us-states.topojson'), d3.json('resource/stateCounts.json'), d3.json('resource/cityCounts.json'), d3.json('resource/cityVictims.json')])
    .then(([data, stateCounts, cityCounts, cityVictims]) => {
        ready(data, stateCounts, cityCounts, cityVictims)
    });

var projection = d3.geoAlbersUsa()
    .translate([width /2 , height / 2])
    .scale(width);

var path = d3.geoPath()
    .projection(projection);

var g = svg.append("g")
    .attr('class', 'center-container center-items us-state-g')
    .attr('transform', 'translate('+margin.left+','+margin.top+')')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom);

var svg_grid = d3.select('.grid').append('svg')
    .attr('class', 'center-container center-items full-height grid-g')
    .attr('width', width + margin.left + margin.right)
    .attr('transform', 'translate('+margin.left+','+margin.top+')');

var g_grid = svg_grid.append('g')
    .attr('class', 'center-container center-items grid-g full-height')
    .attr('width', width + margin.left + margin.right)
    .attr('height', '100%')
    .attr('transform', 'translate('+margin.left+','+margin.top+')');


var gridRadius = 7;
var numPerRow = Math.floor(d3.select('.grid-g').attr('width')/(gridRadius * 2.5));
var size=Math.floor(d3.select('.grid-g').attr('width')/(numPerRow));

var scale = d3.scaleLinear()
    .domain([0, numPerRow - 1])
    .range([0, size * numPerRow - 5]);

function ready(data, stateCounts, cityCounts, cityVictims) {
    cityCountsData = cityCounts;
    cityVictimsData = cityVictims;
    stateCountsData = stateCounts;

    let usStates = topojson.feature(data, data.objects.collection).features;

    g.selectAll('.us-state')
        .data(usStates)
        .enter().append('path')
        .attr('class', 'us-state')
        .attr('d', path)
        .attr("fill", function(d) {
            let name = d.properties.NAME;
            if (name in stateCounts)
                return color(d.rate = stateCounts[d.properties.NAME]['count_per_population']);
            else
                return color(d.rate = 0)
        })
        .on("mousemove", function(d) {
            if (active.node() === this) return;

            var html = "";

            html += "<div class=\"tooltip_kv\">";
            html += "<span class=\"tooltip_key\">";
            html += d.properties.NAME;
            html += "</span>";
            html += "<span class=\"tooltip_value\">Male: ";
            html += stateCounts[d.properties.NAME].genderMale;
            html += "</span>";
            html += "<span class=\"tooltip_value\">Female: ";
            html += stateCounts[d.properties.NAME].genderFemale;
            html += "</span>";
            html += "<span class=\"tooltip_value\">Deaths: ";
            html += stateCounts[d.properties.NAME].count;
            html += "</div>";

            html += "<div>";
            html += "</span>";
            html += "<span class=\"tooltip_value\">Age 18+: ";
            html += stateCounts[d.properties.NAME].ageGroup3;
            html += "</span>";
            html += "<span class=\"tooltip_value\">Age 13-18: ";
            html += stateCounts[d.properties.NAME].ageGroup2;
            html += "</span>";
            html += "<span class=\"tooltip_value\">Age 1-12: ";
            html += stateCounts[d.properties.NAME].ageGroup1;
            html += "</div>";

            $("#tooltip-container").html(html);
            $(this).attr("fill-opacity", "0.8");
            $("#tooltip-container").show();

            // var coordinates = d3.mouse(this);

            var map_width = $('.us-state-g')[0].getBoundingClientRect().width;

            if (d3.event.layerX < map_width / 2) {
                d3.select("#tooltip-container")
                    .style("top", (d3.event.layerY + 15) + "px")
                    .style("left", (d3.event.layerX + 15) + "px");
            } else {
                var tooltip_width = $("#tooltip-container").width();
                d3.select("#tooltip-container")
                    .style("top", (d3.event.layerY + 15) + "px")
                    .style("left", (d3.event.layerX - tooltip_width - 30) + "px");
            }
        })
        .on('mouseout', function () {
            $('#tooltip-container').hide();
        })
        .on('click', clicked);
}