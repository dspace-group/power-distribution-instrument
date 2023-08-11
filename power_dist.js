const NODES_DATA = [
    { id:'Inverter', r: 50},
    { id:'PV',       r: 40},
    { id:'Battery',  r: 40},
    { id:'Grid',     r: 40},
    { id:'Home',     r: 50},
    { id:'Heatpump', r: 40},
    { id:'EV',       r: 40},
    { id:'Rest',     r: 40},
];
const EDGES_DATA = [
    { value: 10, source: 'PV', target: 'Inverter' },
    { value: -2, source: 'Battery', target: 'Inverter' },
    { value: 0, source: 'Grid', target: 'Inverter' },
    { value: 8, source: 'Inverter', target: 'Home' },
    { value: 1, source: 'Home', target: 'Heatpump' },
    { value: 1, source: 'Home', target: 'Rest' },
    { value: 6, source: 'Home', target: 'EV' },
];
const PARAMS = {
    width: 600,
    height: 600,
    padding: 50,
    min: 0,
    max: 10,
    forceManyBodyStrength: -2500,
    forceLinkDistance: 80,
    unit: "",
    digits: 2
};

function configureJson(nodes_data_json, edges_data_json) {
    var nodes_data = JSON.parse(nodes_data_json);
    var edges_data = JSON.parse(edges_data_json);
    configure(nodes_data, edges_data);
}
function configure(nodes_data, edges_data) {
    d3.select('svg').classed('container', true).selectAll(".marker").interrupt();
    d3.select('svg').classed('container', true).selectAll("*").remove();

    var simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(function(d) { return d.id; }))
        .force("charge", d3.forceManyBody().strength(PARAMS.forceManyBodyStrength))
        .force("center", d3.forceCenter(PARAMS.width / 2, PARAMS.height / 2));

    const container = d3.select('svg').classed('container', true)
        .attr("width", PARAMS.width)
        .attr("height", PARAMS.height);

    const nodes = container
        .selectAll(".node")
        .data(nodes_data)
        .enter()
        .append("circle")
        .classed("node", true)
        .attr("r", node => node.r)

    const edges = container
        .selectAll(".edge")
        .data(edges_data)
        .enter()
        .append("line")
        .classed("edge", true)

    const edgesvalue = container
        .selectAll(".edgevalue")
        .data(edges_data)
        .enter()
        .append("text")
        .classed("edgevalue", true)
        .text(edge => {
            if(edge.value == undefined) return "---";
            return edge.value + " " + PARAMS.unit
        });

    const markers = container
        .selectAll(".marker")
        .data(edges_data)
        .enter()
        .append("circle")
        .classed("marker", true)

    const nodenames = container
        .selectAll(".nodetext")
        .data(nodes_data)
        .enter()
        .append("text")
        .classed("nodetext", true)
        .text(node => node.id);

    simulation
        .nodes(nodes_data)
        .on("tick", ticked)
    simulation.force("link")
        .links(edges_data)
        .distance(PARAMS.forceLinkDistance);

    function ticked() {
            edges
                .attr("x1", d => d.source.x + d.source.r * Math.cos(Math.atan2(d.source.y - d.target.y, d.source.x - d.target.x)+Math.PI))
                .attr("y1", d => d.source.y + d.source.r * Math.sin(Math.atan2(d.source.y - d.target.y, d.source.x - d.target.x)+Math.PI))
                .attr("x2", d => d.target.x + d.target.r * Math.cos(Math.atan2(d.source.y - d.target.y, d.source.x - d.target.x)))
                .attr("y2", d => d.target.y + d.target.r * Math.sin(Math.atan2(d.source.y - d.target.y, d.source.x - d.target.x)));
            nodes
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);
            nodenames
                .attr("x", d => d.x)
                .attr("y", d => d.y);
            edgesvalue
                .attr("x", d => (d.source.x + d.target.x)/2)
                .attr("y", d => (d.source.y + d.target.y)/2);
        }
}

function setParam(key, value) {
    PARAMS[key] = value;
}

function animate() {
    const container = d3.select('svg').classed('container', true);
    const markers = container.selectAll(".marker");
    const edges = container.selectAll(".edge")

    markers.each(function transition(marker) {
        d3.select(this)
        .transition()
        .duration((d) => {
            const edgesvalue = container.selectAll(".edgevalue");
            const value = d.value == undefined ? 0 : d.value;
            
            if(d.value == undefined)
                edgesvalue.nodes()[d.index].textContent = "---";
            else
                edgesvalue.nodes()[d.index].textContent = value + " " + PARAMS.unit;

            const norm = (Math.min(Math.max(Math.abs(value), PARAMS.min), PARAMS.max) - PARAMS.min) / (PARAMS.max - PARAMS.min);
            const duration = 2500 - norm * 2000;

            return duration
        })
        .attrTween("cx", (d) => {
            return (t) => {
                const value = d.value == undefined ? 0 : d.value;
                const edge = edges.nodes()[d.index];
                const totalLen = edge.getTotalLength();
                const pointIdx = value == 0 ? 0 : (value > 0  ? totalLen*t : totalLen*(1-t));
                const point = edge.getPointAtLength(pointIdx);
                return point.x;
            }; 
        })
        .attrTween("cy", (d) => { 
            return (t) => {
                const value = d.value == undefined ? 0 : d.value;
                const edge = edges.nodes()[d.index];
                const totalLen = edge.getTotalLength();
                const pointIdx = value == 0 ? 0 : (value > 0  ? totalLen*t : totalLen*(1-t));
                const point = edge.getPointAtLength(pointIdx);
                return point.y;
            }; 
        })
        .on("end", transition);
    });
}

function configureDefault() {
    configure(NODES_DATA, EDGES_DATA);
    animate();
}

function valueChanged(jsonData) {
    var input = JSON.parse(jsonData);    

    const container = d3.select('svg').classed('container', true);
    const edges = container.selectAll(".edge");
    const data = edges.data();

    data.forEach(d => {
        d.value = undefined;
    });

    input.Variables.forEach(function(variable) {
        source = variable.UniqueName.split("->")[0];
        target = variable.UniqueName.split("->")[1];
        
        entry = data.find(d => d.source.id==source && d.target.id==target);
        if(entry === undefined) return;
        if(variable.Value == "---") return;
        entry.value = parseFloat(variable.Value).toFixed(PARAMS.digits);
    });
}