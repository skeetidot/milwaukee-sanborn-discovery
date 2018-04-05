// DECLARE MAP IN GLOBAL SCOPE
var map;

// FUNCTION TO INSTANTIATE LEAFLET MAP
function createMap() {
    map = L.map('map', {
        center: [43.023735, -87.956393],
        zoom: 11,
        minZoom: 11,
        maxZoom: 21
    });

    //call getData function
    getData(map);
}

// FUNCTION TO RETRIEVE DATA AND PLACE IT ON THE MAP (:
function getData(map) {

    // Add Esri Light Gray Canvas Basemap
    var Esri_WorldGrayCanvas = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
        maxZoom: 19
    }).addTo(map);

    // Add Esri Light Gray Canvas Reference
    var ESRI_Grey = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
        maxZoom: 19
    }).addTo(map);

    // Add Sanborn map tiles
    // Wisconsin South State Plane REST Service: https://lio.milwaukeecounty.org/arcgis/rest/services/Historical/Sanborn1910_32054/MapServer
    // Web Mercator REST Service Sample: http://webgis.uwm.edu/arcgisuwm/rest/services/AGSL/SanbornTest/MapServer
    // Web Mercator REST Service: http://webgis.uwm.edu/arcgisuwm/rest/services/Sanborn1910/MapServer
    var sanborn = L.tileLayer('http://webgis.uwm.edu/arcgisuwm/rest/services/AGSL/SanbornTest/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'American Geographical Society Library - UWM Libraries',
        tileSize: 256,
        minZoom: 11,
        maxZoom: 21,
        opacity: 0.7
    }).addTo(map);
    
     console.log(sanborn._tiles);       

//    Dynamic service
//    var dynamicSanborn = "http://webgis.uwm.edu/arcgisuwm/rest/services/Sanborn1910/MapServer";
//
//    L.esri.dynamicMapLayer({
//      url: dynamicSanborn,
//      opacity : 0.25,
//      useCors: false
//    }).addTo(map);
//
//    console.log(Esri_WorldGrayCanvas._tiles);
//    console.log(dynamicSanborn);

    // Use JQuery's getJSON() method to load the sheet boundary data asynchronously
    $.getJSON("../data/boundaries_mercator.json", function (data) {

        // Create a Leaflet GeoJson layer for the sheet boundaries and add it to the map
        sheetBoundaries = L.geoJson(data, {

            // Create a style for the sheet boundaries
            style: function (feature) {
                return {
                    color: '#909090', // set stroke color
                    weight: 2, // set stroke weight
                    fillOpacity: 0, // override default fill opacity
                    opacity: 1
                };
            },

            // Loop through each feature and create and bind a popup
            // When the feature is clicked, display its title
            onEachFeature: function (feature, layer) {

                layer.on('click', function (e) {
                    popupContent(feature, layer);
                });
            }

        }).addTo(map);


        // Add Esri Leaflet search control
        var searchControl = document.getElementById('search')

        // Create the geocoding control and add it to the map
        var searchControl = L.esri.Geocoding.geosearch({
            expanded: 'true', // keep the control open
            searchBounds: L.latLngBounds([42.84, -87.82], [43.19, -88.07]), // limit search to Milwaukee County
            collapseAfterResult: false
        }).addTo(map);

        // Create an empty layer group to store the results and add it to the map
        var results = L.layerGroup().addTo(map);

        // Listen for the results event and add every result to the map
        searchControl.on("results", function (data) {
            results.clearLayers();
            for (var i = data.results.length - 1; i >= 0; i--) {
                results.addLayer(L.marker(data.results[i].latlng));
            }
        });


        // What's going in the popup
        function popupContent(feature, layer) {

            // Add fields to the popup
            var sheetname = "<div class= 'item-key'><b>Sheet Number:</b></div> <div class='item-value'>" + feature.properties['Sheet_Numb'] + "</div>";

            var year = "<div class= 'item-key'><b>Publication Year:</b></div><div class='item-value'>" + feature.properties['Publicatio'] + "</div>";

            var businesses = "<div class= 'item-key'><b>Businesses depicted: </b></div><div class='item-value'>" + feature.properties['Business_P'] + "</div>";

            var publisher = "<div class= 'item-key'><b>Publisher: </b></div><div class='item-value'>" + feature.properties['Publisher'] + "</div>";

            var scale = "<div class= 'item-key'><b>Scale: </b></div><div class='item-value'>" + feature.properties['Scale'] + "</div>";

            var repository = "<div class= 'item-key'><b>Repository: </b></div><div class='item-value'>" + feature.properties['Repository'] + "</div>";

            var view = '<a href="' + feature.properties['Reference'] + '" target= "_blank">' + 'View item</a>';


            // Save the popup content to an info variable
            var info = (sheetname + businesses + year + publisher + scale + repository + view);

            // Bind the popup to the sheet boundaries and open it when the user clicks a feature on the map
            var popup = L.responsivePopup().setContent(info);
            sheetBoundaries.bindPopup(popup).openPopup();
        }

    });

}



$(document).ready(createMap);