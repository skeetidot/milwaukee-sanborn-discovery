// DEFINE CUSTOM TILING SCHEME ALLOWING FOR CLOSE ZOOM TO MAP DATA
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


// DECLARE MAP IN GLOBAL SCOPE
var map;


// FUNCTION TO INSTANTIATE THE LEAFLET MAP AND GET THE DATA
function createMap() {
    map = L.map('map', {
        crs: crs,
        center: [43.041734, -87.904980],
        zoom: 15,
        minZoom: 0,
        maxZoom: 21
        //maxBounds: L.latLngBounds([42.84, -87.82], [43.19, -88.07]), // panning bounds so the user doesn't pan too far away from Milwaukee
    });

    // CALL GET DATA FUNCTION
    getData(map);

}


// FUNCTION TO RETRIEVE DATA AND PLACE IT ON THE MAP (:
function getData(map) {

    // Add Esri Light Gray Canvas Basemap as an Esri tiled map layer
//    var Esri_WorldGrayCanvas = L.esri.tiledMapLayer({
//        //crs: crs,
//        url: 'http://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/',
//        maxZoom: 21,
//        minZoom: 0,
//        maxNativeZoom: 19,
//        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
//    }).addTo(map);
    
//    var Esri_WorldGrayCanvas = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
//	attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
//	maxZoom: 16
//}).addTo(map);


//    // Add Esri Light Gray Canvas Reference as an Esri tiled map layer
    var Esri_WorldGrayCanvas = L.esri.tiledMapLayer({
        url: 'http://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer',
        //maxZoom: 21,
        //minZoom: 0,
        maxNativeZoom: 19,
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


    // USE JQUERY'S GETJSON() METHOD TO LOAD THE SHEET BOUNDARY DATA ASYNCHRONOUSLY
    $.getJSON("data/boundaries_mercator.json", function (data) {


        // CREATE A LEAFLET GEOJSON LAYER FOR THE SHEET BOUNDARIES WITH POPUPS AND ADD IT TO THE MAP
        sheetBoundaries = L.geoJson(data, {

            // CREATE STYLING FOR THE BOUNDARY LAYER
            style: function (feature) {
                return {
                    // SET THE STROKE COLOR
                    color: '#909090',
                    // SET THE STROKE WEIGHT
                    weight: 2,
                    // OVERRIDE THE DEFAULT FILL OPACITY
                    fillOpacity: 0,
                    // BORDER OPACITY
                    opacity: 0
                };
            },

            // LOOP THROUGH EACH FEATURE AND CREATE A POPUP
            onEachFeature: function (feature, layer) {
                layer.on('click', function (e) {
                    popupContent(feature, layer);
                });
            }
        }).addTo(map);



        // POPULATE THE POPUP USING ATTRIBUTES FROM THE GEOJSON BOUNDARY DATA
        function popupContent(feature, layer) {


            // GRAB AND FORMAT SHEET NUMBER, YEAR, BUSINESSES, PUBLISHER, SCALE, REPOSITORY, AND PERMALINK FROM GEOJSON DATA
            var sheetname = "<div class= 'item-key'><b>Sheet number:</b></div> <div class='item-value'>" + feature.properties['Sheet_Numb'] + "</div>";
            var year = "<div class= 'item-key'><b>Publication Year:</b></div><div class='item-value'>" + feature.properties['Publicatio'] + "</div>";
            var businesses = "<div class= 'item-key'><b>Businesses depicted: </b></div><div class='item-value'>" + feature.properties['Business_P'] + "</div>";
            var publisher = "<div class= 'item-key'><b>Publisher: </b></div><div class='item-value'>" + feature.properties['Publisher'] + "</div>";
            var scale = "<div class= 'item-key'><b>Scale: </b></div><div class='item-value'>" + feature.properties['Scale'] + "</div>";
            var repository = "<div class= 'item-key'><b>Repository: </b></div><div class='item-value'>" + feature.properties['Repository'] + "</div>";
            var view = '<a href="' + feature.properties['Reference'] + '" target= "_blank">' + 'View item</a>';


            // CREATE A SUCCINCT VARIABLE WITH ALL THE DATA WE WANT TO PUSH TO THE POPUP
            var info = (sheetname + businesses + year + publisher + scale + repository + view);


            /* PUSH INFO TO POPUP USING RESPONSIVE POPUP PLUGIN SO THAT POPUPS ARE CENTERED ON MOBILE
            EVALUATE EFFICACY OF THIS PLUGIN -- IS THERE SOMETHING MORE EFFECTIVE OUT THERE? */
            var popup = L.responsivePopup().setContent(info);
            sheetBoundaries.bindPopup(popup).openPopup();
        }


        // EXPERIMENTING WITH THE LEAFLET GEOSEARCH PLUGIN FROM
        // https://github.com/smeijer/leaflet-geosearch
        // IT DOES NOT ALLOW SEARCHING BY BOUNDS
        //            var geoSearchController = new L.Control.GeoSearch({
        //                    provider: new L.GeoSearch.Provider.Google()
        //
        //            import { GoogleProvider } from 'leaflet-geosearch';
        //
        //            const googleProvider = new GoogleProvider({
        //                params: {
        //                    key: 'AIzaSyBo-ggpJr485oHzwkfLkI-j8t6Z1nTrDV0',
        //                },
        //            });
        //
        //            const googleSearch = new GeoSearchControl({
        //                provider: googleProvider, // required
        //                style: 'bar', // optional: bar|button  - default button
        //                autoComplete: true,
        //                autoCompleteDelay: 250,
        //                searchLabel: 'Search for an address'
        //            }).addTo(map);


        /* SEARCH BAR (BETA VERSION -- EXPLORING BEST ROUTE TO TAKE)
        ADD ESRI LEAFLET SEARCH CONTROL */
        var searchControl = document.getElementById('search')


        // CREATE THE GEOCODING CONTROL AND ADD IT TO THE MAP
        var searchControl = L.esri.Geocoding.geosearch({
            // KEEP THE CONTROL OPEN
            expanded: 'true',
            // LIMIT SEARCH TO MILWAUKEE COUNTY
            searchBounds: L.latLngBounds([42.84, -87.82], [43.19, -88.07]),
            collapseAfterResult: false,
        }).addTo(map);

        // CREATE AN EMPTY LAYER GROUP TO STORE THE RESULTS AND ADD TO MAP
        var results = L.layerGroup().addTo(map);


        // LISTEN FOR RESULTS EVENT AND ADD EVERY RESULT TO THE MAP
        searchControl.on("results", function (data) {
            results.clearLayers();
            for (var i = data.results.length - 1; i >= 0; i--) {
                results.addLayer(L.marker(data.results[i].latlng));
            }
        });


        /* CONDITIONAL JQUERY TO HIDE SEARCH BAR WHEN POPUPS ARE ENABLED IN MOBILE
        DEFINITELY NOT PERFECT, CAN BE SLEEKER IN LATER ITERATIONS. IF SEARCH BAR CODE CHANGES,
        JUST REPLACE .GEOCODER-CONTROL-INPUT WITH THE DIV CLASS OF THE NEW SEARCH BAR
        (WHICH YOU CAN FIND BY LOOKING WITH THE CHROME INSPECTOR) */
        if ($(window).width() < 600) {
            map.on('popupopen', function (e) {
                $('.geocoder-control-input').hide();
            });
            map.on('popupclose', function (e) {
                $('.geocoder-control-input').show();
            });
        }

        /* BRACKET CLOSING ASYNCHRONOUS GETJSON () METHOD
        ANY CODE THAT ENGAGES WITH THE BOUNDARY DATA LATER MUST BE BACK IN THIS FUNCTION */
    });

    // BRACKET CLOSING THE GETDATA FUNCTION
}


/*******************************************************************************************/
/* JAVASCRIPT RELATED TO OPENING AND CLOSING THE DATA AND ABOUT INFORMATION WINDOWS */

// GET THE MODALS
var aboutModal = document.getElementById('about-modal');
var dataModal = document.getElementById('data-modal');

// GET THE IDS OF THE BUTTONS THAT OPEN THE MODALS
var aboutBtn = document.getElementById("about-button");
var dataBtn = document.getElementById("data-button");

// GET THE <SPAN> ELEMENT THAT CLOSES THE MODAL
var aboutSpan = document.getElementsByClassName("close-about")[0];
var dataSpan = document.getElementsByClassName("close-data")[0];

// WHEN THE USER CLICKS ON THE BUTTONS, OPEN EITHER MODAL
aboutBtn.onclick = function() {
    aboutModal.style.display = "block";
}
dataBtn.onclick = function() {
    dataModal.style.display = "block";
}

// WHEN THE USER CLICKS ON THE <SPAN> (X), CLOSE THE MODAL
aboutSpan.onclick = function() {
    aboutModal.style.display = "none";
}
dataSpan.onclick = function() {
    dataModal.style.display = "none";
}










//*************************************END OF MAIN.JS***********************************/

/* LAST LINE */
$(document).ready(createMap);