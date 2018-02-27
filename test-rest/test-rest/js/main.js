// DECLARE MAP IN GLOBAL SCOPE TO GET SOME THINGS WORKING
var monumentMap;


//FUNCTION TO INSTANTIATE LEAFLET MAP
function createMap(){
  monumentMap = L.map('map',{
    center: [38.35,-96.06],
    zoom: 0,
    maxZoom: 11 // Esri World Imagery basemap doesn't work past this zoom level -- consider looking for another basemap? (Custom one from Mapbox?)
});

  //call getData function
  getData(monumentMap);
};



//FUNCTION TO RETRIEVE DATA AND PLACE IT ON THE MAP (:
function getData(map){

  //add OSM baselayer
  var satellite = L.tileLayer('https://lio.milwaukeecounty.org/arcgis/rest/services/Historical/Sanborn1910_32054/MapServer/tile/{z}/{y}/{x}').addTo(monumentMap);

  //load the data
  jQuery.ajax("data/monuments.geojson",{
    dataType: "json",
    success: function(response){
      //create marker options
      var geojsonMarkerOptions = {
         radius: 7,
         fillColor: "#571d12",
         color: "white",
         weight: 1,
         opacity: 1,
         fillOpacity: 0.9
      };

     //create a Leaflet GeoJSON layer and add it to the map
      var confederateMonuments = L.geoJSON(response.features, {
         pointToLayer: function (feature, latlng){
             //console.log(feature);
             //console.log(latlng);
             return L.circleMarker(latlng, geojsonMarkerOptions);
         },
         onEachFeature: function (feature, layer) {
           layer.on('click', function(e) {
             popupContent(feature, layer);
           });
         }
      }).addTo(map);

      //what's going in the popup
      function popupContent(feature, layer) {
        // add description field(s) to the popup
        var state = "<b>State:</b> <br>" + feature.properties['State'] + "<br>";
        var where = "<b>Where:</b> <br>" + feature.properties['Where'] + "<br>";
        var when = "<b>When: </b><br>" + feature.properties['When'] + "<br>";
        var what = "<b>What:</b> <br>" + feature.properties['What'] + "<br>";
        var mondesc = "<b>Monument description: </b><br>" + feature.properties['Mon_Desc'] + "<br>";
        var more = '<a href="' + feature.properties['More']  + '">' + 'more information</a>';
        var year = "<b>Year installed:</b> <br>" + feature.properties['Year_Inst'] + "<br><br>";
        var info = (state + where + when + what + mondesc + year + more);
        var popup = L.responsivePopup().setContent(info);
        confederateMonuments.bindPopup(popup).openPopup();
        //L.marker([48.850258, 2.351074]).addTo(map).bindPopup(popup);

      }




   }
 });
};


jQuery(document).ready(createMap);
