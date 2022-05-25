"use strict";

function onLoad() {
  loadBusStops()
}

function loadBusStops() {
  var xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      let res = JSON.parse(xhttp.responseText)
      console.log(res.features)

      var meineKarte = L.map('karte').setView([51.162290, 10.462739], 6);
      var osm = new L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(meineKarte);


      for (let i = 0; i < res.features.length; i++) { 
        var marker = new L.marker([res.features[i].geometry.coordinates[1], res.features[i].geometry.coordinates[0]]);
        marker.addTo(meineKarte);
        marker.bindPopup("Name: " + res.features[i].properties.lbez)
      }

      document.getElementById("getLocationBtn").addEventListener("click",
        () => {
          var x = document.getElementById("userPosition");
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition);
          }

          else {
            x.innerHTML = "Geolocation is not supported by this browser.";
          }
        }
      );

      document.getElementById("refreshBtn").addEventListener("click",
        () => {
          let positionGeoJSON = document.getElementById("userPosition").value
          positionGeoJSON = JSON.parse(positionGeoJSON)
          let point = positionGeoJSON.features[0].geometry.coordinates;
          console.log(point[1], point[0])

          var circle = new L.circle([point[1], point[0]], 100, {
            color: 'red',
            fillColor: '#f03',
            fillOpacity: 0.5
          }).addTo(meineKarte);
          circle.bindPopup("My position");
          circle.openPopup();
        }
      );



    }
  }
  xhttp.open("GET", "https://rest.busradar.conterra.de/prod/haltestellen", true)
  xhttp.send()
}

function twoPointDistance(start, end) {
  //variable declarations
  var earthRadius; //the earth radius in meters
  var phi1;
  var phi2;
  var deltaLat;
  var deltaLong;

  var a;
  var c;
  var distance; //the distance in meters

  //function body
  earthRadius = 6371e3; //Radius
  phi1 = toRadians(start[1]); //latitude at starting point. in radians.
  phi2 = toRadians(end[1]); //latitude at end-point. in radians.
  deltaLat = toRadians(end[1] - start[1]); //difference in latitude at start- and end-point. in radians.
  deltaLong = toRadians(end[0] - start[0]); //difference in longitude at start- and end-point. in radians.

  a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) + Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLong / 2) * Math.sin(deltaLong / 2);
  c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  distance = earthRadius * c;

  return distance;
}

function toRadians(degrees) {
  var pi = Math.PI;
  return degrees * (pi / 180);
}

function showPosition(position) {
  var x = document.getElementById("userPosition");
  //"Skeleton" of a valid geoJSON Feature collection
  let outJSON = { "type": "FeatureCollection", "features": [] };
  //skelly of a (point)feature
  let pointFeature = { "type": "Feature", "properties": {}, "geometry": { "type": "Point", "coordinates": [] } };
  pointFeature.geometry.coordinates = [position.coords.longitude, position.coords.latitude];
  //add the coordinates to the geoJson
  outJSON.features.push(pointFeature);
  x.innerHTML = JSON.stringify(outJSON);
}
