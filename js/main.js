// DECLARE MAP IN GLOBAL SCOPE TO GET SOME THINGS WORKING
var crs = new L.Proj.CRS('EPSG:3857', '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs', {
    origin: [-2.00377E7, 3.02411E7],
    resolutions: [
      156543.03392800014,
      78271.51696399994,
	  39135.75848200009,
	  19567.87924099992,
	  9783.93962049996,
	  4891.96981024998,
	  2445.98490512499,
	  1222.992452562495,
	  611.4962262813797,
	  305.74811314055756,
	  152.87405657041106,
	  76.43702828507324,
	  38.21851414253662,
	  19.10925707126831,
	  9.554628535634155,
	  4.77731426794937,
	  2.388657133974685,
	  1.1943285668550503,
	  0.5971642835598172,
	  0.29858214164761665,
	  0.14929107082380833,
	  0.07464553541190416
    ]
});

var map = L.map('map', {
    crs: crs,
    center: [43.023735, -87.956393],
    zoom: 11,
    minZoom: 11,
    maxZoom: 21
}).setView([43.023735, -87.956393], 15);


// call getData function
getData(map);

// FUNCTION TO RETRIEVE DATA AND PLACE IT ON THE MAP (:
function getData(map) {

    // Default basemap tiles
    var OpenStreetMap_BlackAndWhite = L.tileLayer('http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

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


    // The min/maxZoom values provided should match the actual cache thats been published. This information can be retrieved from the service endpoint directly.
    var sanborn = L.esri.tiledMapLayer({
        url: 'http://webgis.uwm.edu/arcgisuwm/rest/services/AGSL/Sanborn/MapServer',
        maxZoom: 21,
        minZoom: 0,
    }).addTo(map);


    //Use JQuery's getJSON() method to load the sheet boundary data asynchronously
    $.getJSON("data/boundaries_mercator.json", function (data) {

        // Create a Leaflet GeoJson layer for the sheet boundaries and add it to the map
        sheetBoundaries = L.geoJson(data, {

            // Create a style for the sheet boundaries
            style: function (feature) {
                return {
                    color: '#909090', // set stroke color
                    weight: 2, // set stroke weight
                    fillOpacity: 0, // override default fill opacity
                    opacity: 0
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


        //SEARCHING BY ADDRESS

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

        // LEAFLET SEARCH PLUGIN
        //uses Leaflet geosearch plugin
        //called from index.html in lib/geosearch/geosearch.js
        //        var geoSearchController = new L.Control.GeoSearch({
        //            provider: new L.GeoSearch.Provider.Google()
        //        }).addTo(map);


        // POPUP CONTENT
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