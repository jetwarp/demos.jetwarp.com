/* global THREE scene:true panoMaterial setVecFromLatLon */

var scene;

var rooms = {
  gallery: {
    waypoints: [
      { lat: 0,
        lon: 340,
        dest: 'bar' }
    ]
  },
  bar: {
    waypoints: [
      { lat: 0,
        lon: 180,
        dest: 'backroom' },
      { lat: 0,
        lon: 50,
        dest: 'gallery' }
    ]
  },
  backroom: {
    waypoints: [
      { lat: 0,
        lon: 180,
        dest: 'bar' }
    ]
  }
};

var waypointSphereDestinationsByUUID = {};
var waypointSphereGeometry = new THREE.SphereGeometry(50, 20, 20);
var waypointSphereMaterial = new THREE.MeshBasicMaterial({color: '#ff0000'});
var roomGeometry = new THREE.SphereGeometry(500, 60, 40);
  roomGeometry.scale(-1, 1, 1);

function populateRoom(roomName) {
  var roomObj = rooms[roomName];
  scene = new THREE.Scene();
  var panoMaterial = new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load('panos/' + roomName + '.jpg')
  });
  var mesh = new THREE.Mesh( roomGeometry, panoMaterial );
  scene.add( mesh );

  var waypointSpheres = new THREE.Object3D();
  for (var i = 0; i < roomObj.waypoints.length; i++) {
    var waypoint = roomObj.waypoints[i];
    var waypointSphere = new THREE.Mesh(
      waypointSphereGeometry, waypointSphereMaterial);
    setVecFromLatLon(waypointSphere.position, waypoint.lat, waypoint.lon);
    waypointSphere.updateMatrixWorld();
    waypointSphereDestinationsByUUID[waypointSphere.uuid] = waypoint.dest;
    waypointSpheres.add(waypointSphere);
  }
  roomObj.waypointSpheres = waypointSpheres;
  scene.add(waypointSpheres);
  roomObj.scene = scene;
}

Object.keys(rooms).forEach(populateRoom);

var currentRoom;

var raycaster = new THREE.Raycaster();

// raycasting is no bueno
function getDestForCameraPoint(camera, point) {
  if (currentRoom) {
    raycaster.setFromCamera(point, camera);
    var intersects = raycaster.intersectObjects(
      rooms[currentRoom].waypointSpheres.children);
    if (intersects.length > 0) {
      return waypointSphereDestinationsByUUID[intersects[0].uuid];
    }
  }
}

function getDestForLatLon(lat, lon) {
  if (currentRoom) {
    var waypoints = rooms[currentRoom].waypoints;
    for (var i = 0; i < waypoints.length; i++) {
      var dLat = lat - waypoints[i].lat;
      var dLon = (lon - waypoints[i].lon + 360) % 360;
      if (dLat*dLat + dLon*dLon < 25) {
        return waypoints[i].dest;
      }
    }
  }
}

function loadRoom(roomName) {
  currentRoom = roomName;
  scene = rooms[roomName].scene;
}

loadRoom('gallery');
