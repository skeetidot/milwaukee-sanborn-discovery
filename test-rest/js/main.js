// DECLARE MAP IN GLOBAL SCOPE TO GET SOME THINGS WORKING
var map;



//FUNCTION TO INSTANTIATE LEAFLET MAP
function createMap() {
    map = L.map('map', {
        center: [43.023735, -87.956393],
        zoom: 15,
        minZoom: 15,
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

    var ESRI_Grey = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
        maxZoom: 16
    }).addTo(map);

    //add Sanborn map tiles
    // Wisconsin South State Plane REST Service: https://lio.milwaukeecounty.org/arcgis/rest/services/Historical/Sanborn1910_32054/MapServer
    // Web Mercator REST Service: http://webgis.uwm.edu/arcgisuwm/rest/services/AGSL/SanbornTest/MapServer
    var sanborn = L.tileLayer('http://webgis.uwm.edu/arcgisuwm/rest/services/AGSL/SanbornTest/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'American Geographical Society Library - UWM Libraries',
        tileSize: 256,
        minZoom: 15,
        maxZoom: 19,
        opacity: 0.7
    }).addTo(map);
	
	
    
    //Use JQuery's getJSON() method to load the sheet boundary data asynchronously
    $.getJSON("data/sheet_boundaries_wgs84.json", function (data) {
    
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
            onEachFeature: function(feature, layer) {
                
                layer.on('click', function(e) { 
                    popupContent(feature,layer);    
                });                
            }
            
        }).addTo(map); 


		//SEARCHING BY ADDRESS
		//uses Leaflet geosearch plugin
		//called from index.html in lib/geosearch/geosearch.js
		var geoSearchController = new L.Control.GeoSearch({
			provider: new L.GeoSearch.Provider.Google()
		}).addTo(map);

		
		
		 //what's going in the popup
         function popupContent(feature, layer) {
			 
           // add description field(s) to the popup
		   var sheetname = "<div class= 'item-key'><b>Sheet number:</b></div> <div class='item-value'>" + feature.properties['Sheet_Numb'] + "</div>";
		   var year = "<div class= 'item-key'><b>Publication Year:</b></div><div class='item-value'>" + feature.properties['Publicatio'] + "</div>";
		   var businesses = "<div class= 'item-key'><b>Businesses depicted: </b></div><div class='item-value'>" + feature.properties['Business_P'] + "</div>";
		   var publisher = "<div class= 'item-key'><b>Publisher: </b></div><div class='item-value'>" + feature.properties['Publisher'] + "</div>";
		   var scale = "<div class= 'item-key'><b>Scale: </b></div><div class='item-value'>" + feature.properties['Scale'] + "</div>";
		   var repository = "<div class= 'item-key'><b>Repository: </b></div><div class='item-value'>" + feature.properties['Repository'] + "</div>";
		   var view = '<a href="' + feature.properties['Reference'] + '" target= "_blank">' + 'View item</a>';

		   
		   
		   var info = (sheetname + businesses + year + publisher + scale + repository + view);
		   // sheetBoundaries.bindPopup(info);
		   var popup = L.responsivePopup().setContent(info);
		   sheetBoundaries.bindPopup(popup).openPopup();
	   }

	 });
	
	}
	


$(document).ready(createMap);
