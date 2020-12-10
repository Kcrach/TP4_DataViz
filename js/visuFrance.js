var width = 700, height = 580;

departement = "https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/departements-version-simplifiee.geojson"
data = "https://lyondataviz.github.io/teaching/lyon1-m2/2020/data/covid-france-mars-avril.csv"

var svg = d3
    .select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// On rajoute un groupe englobant toute la visualisation pour plus tard
var g = svg.append("g");

var projection = d3
    //Centrer la carte de la France
    .geoConicConformal().center([2.454071, 46.279229])
    .translate([width / 2, height / 2])
    .scale([2500]);

// On définit l’échelle de couleur
var color = d3.scaleQuantize()
    .range(["#edf8e9","#bae4b3","#74c476","#31a354","#006d2c"]);

var path = d3.geoPath().projection(projection);

var tooltip = d3.select('body').append('div')
    .attr('class', 'hidden tooltip');

d3.select("#divSlider").style("display", "none")

daysArray = []
daysArraySet = false

d3.csv(data).then(function(data) {
        //Set input domain for color scale
        color.domain([
            d3.min(data, function(d) { 
                return d.hosp;
            }),
            d3.max(data, function(d) {
                return d.hosp; 
            })
        ]);

        d3.json(departement).then(function(json) {
            for (var i = 0; i < data.length; i++) {
                //Nom dU departement
                var dataDep = data[i].dep;

                //Jour
                var dataDay = data[i].jour

                //Valeur associee a l'etat
                var dataValue = parseInt(data[i].hosp);

                //Recherche de l'etat dans le GeoJSON
                for (var j = 0; j < json.features.length; j++) {
                    var jsonDep = json.features[j].properties.code;
                    if (dataDep == jsonDep && dataDay == "23/03/2020") {
                        //On injecte la valeur de l'Etat dans le json
                        json.features[j].properties.value = dataValue;

                        //Pas besoin de chercher plus loin
                        break;
                    }
                }
            }

            g.selectAll("path")
                .data(json.features)
                .enter()
                .append("path")
                .attr("d", path)
                .style("fill", function(d) {
                    //on prend la valeur recuperee plus haut
                    var value = d.properties.value;

                    if (value) {
                        return color(value);
                    } else {
                        // si pas de valeur alors en gris
                        return "#ccc";
                    }
                })
                .on('mousemove', (event, d) => {
                    // on recupere la position de la souris
                    var mousePosition = d3.pointer(event);
                    // on affiche le toolip
                    tooltip.classed('hidden', false)
                        // on positionne le tooltip en fonction 
                        // de la position de la souris
                        .attr('style', 'left:' + (mousePosition[0] + 15) +
                                'px; top:' + (mousePosition[1] - 35) + 'px')
                        // on recupere le nom de l'etat 
                        .html(d.properties.nom);
                })
                .on('mouseout', () => {
                    // on cache le toolip
                    tooltip.classed('hidden', true);
                });     
        });
    });