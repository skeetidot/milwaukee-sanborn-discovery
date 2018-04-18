/********************************************************************************/
// DECLARE GLOBAL VARIABLES
var map,
    currentOpacity = 1, // Default opacity of 100%
    sheetBoundaries,
    searchResultMarker;


/********************************************************************************/
// GEOCODING SERVICES
var arcgisOnline = L.esri.Geocoding.arcgisOnlineProvider();
var geocodeService = L.esri.Geocoding.geocodeService();


/********************************************************************************/
// BASEMAPS AND IMAGE OVERLAYS

// GREY BASEMAP
var Esri_WorldGrayCanvas = L.tileLayer('https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 16
});

// GREY BASEMAP LABELS
var Esri_WorldGrayReference = L.tileLayer('https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 16
});

// WORLD IMAGERY (FOR USE AT DETAILED SCALES)
var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    minZoom: 17,
    maxNativeZoom: 20,
    maxZoom: 21
});

// SANBORN MAPS
var sanborn = L.esri.tiledMapLayer({
    url: 'http://webgis.uwm.edu/arcgisuwm/rest/services/AGSL/SanbornMaps/MapServer',
    maxZoom: 21,
    minZoom: 0,
    opacity: .8, // Initial opacity
    attribution: 'American Geographical Society Library, University of Wisconsin-Milwaukee'
});


///********************************************************************************/
//// LANDMARKS LAYER
//
//var landmarks = L.LayerGroup().addTo(map);



/********************************************************************************/
// INITIALIZE THE MAP

// SET THE MAP OPTIONS
var mapOptions = {
    center: [43.041734, -87.904980], // centered in Downtown Milwaukee
    zoom: 14,
    minZoom: 11,
    maxZoom: 21,
    maxBounds: L.latLngBounds([42.84, -87.82], [43.19, -88.07]), // panning bounds so the user doesn't pan too far away from Milwaukee
    bounceAtZoomLimits: false, // Set it to false if you don't want the map to zoom beyond min/max zoom and then bounce back when pinch-zooming
    layers: [Esri_WorldGrayCanvas, sanborn] // Set the layers to build into the layer control
}

// CREATE A NEW LEAFLET MAP WITH THE MAP OPTIONS
var map = L.map('map', mapOptions);


/********************************************************************************/
// ADD A ZOOM CONTROL AT THE BOTTOM RIGHT
map.zoomControl.setPosition('bottomright');


/********************************************************************************/
// ADD THE LAYER CONTROL

// SET THE BASEMAP
var baseMaps = {
    "Grayscale": Esri_WorldGrayCanvas
    // Only include one basemap so it is not part of the layer list
};

// SET THE OVERLAYS
var overlayMaps = {
    "1910 Sanborn Maps": sanborn
    //"1910 Landmarks": landmarks
};

// ADD THE LAYER CONTROL WITH THE BASEMAP AND OVERLAYS TO THE MAP
var toggleControls = L.control.layers(baseMaps, overlayMaps, {
    collapsed: false // Keep the layer list open
}).addTo(map);


/********************************************************************************/
/* SET UP THE OPACITY SLIDER */

(function () {

    // CREATE A LEAFLET CONTROL OBJECT AND STORE A REFERENCE TO IT IN A VARIABLE
    var sliderControl = L.control({
        position: 'topright',
        bubblingMouseEvents: false
    });

    // WHEN WE ADD THIS CONTROL OBJECT TO THE MAP
    sliderControl.onAdd = function (map) {

        // SELECT AN EXISTING DOM ELEMENT WITH AN ID OF 'OPACTY-SLIDER'
        var slider = L.DomUtil.get("opacity-slider");

        // WHEN THE USER HOVERS OVER THE SLIDER ELEMENT
        L.DomEvent.addListener(slider, 'mouseover', function (e) {
            //PREVENT THE USER FROM DRAGGING THE MAP WHILE THEY ARE HOVERING ON THE OPACITY SLIDER
            map.dragging.disable();
        });

        // WHEN THE USER CLICKS ON THE SLIDER ELEMENT
        L.DomEvent.addListener(slider, 'mouseout', function (e) {
            //ALLOW THE USER TO DRAG THE MAP WHEN THEY MOVE OFF OF THE OPACITY SLIDER
            map.dragging.enable();
        });


        // RETURN THE SLIDER FROM THE ONADD METHOD
        return slider;
    }

    // ADD THE CONTROL OBJECT CONTAINING THE SLIDER ELEMENT TO THE MAP
    sliderControl.addTo(map);

})();


// WHEN SANBORNS ARE DESELECTED, HIDE OPACITY SLIDER
$(".leaflet-control-layers input:checkbox").change(function () {
    var ischecked = $(this).is(':checked');
    if (!ischecked)
        $('.opacity-slider').hide();
});
$(".leaflet-control-layers input:checkbox").change(function () {
    var ischecked = $(this).is(':checked');
    if (ischecked)
        $('.opacity-slider').show();
});

// END OF OPACITY SLIDER JAVASCRIPT


/********************************************************************************/
/* SET UP THE MOBILE TOUCH EVENTS */

function touchHandler(event) {
    var touch = event.changedTouches[0];

    var simulatedEvent = document.createEvent("MouseEvent");
    simulatedEvent.initMouseEvent({
            touchstart: "mousedown",
            touchmove: "mousemove",
            touchend: "mouseup"
        }[event.type], true, true, window, 1,
        touch.screenX, touch.screenY,
        touch.clientX, touch.clientY, false,
        false, false, false, 0, null);

    touch.target.dispatchEvent(simulatedEvent);
    event.preventDefault();
}

function init() {
    document.addEventListener("touchstart", touchHandler, true);
    document.addEventListener("touchmove", touchHandler, true);
    document.addEventListener("touchend", touchHandler, true);
    document.addEventListener("touchcancel", touchHandler, true);
}


/********************************************************************************/
/* CALL GET DATA FUNCTION */
getData(map);

/* CALL GET ABOUT AND DATA BUTTONS FUNCTION */
getAboutAndDataButtons();

// We'll need to move the Sanborn popup out of the getData function. The getData function should just initialize the map.

// Then, we can call an event listener to check which radio button is selected (find or make history). Based on which radio button is selected, call a function where the click either displays the Sanborn info or adds a marker.

addMarker();



/********************************************************************************/
/* FUNCTION TO RETRIEVE DATA AND PLACE IT ON THE MAP (: */

function getData(map) {


    // ADD THE BASEMAPS
    map.addLayer(Esri_WorldGrayCanvas);
    map.addLayer(Esri_WorldGrayReference);
    map.addLayer(Esri_WorldImagery);


    // ADD THE SANBORNS
    sanborn.addTo(map);


    // ADD THE LANDMARKS LAYER
    landmarks = new L.LayerGroup().addTo(map);


    //CALL THE UPDATEOPACITY() FUNCTION TO UPDATE THE MAP AS THE USER MOVES THE YEAR SLIDER
    updateOpacity(sanborn, currentOpacity);


    /********************************************************************************/
    /* JAVASCRIPT RELATED TO SEARCH BAR AND GEOCODING */

    /*SEARCH BAR (BETA VERSION -- EXPLORING BEST ROUTE TO TAKE)
    ADD ESRI LEAFLET SEARCH CONTROL */
    var searchControl = document.getElementById('search')


    // CREATE THE GEOCODING CONTROL AND ADD IT TO THE MAP
    var searchControl = L.esri.Geocoding.geosearch({

        // KEEP THE CONTROL OPEN
        expanded: true,

        // LIMIT SEARCH TO MILWAUKEE COUNTY
        searchBounds: L.latLngBounds([42.84, -87.82], [43.19, -88.07]),

        // KEEP THE CONTROL OPEN AFTER GETTING RESULTS
        collapseAfterResult: false,

        // REQUIRE USERS TO SELECT ONE RESULT
        allowMultipleResults: false,

        // USE ARCGIS ONLINE AS A DATA PROVIDER
        // LOOK INTO A SECOND PROVIDER WITH THE BUSINESSES FROM THE SHEET BOUNDARIES
        providers: arcgisOnline

    }).addTo(map);


    // CREATE AN EMPTY LAYER GROUP TO STORE THE RESULTS AND ADD TO MAP
    var results = L.layerGroup().addTo(map);



    /********************************************************************************/
    /* TO BE EVALUATED. EITHER GET A BETTER GEOCODER, OR DON'T ADD POINT
    LISTEN FOR RESULTS EVENT AND ADD EVERY RESULT TO THE MAP */
    searchControl.on("results", function (data) {

        // IF THERE IS AN EXISTING SEARCH RESULT MARKER, REMOVE IT
        if (searchResultMarker != null) {
            searchResultMarker.remove();
        }


        // LOOP THROUGH ALL SEARCH RESULTS
        for (var i = data.results.length - 1; i >= 0; i--) {

            // CREATE A MARKER AT THE RESULT AND ADD IT TO THE MAP
            searchResultMarker = L.marker(data.results[i].latlng);
            searchResultMarker.addTo(map);

            // BUILD A POPUP WITH THE RESULT ADDRESS AND OPEN IT
            searchResultMarker.bindPopup(data.results[i].text);
            searchResultMarker.openPopup();

            // REMOVE THE MARKER AND POPUP WHEN THE POPUP CLOSES
            searchResultMarker.on('popupclose', function (e) {
                searchResultMarker.remove();
            });

        }
    });



    /******************************************************************************/
    /* JAVASCRIPT TO HIDE SEARCH BAR WHEN POPUPS ARE ENABLED IN MOBILE
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

    /********************************************************************************/
    // USE JQUERY'S GETJSON() METHOD TO LOAD THE SHEET BOUNDARY DATA ASYNCHRONOUSLY
    $.getJSON("data/boundaries_mercator.json", function (data) {

        // CREATE A LEAFLET GEOJSON LAYER FOR THE SHEET BOUNDARIES WITH POPUPS AND ADD TO THE MAP
        sheetBoundaries = L.geoJson(data, {


            // CREATE STYLING FOR THE BOUNDARY LAYER
            style: function (feature) {
                return {
                    color: '#585858', // Stroke Color
                    weight: 2, // Stroke Weight
                    fillOpacity: 0, // Override the default fill opacity
                    opacity: 0 // Border opacity
                };
            },

            onEachFeature: function (feature, layer) {

                layer.on('click', function (e) {
                    // BUILD THE POPUP FOR EACH FEATURE
                    buildPopup(feature, layer, e);
                });

            }

        }).addTo(map);

        // POPULATE THE POPUP USING ATTRIBUTES FROM THE GEOJSON BOUNDARY DATA
        function buildPopup(feature, layer, e) {

            //currentAddress = getCurrentAddress(e);

            var popupCurrentSubheading = "<div class='item-key'><b>THIS LOCATION TODAY</b></div>"

            var popupHistoricSubheading = "<div class='item-key'><b>THIS LOCATION IN 1910</b></div>"

            // GRAB AND FORMAT SHEET NUMBER, YEAR, BUSINESSES, PUBLISHER, SCALE, REPOSITORY, AND PERMALINK FROM GEOJSON DATA
            var sheetname = "<div class= 'item-key'><b>Sheet Number:</b></div> <div class='item-value'>" + layer.feature.properties['Sheet_Numb'] + "</div>";

            var businesses = "<div class= 'item-key'><b>Nearby Businesses in 1910: </b></div><div class='item-value'>" + layer.feature.properties['Business_P'] + "</div>";

            var repository = "<div class= 'item-key'><b>Repository: </b></div><div class='item-value'>" + layer.feature.properties['Repository'] + "</div>";

            var view = "<div class= 'item-link'>" + '<a href="' + layer.feature.properties['Reference'] + '" target= "_blank">' + 'View item in UWM Libraries Digital Collections</a></div>';

            // CREATE A SUCCINCT VARIABLE WITH ALL THE DATA WE WANT TO PUSH TO THE POPUP
            var info = (view + repository + sheetname + businesses);

            /* PUSH INFO TO POPUP USING RESPONSIVE POPUP PLUGIN SO THAT POPUPS ARE CENTERED ON MOBILE
                EVALUATE EFFICACY OF THIS PLUGIN -- IS THERE SOMETHING MORE EFFECTIVE OUT THERE? */
            var popup = L.responsivePopup().setContent(info);

            // BIND THE POPUP TO THE SHEET BOUNDARY AND OPEN IT
            sheetBoundaries.bindPopup(popup).openPopup();
        }
        

        // GET THE CURRENT ADDRESS (NOT CURRENTLY WORKING WITH POPUP)
        function getCurrentAddress(e) {

            geocodeService.reverse().latlng(e.latlng).run(function (error, result) {

                /* CALLBACK IS CALLED WITH ERROR, RESULT & RAW RESPONSE
                RESULT.LATLNG CONTAINS THE COORDINATES OF THE LOCATED ADDRESS
                RESULT.ADDRESS CONTAINS INFORMATION ABOUT THE MATCH
                 */

                //BUILD A POPUP WITH THE MATCH ADDRESS (BUSINESS NAME AND ADDRESS)
                currentAddress = "<div class='item-key'><b>Current Address:</b></div> <div class='item-value'>" + result.address.LongLabel; + "</div>";

            });

        }

    }); // END OF GETJSON







    // function showSheetBoundary(e) {
    //
    //     var sheetextent = {
    //         'opacity': 1
    //     };
    //
    //     map._layers[sheetBoundaries].setStyle(sheetextent);
    // }
    //
    // map.on('popupopen', showSheetBoundary);


    //    /* BRACKET CLOSING ASYNCHRONOUS GETJSON () METHOD
    //    ANY CODE THAT ENGAGES WITH THE BOUNDARY DATA LATER MUST BE IN THE FUNCTION THAT HAS JUST ENDED */
    //});


    /*******************************************************************************/
    /* JAVASCRIPT RELATED TO UPDATING THE HISTORIC MAPS WHEN OPACITY SLIDER IS INITIATED */
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

        //BRACKET CLOSING UPDATE OPACITY
        //WHATEVER FUNCTION IS LAST PLEASE ADD COMMENT DENOTING END OF FUNCTION
        //THIS IS WHERE IT CAN GET CONFUSING
    }


} // BRACKET CLOSING THE GETDATA FUNCTION


function addMarker() {

    landmarks.addTo(map);
    
    console.log("in Add Marker");

    // Select the make history radio button
    var makeHistoryButton = $('#make-history-text');

    console.log(makeHistoryButton);

    makeHistoryButton.on('click', function (e) {
        console.log(makeHistoryButton);
        console.log("clicked Make History");

        map.on('click', function (e) {
            console.log("added a point");
            landmark = L.marker(e.latlng);
            landmark.addTo(landmarks);
        });
        
    });

    //    // When the make history radio button is clicked
    //    $("#make-history-text input:checkbox").change(function () {
    //        var ischecked = $(this).is(':checked');
    //        if (ischecked) {
    //            console.log(makeHistoryButton);
    //            console.log("clicked Make History");
    //            map.on('click', function (e) {
    //                console.log("clicked the map");
    //                L.marker(e.latlng).addTo(map);
    //            });
    //
    //        }
    //    });


}

/********************************************************************************/
/* FUNCTION TO OPEN THE DATA AND ABOUT MODAL WINDOWS */

function getAboutAndDataButtons() {
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


}


/********************************************************************************/
/* END OF MAIN.JS */