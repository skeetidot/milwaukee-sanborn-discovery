// DECLARE MAP IN GLOBAL SCOPE
var map;


// DECLARE DEFAULT OPACITY IN GLOBAL SCOPE
var currentOpacity = 0.7;


// DECLARE GLOBAL VARIABLES FOR GEOCODING
var arcgisOnline = L.esri.Geocoding.arcgisOnlineProvider();
var geocodeService = L.esri.Geocoding.geocodeService();


// DECLARE BASEMAPS IN GLOBAL SCOPE

// Political basemap
var Esri_WorldGrayCanvas = L.tileLayer('https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
    maxZoom: 16
});

// Political basemap labels
var Esri_WorldGrayReference = L.tileLayer('https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
    maxZoom: 16
});

// World imagery basemap (for use at detailed scales)
var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    minZoom: 17,
    maxNativeZoom: 20,
    maxZoom: 21
});


// DECLARE SANBORN MAPS IN GLOBAL SCOPE
var sanborn = L.esri.tiledMapLayer({
    url: 'http://webgis.uwm.edu/arcgisuwm/rest/services/AGSL/SanbornMaps/MapServer',
    maxZoom: 21,
    minZoom: 0,
    opacity: 0.7, // Initial opacity
    attribution: 'American Geographical Society Library, University of Wisconsin-Milwaukee'
});


// SET THE MAP OPTIONS
var mapOptions = {
    center: [43.041734, -87.904980], // centered in Downtown Milwaukee
    zoom: 15,
    minZoom: 11,
    maxZoom: 21,
    maxBounds: L.latLngBounds([42.84, -87.82], [43.19, -88.07]), // panning bounds so the user doesn't pan too far away from Milwaukee,
    bounceAtZoomLimits: false //Set it to false if you don't want the map to zoom beyond min/max zoom and then bounce back when pinch-zooming.
}


// CREATE A NEW LEAFLET MAP WITH THE MAP OPTIONS
var map = L.map('map', mapOptions);


// PLACE THE OPACITY SLIDER ON THE MAP USING LEAFLET DOMUTIL
(function () {

    // Create a Leaflet control object and store a reference to it in a variable
    var sliderControl = L.control({
        position: 'topleft',
        bubblingMouseEvents: false
    });

    //WHEN WE ADD THIS CONTROL OBJECT TO THE MAP
    sliderControl.onAdd = function (map) {

        //SELECT AN EXISTING DOM ELEMENT WITH AN ID OF 'OPACTY-SLIDER'
        var slider = L.DomUtil.get("opacity-slider");

        //WHEN THE USER HOVERS OVER THE SLIDER ELEMENT
        L.DomEvent.addListener(slider, 'mouseover', function (e) {
            //PREVENT THE USER FROM DRAGGING THE MAP WHILE THEY ARE HOVERING ON THE OPACITY SLIDER
            map.dragging.disable();
        });

        //WHEN THE USER CLICKS ON THE SLIDER ELEMENT
        L.DomEvent.addListener(slider, 'mouseout', function (e) {
            //ALLOW THE USER TO DRAG THE MAP WHEN THEY MOVE OFF OF THE OPACITY SLIDER
            map.dragging.enable();
        });


        //RETURN THE SLIDER FROM THE ONADD METHOD
        return slider;
    }

    //ADD THE CONTROL OBJECT CONTAINING THE SLIDER ELEMENT TO THE MAP
    sliderControl.addTo(map);

})();
//END OF OPACITY SLIDER JAVASCRIPT




//SET UP TOUCH EVENT LIBRARY FOR MOBILE
// direct event
$('.touch').on('press', function(e) {
    alert("woo hoo");
});

// delegated event
$('.parent').on('press', '.touch', function(e) {
    alert("woo hoo");
});


$.Finger = {
    pressDuration: 300,
    doubleTapInterval: 300,
    flickDuration: 150,
    motionThreshold: 5
};



// CALL GET DATA FUNCTION
getData(map);



// FUNCTION TO RETRIEVE DATA AND PLACE IT ON THE MAP (:
function getData(map) {


    // Add the basemaps
    map.addLayer(Esri_WorldGrayCanvas);
    map.addLayer(Esri_WorldGrayReference);
    map.addLayer(Esri_WorldImagery);


    // Add the Sanborn maps
    sanborn.addTo(map);


    // Call the updateOpacity() function to update the map as the user moves the year slider
    updateOpacity(sanborn, currentOpacity);


    // USE JQUERY'S GETJSON() METHOD TO LOAD THE SHEET BOUNDARY DATA ASYNCHRONOUSLY
    $.getJSON("data/boundaries_mercator.json", function (data) {


        // CREATE A LEAFLET GEOJSON LAYER FOR THE SHEET BOUNDARIES WITH POPUPS AND ADD IT TO THE MAP
        sheetBoundaries = L.geoJson(data, {

            // CREATE STYLING FOR THE BOUNDARY LAYER
            style: function (feature) {
                return {
                    color: '#909090', // Stroke Color
                    weight: 2, // Stroke Weight
                    fillOpacity: 0, // Override the default fill opacity
                    opacity: 0 // Border opacity
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
            expanded: true,
            // LIMIT SEARCH TO MILWAUKEE COUNTY
            searchBounds: L.latLngBounds([42.84, -87.82], [43.19, -88.07]),
            //allowMultipleResults: false,
            collapseAfterResult: false,
            providers: arcgisOnline
        }).addTo(map);


        // CREATE AN EMPTY LAYER GROUP TO STORE THE RESULTS AND ADD TO MAP
        var results = L.layerGroup().addTo(map);


        // LISTEN FOR RESULTS EVENT AND ADD EVERY RESULT TO THE MAP
        searchControl.on("results", function (data) {

            results.clearLayers();
            for (var i = data.results.length - 1; i >= 0; i--) {
                results.addLayer(L.marker(data.results[i].latlng));

                // Create a popup for each feature
                //                results.eachLayer(function (layer) {
                //                    layer.bindPopup(data.results[i].text);
                //                    layer.openPopup();
                //                })                
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


    // UPDATE OPACITY
    // When the user updates the opacity slider, update the historic maps to the selected opacity
    function updateOpacity(sanborn, currentOpacity) {

        // Select the slider div element
        $('.opacity-slider')

            // When the user updates the slider
            .on('input change', function () {

                // Determine the current opacity
                currentOpacity = Number($(this).val()) / 100;

                // Change the opacity of the Sanborn maps to the current opacity
                sanborn.setOpacity(currentOpacity);

            });
    }

    // REVERSE GEOCODING
    // Right-click a point on the map to get its business name or address
    map.on('contextmenu', function (e) {

        geocodeService.reverse().latlng(e.latlng).run(function (error, result) {
            
            // callback is called with error, result, and raw response.
            // result.latlng contains the coordinates of the located address
            // result.address contains information about the match

            reverseGeocodeMarker = L.marker(result.latlng);
            reverseGeocodeMarker.addTo(map);

            // Build a popup with the match address (business name and address)
            popupContent = result.address.Match_addr;
            
            //console.log(result.address);
            
            // Set the popup content and bind it to the map
            var reverseGeocodeMarkerPopup = L.responsivePopup().setContent(popupContent);
            reverseGeocodeMarker.bindPopup(popupContent).openPopup();
            
            // Move the marker and popup the next time the user right-clicks on the map
            reverseGeocodeMarker.on('popupclose', function (e) {
                    reverseGeocodeMarker.remove();
            });

            // Move the marker and popup the next time the user right-clicks on the map
            map.on('contextmenu', function (e) {
                    reverseGeocodeMarker.remove();
            });
        });
    });

// BRACKET CLOSING THE GETDATA FUNCTION
}





/********************************************************************************/
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
aboutBtn.onclick = function () {
    aboutModal.style.display = "block";
}
dataBtn.onclick = function () {
    dataModal.style.display = "block";
}

// WHEN THE USER CLICKS ON THE <SPAN> (X), CLOSE THE MODAL
aboutSpan.onclick = function () {
    aboutModal.style.display = "none";
}
dataSpan.onclick = function () {
    dataModal.style.display = "none";
}



//*************************************END OF MAIN.JS***********************************/

/* LAST LINE */
//$(document).ready(createMap);
