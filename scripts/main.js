
"use strict";


var mymap = L.map('mapid').setView([50.75383, -3.4552], 9);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
  attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
  maxZoom: 18,
  id: 'mapbox.satellite', //'mapbox.mapbox-terrain-v2', //'mapbox.mapbox-streets-v7', //'mapbox.satellite',  
  accessToken: 'pk.eyJ1IjoiaGFubmFmb3JkNzEwODMiLCJhIjoiY2l5bmZqYWtkMDA1ZTJ4b3R4cGVmejJ6ayJ9.PupbEer7jX54vXHQI9i2YA'
}).addTo(mymap);

regenerateMap("AllMotorVehicles");

function regenerateMap( vehicle) {
  //console.log("trafficData: ", trafficData[year][6023][vehicle]);
  for (var i in roadsData) {
    var _road = roadsData[i];
    var latlngs = []
    for (var j in _road) {
      var point = _road[j];
      var cp = point.CP;

      var marker = L.circle([point.long, point.lat], { color: '#fff000', fillOpacity: 1, fillColor: '#fff000', fill: 'true', radius: 200 }).addTo(mymap);
      marker.cp = cp;
      marker.point = point;
      marker.bindPopup("Road: <b>" + point.road + "</b>" 
        //"<br>" + vehicle + " : " + traffic
         + "<br> C.P:\n <b>" + point.CP + "<b>"
        ).openPopup();
      marker.on('mouseover', function (e) {
        updateYearlyVehicleVol(this.cp, vehicle)
        document.querySelector(".details-road").textContent = this.point.road;
        //updatePointDetails(this.point);
        this.openPopup();
      });
      latlngs.push([point.long, point.lat]);
    }
    var polyline = L.polyline(latlngs, { color: '#fff000' }).addTo(mymap);
  }

} //regenerateMap


function updatePointDetails(point) {
  console.log(point)
  document.querySelector(".details-cp").textContent = point.cp;
  document.querySelector(".details-start-junc").textContent = point.StartJunction;
  document.querySelector(".details-end-junc").textContent = point.EndJunction;
  document.querySelector(".details-east").textContent = point.Easting;
  document.querySelector(".details-north").textContent = point.PedalCycle;
}

function updateSelectMenu() {
  var vehicle = document.querySelector("#vehicle").value;
  regenerateMap(vehicle);
}


function updateYearlyVehicleVol(cp, vehicle) {

  var traffic = crossfilter(trafficData)
  var trafficFilter = traffic.dimension(function (d) { return d.cp; });
  trafficFilter.filterExact([cp]);
  var topCpTraffic = trafficFilter.top(Infinity);
  //for (var i in topCpTraffic) {   console.log(topCpTraffic[i]);  }
  updatePointDetails(topCpTraffic[0]);
  var cpPerYearDim = traffic.dimension(function (d) { return d.year; });
  var cpPerYearGroup = cpPerYearDim.group().reduceSum(function (d) { return Math.round( d[vehicle]); });
  var volYearChart = dc.lineChart('#cp-vol-v-year');

  volYearChart
    .renderArea(true)
    .width(500)
    .height(200)
    .transitionDuration(1000)
    .margins({ top: 30, right: 50, bottom: 25, left: 40 })
    .dimension(cpPerYearDim) 
    .x(d3.scaleLinear().domain([2000, 2017]))
    .elasticY(true)
    .renderHorizontalGridLines(true)
    .legend(dc.legend().x(0).y(10).itemHeight(13).gap(5))
    .brushOn(false)
    .group(cpPerYearGroup, 'CP: '+ cp + ' , Vehicle: ' + vehicle + ' Yearly Vol')

  dc.renderAll();

}
