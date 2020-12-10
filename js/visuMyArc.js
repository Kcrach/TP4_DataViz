var width = 700, height = 580;
var padx = 20;
var pady = 30;
data = "https://lyondataviz.github.io/teaching/lyon1-m2/2020/data/data_network.json"

var linksData;
var allNodes

var svg = d3
    .select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// On rajoute un groupe englobant toute la visualisation pour plus tard
var g = svg.append("g");

d3.select("#divSlider").style("display", "none")

function handleMouseOver(d, l) {
    related = [];
    i = allNodes.indexOf(l);
    for (var ind = 0; ind < linksData.length; ind++) {
        x = linksData[ind];
        if (x.source == i || x.target == i) {
            related.push(x);
        }
    }
    //console.log(related)
    d3.selectAll("path")
        .filter(isRelated(x, related))
        .attr("fill", "red");
}

function isRelated(arc, related) {
    console.log(arc)
    console.log(related)
    console.log(related.indexOf(arc) != -1)
    return related.indexOf(arc) != -1;
}

function handleMouseOut() {

}

function getArc(x1, x2) {
    return [
        "M",
        x1,
        height - pady, // the arc starts at the coordinate x=start, y=height-30 (where the starting node is)
        "A", // A for elliptical arc
        (x1 - x2) / 2,
        ",", // coordinates of the inflexion point. Height of this point is proportional with start - end distance
        (x1 - x2) / 2,
        0,
        0,
        ",",
        x1 < x2 ? 1 : 0,
        x2,
        ",",
        height - pady
    ].join(" ");
}

d3.json(data).then(function(data) {

    linksData = data.links;
    // List of node names
    allNodes = data.nodes.map(function (d) { return d.name; });
    let scale = d3.scalePoint().domain(allNodes).range([0, width - 40]);
    svg.selectAll("circle")
        .data(allNodes)
        .enter()
        .append("circle")
        .attr("cx", (i) => scale(i) + padx)
        .attr("cy", height - pady)
        .attr("r", 10)
        .style("stroke", "lightgreen")
        .style("stroke-width", 10)
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut);

    svg.selectAll("text")
        .data(allNodes)
        .enter()
        .append("text")
        .attr('font-size', '14')
        .attr('font-weight', 'bold')
        .attr('fill', "blue")
        .attr("x", (i) => scale(i) + padx + 10)
        .attr("y", height - pady + 25)
        .text(d => d);

    //Créer table de correspondance
    let idToNodeName = {};
    data.nodes.forEach(function (n) {
        idToNodeName[n.id] = n;
    });

    linksData.map((x, i) => {
        let x1 = scale(idToNodeName[x.source].name);
        let x2 = scale(idToNodeName[x.target].name);

        svg.append("path")
            .attr("d", getArc(x1 + padx, x2 + padx))
            .attr("fill", "none")
            .attr("stroke", "blue")
    });

    });

