// DECLARE MAP IN GLOBAL SCOPE TO GET SOME THINGS WORKING
$(document).ready(function() {

//DEFINE CUSTOM TILING SCHEME ALLOWING FOR CLOSE ZOOM TO MAP DATA
var crs = new L.Proj.CRS('EPSG:3857', '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs', {
    origin: [-2.00377E7 , 3.02411E7 ],
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

//DECLARE MAP VARIABLE AT GLOBAL SCOPE
var map = L.map('map', {
    crs: crs
}).setView([43.023735, -87.956393], 15);


//CALL GET DATA FUNCTION
getData(map);




// FUNCTION TO RETRIEVE DATA AND PLACE IT ON THE MAP (:
function getData(map) {

    // BASEMAP
    var OpenStreetMap_BlackAndWhite = L.tileLayer('http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

//    // Add Esri Light Gray Canvas Basemap
//    var Esri_WorldGrayCanvas = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
//        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
//        maxZoom: 19
//    }).addTo(map);

//    // Add Esri Light Gray Canvas Reference
//    var ESRI_Grey = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {
//        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
//        maxZoom: 19
//    }).addTo(map);
    
    // Add Esri Light Gray Canvas Basemap as an Esri tiled map layer
    var Esri_WorldGrayCanvas = L.esri.tiledMapLayer({
        url: 'http://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/',
        maxZoom: 19,
        minZoom: 0,
        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
    }).addTo(map);
    
    // Add Esri Light Gray Canvas Reference as an Esri tiled map layer
    var Esri_WorldGrayReference = L.esri.tiledMapLayer({
        url: 'http://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer',
        maxZoom: 19,
        minZoom: 0,
        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
    }).addTo(map);

    /*ESRI LEAFLET PLUGIN REQUIRED TO CALL THIS MAP SERVICE PUBLISHED WITH A CUSTOM TILING SCHEME.
    THE TILES ARE CACHED IN WEB MERCATOR USING GOOGLE/BING TILING SCHEME, BUT WE ADDED TWO ADDITIONAL
    ZOOMED-IN SCALES, TO ALLOW FOR CLEARER VIEWING OF THE SANBORN MAPS. IN ORDER TO PROPERLY LOAD THIS
    SERVICE IN LEAFLET, LINKING TO 3 PLUGINS IS REQUIRED: ESRI LEAFLET, PROJ4, AND PROJ4LEAFLET. THE CRS MUST
    ALSO BE DEFINED (SEE 'CRS' VARIABLE ABOVE & USE THE REST SERVICE URL TO FIND RESOLUTIONS. LEAFLET HANDLES
    DIFFERENT TILING SCHEMES THE SAME WAY IT HANDLES DIFFERENT PROJECTIONS, SO EVEN THOUGH THIS SERVICE IS
    PUBLISHED IN WEB MERCATOR, THIS TACTIC IS REQUIRED TO LOAD THE SERVICE.*/
    var sanborn = L.esri.tiledMapLayer({
        url: 'http://webgis.uwm.edu/arcgisuwm/rest/services/AGSL/Sanborn/MapServer',
        maxZoom: 21,
        minZoom: 0,
        attribution: 'American Geographical Society Library, University of Wisconsin-Milwaukee'
    }).addTo(map);



    //USE JQUERY'S GETJSON() METHOD TO LOAD THE SHEET BOUNDARY DATA ASYNCHRONOUSLY
    $.getJSON("data/boundaries_mercator.json", function (data) {

        //CREATE A LEAFLET GEOJSON LAYER FOR THE SHEET BOUNDARIES WITH POPUPS AND ADD IT TO THE MAP
        sheetBoundaries = L.geoJson(data, {

            //CREATE STYLING FOR THE BOUNDARY LAYER
            style: function (feature) {
                return {
                    //SET THE STROKE COLOR
                    color: '#909090',
                    //SET THE STROKE WEIGHT
                    weight: 2,
                    //OVERRIDE THE DEFAULT FILL OPACITY
                    fillOpacity: 0,
                    //BORDER OPACITY
                    opacity: 0
                };
            },

            //LOOP THROUGH EACH FEATURE AND CREATE A POPUP//
            onEachFeature: function(feature, layer) {

                layer.on('click', function(e) {
                    popupContent(feature,layer);
                });
            }
        }).addTo(map);


        //POPULATING POPUP USING ATTRIBUTES FROM THE GEOJSON BOUNDARY DATA
        function popupContent(feature, layer) {


            //GRAB & FORMAT SHEET NUMBER, YEAR, BUSINESSES, PUBLISHER, SCALE, REPOSITORY, & PERMALINK FROM GEOJSON DATA
            var sheetname = "<div class= 'item-key'><b>Sheet number:</b></div> <div class='item-value'>" + feature.properties['Sheet_Numb'] + "</div>";
            var year = "<div class= 'item-key'><b>Publication Year:</b></div><div class='item-value'>" + feature.properties['Publicatio'] + "</div>";
            var businesses = "<div class= 'item-key'><b>Businesses depicted: </b></div><div class='item-value'>" + feature.properties['Business_P'] + "</div>";
            var publisher = "<div class= 'item-key'><b>Publisher: </b></div><div class='item-value'>" + feature.properties['Publisher'] + "</div>";
            var scale = "<div class= 'item-key'><b>Scale: </b></div><div class='item-value'>" + feature.properties['Scale'] + "</div>";
            var repository = "<div class= 'item-key'><b>Repository: </b></div><div class='item-value'>" + feature.properties['Repository'] + "</div>";
            var view = '<a href="' + feature.properties['Reference'] + '" target= "_blank">' + 'View item</a>';


            //CREATE A SUCCINCT VARIABLE WITH ALL THE DATA WE WANT TO PUSH TO THE POPUP
            var info = (sheetname + businesses + year + publisher + scale + repository + view);

            /*PUSH INFO TO POPUP USING RESPONSIVE POPUP PLUGIN SO THAT POPUPS ARE CENTERED ON MOBILE
            EVALUATE EFFICACY OF THIS PLUGIN -- IS THERE SOMETHING MORE EFFECTIVE OUT THERE?*/
            var popup = L.responsivePopup().setContent(info);
            sheetBoundaries.bindPopup(popup).openPopup();
        }


        /*SEARCH BAR (BETA VERSION -- EXPLORING BEST ROUTE TO TAKE)
        ADD ESRI LEAFLET SEARCH CONTROL */
        var searchControl = document.getElementById('search')

        //CREATE THE GEOCODING CONTROL && ADD IT TO THE MAP
        var searchControl = L.esri.Geocoding.geosearch({
            //KEEP THE CONTROL OPEN
            expanded: 'true',
            //LIMIT SEARCH TO MILWAUKEE COUNTY
            searchBounds: L.latLngBounds([42.84, -87.82], [43.19, -88.07]),
            collapseAfterResult: false
        }).addTo(map);

        //CREATE AN EMPTY LAYER GROUP TO STORE THE RESULTS AND ADD TO MAP
        var results = L.layerGroup().addTo(map);

        //LISTEN FOR RESULTS EVENT && ADD EVERY RESULT TO THE MAP
        searchControl.on("results", function (data) {
            results.clearLayers();
            for (var i = data.results.length - 1; i >= 0; i--) {
                results.addLayer(L.marker(data.results[i].latlng));
            }
        });



        /*CONDITIONAL JQUERY TO HIDE SEARCH BAR WHEN POPUPS ARE ENABLED IN MOBILE
        DEFINITELY NOT PERFECT, CAN BE SLEEKER IN LATER ITERATIONS. IF SEARCH BAR CODE CHANGES,
        JUST REPLACE .GEOCODER-CONTROL-INPUT WITH THE DIV CLASS OF THE NEW SEARCH BAR
        (WHICH YOU CAN FIND BY LOOKING WITH THE CHROME INSPECTOR) */
        if ($(window).width() < 600){
            map.on('popupopen', function(e) {
                $('.geocoder-control-input').hide();
            });
            map.on('popupclose', function(e) {
                $('.geocoder-control-input').show();
            });
        }


    /*BRACKET CLOSING ASYNCHRONOUS GETJSON () METHOD
    ANY CODE THAT ENGAGES WITH THE BOUNDARY DATA LATER MUST BE BACK IN THIS FUNCTION*/
    });

//BRACKET CLOSING THE GETDATA FUNCTION
}


//BRACKET CLOSING THE ONDOCUMENTREADY FUNCTION
});