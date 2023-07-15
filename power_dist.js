const NODES_DATA = [
    { name:'PV',       r: 40, x:0.5, y:0    },
    { name:'Inverter', r: 50, x:0.5, y:0.5  },
    { name:'Battery',  r: 40, x:0,   y:0.75 },
    { name:'Grid',     r: 40, x:0.5, y:1    },
    { name:'Home',     r: 40, x:1,   y:0.75 },
];
const EDGES_DATA = [
    { value: 6.2, unit: 'kW', source: 0, target: 1 }, // PV to Inverter
    { value: -2.7, unit: 'kW', source: 2, target: 1 }, // Battery to Inverter
    { value: -3.27, unit: 'kW', source: 3, target: 1 }, // Grid to Inverer
    { value: 0.230, unit: 'kW', source: 1, target: 4 }, // Inverter to Home
];
const PARAMS = {
    width: 500,
    height: 400,
    padding: 50,
};

const container = d3.select('svg').classed('container', true);

const anchors = container
    .selectAll(".anchors")
    .data(NODES_DATA)
    .enter()
    .append("circle")
    .classed("anchors", true)
    .attr("r", 1)
    .attr("cx", node => PARAMS.padding + (PARAMS.width - 2*PARAMS.padding) * node.x)
    .attr("cy", node => PARAMS.padding + (PARAMS.height - 2*PARAMS.padding) * node.y);

const link = d3.linkHorizontal();
const edges = container
    .selectAll(".edge")
    .data(EDGES_DATA.map((edge) => {
        const sourcePos = [anchors.nodes()[edge.source].cx.animVal.value, anchors.nodes()[edge.source].cy.animVal.value];
        const targetPos = [anchors.nodes()[edge.target].cx.animVal.value, anchors.nodes()[edge.target].cy.animVal.value];
        const angle = Math.atan2(sourcePos[1] - targetPos[1], sourcePos[0] - targetPos[0]);
        const r_s = NODES_DATA[edge.source].r;
        const r_t = NODES_DATA[edge.target].r;
        
        sourcePos[0] += r_s * Math.cos(angle+Math.PI);
        sourcePos[1] += r_s * Math.sin(angle+Math.PI);
        targetPos[0] += r_t * Math.cos(angle);
        targetPos[1] += r_t * Math.sin(angle);

        return { source : sourcePos, 
                 target : targetPos,
                 valueStr: edge.value + " " + edge.unit }; 
        }))
    .enter()
    .append("path")
    .classed("edge", true)
    .attr("d", link);

const edgesvalue = container
    .selectAll(".edgevalue")
    .data(EDGES_DATA)
    .enter()
    .append("text")
    .classed("edgevalue", true)
    .attr("x", edge => (anchors.nodes()[edge.source].cx.animVal.value + anchors.nodes()[edge.target].cx.animVal.value)/2)
    .attr("y", edge => (anchors.nodes()[edge.source].cy.animVal.value + anchors.nodes()[edge.target].cy.animVal.value)/2)
    .text(edge => edge.value + " " + edge.unit)

const nodes = container
    .selectAll(".node")
    .data(NODES_DATA)
    .enter()
    .append("circle")
    .classed("node", true)
    .attr("r", node => node.r)
    .attr("cx", node => PARAMS.padding + (PARAMS.width - 2*PARAMS.padding) * node.x)
    .attr("cy", node => PARAMS.padding + (PARAMS.height - 2*PARAMS.padding) * node.y);

const marker = container
    .selectAll(".marker")
    .data(EDGES_DATA)
    .enter()
    .append("circle")
    .classed("marker", true)
    .attr("cx", edge => anchors.nodes()[edge.source].cx.animVal.value)
    .attr("cy", edge => anchors.nodes()[edge.source].cy.animVal.value)

const nodeames = container
    .selectAll(".nodetext")
    .data(NODES_DATA)
    .enter()
    .append("text")
    .classed("nodetext", true)
    .attr("x", node => PARAMS.padding + (PARAMS.width - 2 * PARAMS.padding) * node.x)
    .attr("y", node => PARAMS.padding + (PARAMS.height - 2 * PARAMS.padding) * node.y)
    .text(node => node.name);

function animation() {
    d3.selectAll(".marker")
        .transition()
        .duration((edge) => {
            const min = Math.min(...EDGES_DATA.map(edge => Math.abs(edge.value)));
            const max = Math.max(...EDGES_DATA.map(edge => Math.abs(edge.value)));
            const norm = (Math.abs(edge.value) - min) / (max-min);

            return 2500 - norm*2000;
        })
        .attrTween("cx", (d, i) => {
            return (t) => {
                EDGES_DATA[i].value
                const totalLen = edges.nodes()[i].getTotalLength();
                const pointIdx = EDGES_DATA[i].value > 0  ? totalLen*t : totalLen*(1-t) ;
                const point = edges.nodes()[i].getPointAtLength(pointIdx);
                return point.x;
            }; 
        })
        .attrTween("cy", (d, i) => { 
            return (t) => {
                const totalLen = edges.nodes()[i].getTotalLength();
                const pointIdx = EDGES_DATA[i].value > 0  ? totalLen*t : totalLen*(1-t) ;
                const point = edges.nodes()[i].getPointAtLength(pointIdx);
                return point.y;
            }; 
        });
}

