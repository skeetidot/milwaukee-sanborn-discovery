// DECLARE MAP IN GLOBAL SCOPE
var map;

// DECLARE DEFAULT OPACITY IN GLOBAL SCOPE
var currentOpacity = 1;


var sheetBoundaries;
var currentAddress;


// DECLARE GLOBAL VARIABLES FOR GEOCODING
var arcgisOnline = L.esri.Geocoding.arcgisOnlineProvider();
var geocodeService = L.esri.Geocoding.geocodeService();


// DECLARE BASEMAPS IN GLOBAL SCOPE

// GREY BASEMAP
var Esri_WorldGrayCanvas = L.tileLayer('https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
    maxZoom: 16
});

// GREY BASEMAP LABELS
var Esri_WorldGrayReference = L.tileLayer('https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
    maxZoom: 16
});

// WORLD IMAGERY (FOR AT DETAILED SCALES)
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
    opacity: 1, // Initial opacity
    attribution: 'American Geographical Society Library, University of Wisconsin-Milwaukee'
});


// SET THE MAP OPTIONS
var mapOptions = {
    center: [43.041734, -87.904980], // centered in Downtown Milwaukee
    zoom: 15,
    minZoom: 11,
    maxZoom: 21,
    maxBounds: L.latLngBounds([42.84, -87.82], [43.19, -88.07]), // panning bounds so the user doesn't pan too far away from Milwaukee
    bounceAtZoomLimits: false, // Set it to false if you don't want the map to zoom beyond min/max zoom and then bounce back when pinch-zooming
    layers: [Esri_WorldGrayCanvas, sanborn] // Set the layers to build into the layer control
}


// CREATE A NEW LEAFLET MAP WITH THE MAP OPTIONS
var map = L.map('map', mapOptions);


// SET THE LAYER CONTROLS

// SET THE BASEMAP
// ONLY INCULDE ONE BASEMAP SO IT IS NOT PART OF THE LAYER LIST
var baseMaps = {
    "Grayscale": Esri_WorldGrayCanvas
};

// SET THE OVERLAYS
var overlayMaps = {
    "1910 Sanborn Maps": sanborn
    // We can add the landmarks layer here when it is ready
};

// ADD THE LAYER CONTROL TO THE MAP
L.control.layers(baseMaps, overlayMaps, {
    collapsed: false // Keep the layer list open
}).addTo(map);


/********************************************************************************/
/* JAVASCRIPT RELATED TO SETTING UP THE OPACITY SLIDER */
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
// END OF OPACITY SLIDER JAVASCRIPT


// Need to aAdd a DOM Event Listener to hide the opacity slider if the Sanborn layer is unchecked
var sanbornCheckbox = $('.leaflet-control-layers-overlays input[type="checkbox"]');

console.log(sanbornCheckbox);
//
//    if (sanbornCheckbox.prop('checked')) {
//        console.log("checked");
//        sliderControl.show();
//    } else {
//        console.log("unchecked");
//        sliderControl.hide();
//    }


// /********************************************************************************/
// /* JAVASCRIPT RELATED TO TOUCH EVENT LIBRARY */
// // direct event
// $('.touch').on('press', function(e) {
//     alert("woo hoo");
// });
//
// // delegated event
// $('.parent').on('press', '.touch', function(e) {
//     alert("woo hoo");
// });
//
// $.Finger = {
//     pressDuration: 300,
//     doubleTapInterval: 300,
//     flickDuration: 150,
//     motionThreshold: 5
// };


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


// FUNCTION TO RETRIEVE DATA AND PLACE IT ON THE MAP (:
function getData(map) {


    // ADD THE BASEMAPS
    map.addLayer(Esri_WorldGrayCanvas);
    map.addLayer(Esri_WorldGrayReference);
    map.addLayer(Esri_WorldImagery);


    // ADD THE SANBORNS
    sanborn.addTo(map);


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

        // USE ARCGIS ONLINE AS A DATA PROVIDER
        // LOOK INTO A SECOND PROVIDER WITH THE BUSINESSES FROM THE SHEET BOUNDARIES
        providers: arcgisOnline

    }).addTo(map);


    // CREATE AN EMPTY LAYER GROUP TO STORE THE RESULTS AND ADD TO MAP
    var results = L.layerGroup().addTo(map);



    /********************************************************************************/
    /* JAVASCRIPT RELATED TO REVERSE GEOCODING -- RIGHT CLICK A POINT AND GET ADDRESS */

    //    map.on('contextmenu', function (e) {
    //
    //        geocodeService.reverse().latlng(e.latlng).run(function (error, result) {
    //
    //            /* CALLBACK IS CALLED WITH ERROR, RESULT & RAW RESPONSE
    //            RESULT.LATLNG CONTAINS THE COORDINATES OF THE LOCATED ADDRESS
    //            RESULT.ADDRESS CONTAINS INFORMATION ABOUT THE MATCH
    //             */
    //
    //            reverseGeocodeMarker = L.marker(result.latlng);
    //            reverseGeocodeMarker.addTo(map);
    //
    //            //BUILD A POPUP WITH THE MATCH ADDRESS (BUSINESS NAME AND ADDRESS)
    //            popupContent = result.address.Match_addr;
    //
    //
    //            //SET THE POPUP CONTENT AND BIND IT TO THE MAP
    //            var reverseGeocodeMarkerPopup = L.responsivePopup().setContent(popupContent);
    //            reverseGeocodeMarker.bindPopup(popupContent).openPopup();
    //
    //            //MOVE THE MARKER & POPUP WHEN THE POPUP CLOSES
    //            reverseGeocodeMarker.on('popupclose', function (e) {
    //                reverseGeocodeMarker.remove();
    //            });
    //
    //            //MOVE THE MARKER & POPUP WHEN THE USER RIGHT-CLICKS ON THE MAP
    //            map.on('contextmenu', function (e) {
    //                reverseGeocodeMarker.remove();
    //            });
    //        });
    //    });


    /********************************************************************************/
    /* TO BE EVALUATED. EITHER GET A BETTER GEOCODER, OR DON'T ADD POINT
    LISTEN FOR RESULTS EVENT AND ADD EVERY RESULT TO THE MAP */
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



    /********************************************************************************/
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


            // LOOP THROUGH EACH FEATURE AND CREATE A POPUP
            onEachFeature: function (feature, layer) {
                layer.on('click', function (e) {
                    //currentAddress = getCurrentAddress(e);

                    //console.log(currentAddress);

                    popupContent(feature, layer, e);
                    //sheetExtent(feature, layer);
                });
            }
        }).addTo(map);

    });

    //    // When the user clicks one of the bridges
    //    sheetBoundaries.on('click', function (e) {
    //        // Create and display the details panel when the user clicks a bridge
    //        createDetailsPanel(bridges, e);
    //    });


    //         function sheetExtent(feature, layer) {
    //             layer.on({
    //                 click: function(e) {
    //                     //calls up the feature clicked on
    //                     var $layer = e.target;
    //        
    //                     var highlightStyle = {
    //                         opacity: 1,
    //                         weight: 5
    //                     };
    //        
    //        
    //                     $layer.bringToFront();
    //                     $layer.setStyle(highlightStyle);
    //                 }
    //             });
    //         }


    function getCurrentAddress(e) {

        geocodeService.reverse().latlng(e.latlng).run(function (error, result) {

            /* CALLBACK IS CALLED WITH ERROR, RESULT & RAW RESPONSE
            RESULT.LATLNG CONTAINS THE COORDINATES OF THE LOCATED ADDRESS
            RESULT.ADDRESS CONTAINS INFORMATION ABOUT THE MATCH
             */

            //BUILD A POPUP WITH THE MATCH ADDRESS (BUSINESS NAME AND ADDRESS)
            currentAddress = result.address.Match_addr;

            return currentAddress;

            // GRAB AND FORMAT SHEET NUMBER, YEAR, BUSINESSES, PUBLISHER, SCALE, REPOSITORY, AND PERMALINK FROM GEOJSON DATA
            var sheetname = "<div class= 'item-key'><b>Sheet number:</b></div> <div class='item-value'>" + feature.properties['Sheet_Numb'] + "</div>";
            var year = "<div class= 'item-key'><b>Publication Year:</b></div><div class='item-value'>" + feature.properties['Publicatio'] + "</div>";
            var businesses = "<div class= 'item-key'><b>Businesses depicted: </b></div><div class='item-value'>" + feature.properties['Business_P'] + "</div>";
            var publisher = "<div class= 'item-key'><b>Publisher: </b></div><div class='item-value'>" + feature.properties['Publisher'] + "</div>";
            var scale = "<div class= 'item-key'><b>Scale: </b></div><div class='item-value'>" + feature.properties['Scale'] + "</div>";
            var repository = "<div class= 'item-key'><b>Repository: </b></div><div class='item-value'>" + feature.properties['Repository'] + "</div>";
            var view = '<a href="' + feature.properties['Reference'] + '" target= "_blank">' + 'View item</a>';


            console.log(feature.properties['Business_P']);


            // CREATE A SUCCINCT VARIABLE WITH ALL THE DATA WE WANT TO PUSH TO THE POPUP
            var info = (sheetname + businesses + repository + view);


            /* PUSH INFO TO POPUP USING RESPONSIVE POPUP PLUGIN SO THAT POPUPS ARE CENTERED ON MOBILE
            EVALUATE EFFICACY OF THIS PLUGIN -- IS THERE SOMETHING MORE EFFECTIVE OUT THERE? */
            var popup = L.responsivePopup().setContent(info);
            sheetBoundaries.bindPopup(popup).openPopup();

        });
    }


    // POPULATE THE POPUP USING ATTRIBUTES FROM THE GEOJSON BOUNDARY DATA
    function popupContent(feature, layer, e) {
        
        geocodeService.reverse().latlng(e.latlng).run(function (error, result) {

            /* CALLBACK IS CALLED WITH ERROR, RESULT & RAW RESPONSE
            RESULT.LATLNG CONTAINS THE COORDINATES OF THE LOCATED ADDRESS
            RESULT.ADDRESS CONTAINS INFORMATION ABOUT THE MATCH
             */
            
            //console.log(result.address);

            //BUILD A POPUP WITH THE MATCH ADDRESS (BUSINESS NAME AND ADDRESS)
            currentAddress = "<div class='item-key'><b>Current Address:</b></div> <div class='item-value'>" + result.address.LongLabel; + "</div>";

        });
        
        var popupCurrentSubheading = "<div class='item-key'><b>THIS LOCATION TODAY</b></div>"        
        
        var popupHistoricSubheading = "<div class='item-key'><b>THIS LOCATION IN 1910</b></div>"

        // GRAB AND FORMAT SHEET NUMBER, YEAR, BUSINESSES, PUBLISHER, SCALE, REPOSITORY, AND PERMALINK FROM GEOJSON DATA
        var sheetname = "<div class= 'item-key'><b>Sanborn Map Sheet Number:</b></div> <div class='item-value'>" + feature.properties['Sheet_Numb'] + "</div>";
        
        var year = "<div class= 'item-key'><b>Publication Year:</b></div><div class='item-value'>" + feature.properties['Publicatio'] + "</div>";
        
        var businesses = "<div class= 'item-key'><b>Nearby Businesses in 1910: </b></div><div class='item-value'>" + feature.properties['Business_P'] + "</div>";
        
        var publisher = "<div class= 'item-key'><b>Publisher: </b></div><div class='item-value'>" + feature.properties['Publisher'] + "</div>";
        
        var scale = "<div class= 'item-key'><b>Scale: </b></div><div class='item-value'>" + feature.properties['Scale'] + "</div>";
        
        var repository = "<div class= 'item-key'><b>Repository: </b></div><div class='item-value'>" + feature.properties['Repository'] + "</div>";
        
        var view = "<div class= 'item-link'>" + '<a href="' + feature.properties['Reference'] + '" target= "_blank">' + 'View item at UWM Libraries</a></div>';

        console.log(feature.properties['Business_P']);

        // CREATE A SUCCINCT VARIABLE WITH ALL THE DATA WE WANT TO PUSH TO THE POPUP
        if (currentAddress == null) {
            var info = (sheetname + businesses + repository + view);
        } else {
            var info = (currentAddress + "<p>" + "<hr>" + "<p>" + sheetname + businesses + repository + view);
        }


        /* PUSH INFO TO POPUP USING RESPONSIVE POPUP PLUGIN SO THAT POPUPS ARE CENTERED ON MOBILE
        EVALUATE EFFICACY OF THIS PLUGIN -- IS THERE SOMETHING MORE EFFECTIVE OUT THERE? */
        var popup = L.responsivePopup().setContent(info);
        sheetBoundaries.bindPopup(popup).openPopup();
    }



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
    //    ANY CODE THAT ENGAGES WITH THE BOUNDARY DATA LATER MUST BE IN THE FUNCTION THAT HAS JUST ENDED*/
    //});


    /********************************************************************************/
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