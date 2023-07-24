
 // USGS - United States Geological Survey 
// All Earthquakes from the Past Seven Days

url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

d3.json(url).then(function(data) {

    // Place data into a variable
    var earthquakeData = data;
    
    // Print the data
    console.log(earthquakeData);

    // Print object keys 
    console.log(Object.keys(earthquakeData));

    // Get the date of the data 
    var dataDate = new Date(earthquakeData.metadata.generated);
    // Create the object list with the target data columns
    var newData = [];
    for (var i = 0; i < earthquakeData.features.length; i++) {
        var time = new Date(earthquakeData.features[i].properties.time);
        newData.push({
            "time": time.toLocaleTimeString("en-US", options),
            "title": earthquakeData.features[i].properties.title,
            "url": earthquakeData.features[i].properties.url,
            "lat": earthquakeData.features[i].geometry.coordinates[0],
            "lon": earthquakeData.features[i].geometry.coordinates[1],
            "mag": earthquakeData.features[i].properties.mag,
            "depth": earthquakeData.features[i].geometry.coordinates[2]
        });
    };
    console.log(newData);

    // Create a geoJSON layer containing the features array
    // Add a popup for each marker
    // Send the layer to the createMap() function.
    let earthquakes = L.geoJSON(data.features, {
        onEachFeature: addPopup
    });

    // Call the function to load the map and the circles
    createMap(earthquakes, newData);
});

// Define the time format
var options = { year: 'numeric', month: 'numeric', day: 'numeric' };
options.timeZone = 'UTC';

// Define the function we want to run for each feature in the array
function addPopup(feature, layer) {

    // Give each feature a popup with a description of the place and time of the earthquake
    return layer.bindPopup(`<h3> ${feature.properties.place} </h3> <hr> <p> ${Date(feature.properties.time)} </p>`);
}

// Create function to receive a layer of markers and plot them on the map
function createMap(earthquakes, data) {

    // Define the base layers.
    var attribution =
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
    var titleUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    var OpenStreetMap = L.tileLayer(titleUrl, { attribution });

    // Create a baseMaps object to hold our base layers
    var baseMaps = {
        "OpenStreet": OpenStreetMap
    };


    // Create the circles for each data point 
    var earthquakeCircles = [];
    data.forEach(function (element) {

        // Select the color of the circle based on the depth of the earthquake
        var color = "";
        if (element.depth < 10) {
            color = "blue";
        }
        else if (element.depth < 30) {
            color = "green";
        }
        else if (element.depth < 50) {
            color = "yellow";
        }
        else if (element.depth < 70) {
            color = "orange";
        }
        else if (element.depth < 90) {
            color = "pink";
        }
        else {
            color = "red";
        }

        // create a circles array
        circles = L.circle([element.lon, element.lat], {
            fillOpacity: .7,
            color: "black",
            weight: .5,
            fillColor: color,
            radius: element.mag * 18000
        }).bindPopup(`<h6 style="font-weight: bold;">${element.title}</h6> <hr> 
            <p>Date: ${element.time} UTC</p> 
            <p>Magnitude: ${element.mag} ml</p>
            <p>Depth: ${element.depth} km</p>
            <a href="${element.url}" target="_blank">More details...</a>`);
        earthquakeCircles.push(circles);
    });

    // Create the layerGroup for each state's markers.
    var earthquakeLayer = L.layerGroup(earthquakeCircles);

    // Create our map's streetmap and earthquakes layers
    var myMap = L.map("map", {
        center: [40, -110],
        zoom: 5,
        fullscreenControl: true,
        layers: [OpenStreetMap, earthquakeLayer]

    });

    // Create the legend
    var myColors = ["blue", "green", "yellow", "orange", "pink", "red"];
 
    var legend = L.control({position:'topright'});
    legend.onAdd = function () {

        var div = L.DomUtil.create('div', 'info legend');
        labels = ["<div style='background-color: lightblue'><strong>&nbsp&nbspDepth (km)&nbsp&nbsp</strong></div>"];
        categories = ['-10 - 10', ' 10 - 30', ' 30 - 50', ' 50 - 70', ' 70 - 90', '90 & above'];
        for (var i = 0; i < categories.length; i++) {
            div.innerHTML +=
                labels.push(
                    '<li class="circle" style="background-color:' + myColors[i] + '">' + categories[i] + '</li> '
                );
        }
        div.innerHTML = '<ul style="list-style-type:none; text-align: center">' + labels.join('') + '</ul>'
        return div;
    };
    legend.addTo(myMap);

    // Adding a Scale map
    L.control.scale()
        .addTo(myMap);

    // Create a layer control and pass in baseMaps and overlayMaps
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: true
    }).addTo(myMap);
};