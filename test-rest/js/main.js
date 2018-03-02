// DECLARE MAP IN GLOBAL SCOPE TO GET SOME THINGS WORKING
var map;

//FUNCTION TO INSTANTIATE LEAFLET MAP
function createMap() {
    map = L.map('map', {
        center: [43.028279, -87.961136],
        zoom: 15,
        minZoom: 11,
        maxZoom: 19
    });
    
    //call getData function
    getData(map);
}

// FUNCTION TO RETRIEVE DATA AND PLACE IT ON THE MAP (:
function getData(map) {

    // Default basemap tiles
    var Esri_WorldGrayCanvas = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
        maxZoom: 16
    }).addTo(map);

    var Esri_WorldGrayReference = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
        maxZoom: 16
    }).addTo(map);

    //add Sanborn map tiles
    // Wisconsin South State Plane REST Service: https://lio.milwaukeecounty.org/arcgis/rest/services/Historical/Sanborn1910_32054/MapServer
    // Web Mercator REST Service: http://webgis.uwm.edu/arcgisuwm/rest/services/AGSL/SanbornTest/MapServer
    var sanborn = L.tileLayer('http://webgis.uwm.edu/arcgisuwm/rest/services/AGSL/SanbornTest/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Milwaukee County',
        tileSize: 256,
        minZoom: 17,
        maxZoom: 19,
        opacity: 0.7
    }).addTo(map);
    
    //Use JQuery's getJSON() method to load the sheet boundary data asynchronously
    $.getJSON("../data/sheet_boundaries_wgs84.json", function (data) {
    
        // Create a Leaflet GeoJson layer for the sheet boundaries and add it to the map
        sheetBoundaries = L.geoJson(data, {
        
            // Create a style for the sheet boundaries
            style: function (feature) {
                return {
                    color: '#3d3d3d', // set stroke color
                    weight: 2, // set stroke weight
                    fillOpacity: 0, // override default fill opacity
                    opacity: 1   
                };
            },
            
            // Loop through each feature and create and bind a popup
            // When the feature is clicked, display its title
            onEachFeature: function(feature, layer) {
                
                layer.on('click', function() { 
                    var popup = feature.properties.Title; 
                    layer.bindPopup(popup);
                    //console.log(feature.properties);
                });                
            }
            
        }).addTo(map);        
    });

//    $.getJSON("../data/sheet_boundaries_3857.json"),
//        function (data) {
//            // add GeoJSON layer to the map once the file is loaded
//            L.geoJson(data).addTo(map);
//        }

    //    //load the data
    //    jQuery.ajax("../data/sheet_boundaries.geojson", {
    //        dataType: "json"
    //        , success: function (response) {
    //            //create marker options
    //            var geojsonMarkerOptions = {
    //                radius: 7
    //                , fillColor: "#571d12"
    //                , color: "white"
    //                , weight: 1
    //                , opacity: 1
    //                , fillOpacity: 0.9
    //            };
    //            //create a Leaflet GeoJSON layer and add it to the map
    //            var confederateMonuments = L.geoJSON(response.features, {
    //                pointToLayer: function (feature, latlng) {
    //                    console.log(feature);
    //                    console.log(latlng);
    //                    //return L.circleMarker(latlng, geojsonMarkerOptions);
    //                }
    //                , onEachFeature: function (feature, layer) {
    //                    layer.on('click', function (e) {
    //                        popupContent(feature, layer);
    //                    });
    //                }
    //            }).addTo(map);
    //            //what's going in the popup
    //            function popupContent(feature, layer) {
    //                // add description field(s) to the popup
    //                var state = "<b>State:</b> <br>" + feature.properties['State'] + "<br>";
    //                var where = "<b>Where:</b> <br>" + feature.properties['Where'] + "<br>";
    //                var when = "<b>When: </b><br>" + feature.properties['When'] + "<br>";
    //                var what = "<b>What:</b> <br>" + feature.properties['What'] + "<br>";
    //                var mondesc = "<b>Monument description: </b><br>" + feature.properties['Mon_Desc'] + "<br>";
    //                var more = '<a href="' + feature.properties['More'] + '">' + 'more information</a>';
    //                var year = "<b>Year installed:</b> <br>" + feature.properties['Year_Inst'] + "<br><br>";
    //                var info = (state + where + when + what + mondesc + year + more);
    //                var popup = L.responsivePopup().setContent(info);
    //                confederateMonuments.bindPopup(popup).openPopup();
    //                //L.marker([48.850258, 2.351074]).addTo(map).bindPopup(popup);
    //            }
    //        }
    //    });
}

$(document).ready(createMap);
