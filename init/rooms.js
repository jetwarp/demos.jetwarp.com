/* global THREE scene panoMaterial setVecFromLatLon */

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

function populateRoom(roomObj) {
  var waypointSpheres = new THREE.Object3D();
  for (var i = 0; i < roomObj.waypoints.length; i++) {
    var waypoint = roomObj.waypoints[i];
    var waypointSphere = new THREE.Mesh(
      waypointSphereGeometry, waypointSphereMaterial);
    setVecFromLatLon(waypointSphere.position, waypoint.lat, waypoint.lon);
    waypointSphereDestinationsByUUID[waypointSphere.uuid] = waypoint.dest;
    waypointSpheres.add(waypointSphere);
  }
  roomObj.waypointSpheres = waypointSpheres;
}

Object.keys(rooms).map(function(name){return rooms[name]})
  .forEach(populateRoom);

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

// now that I think about it we could just have each room be a different scene...
// :effort:
function loadRoom(roomName) {
  if (currentRoom) {
    scene.remove(rooms[currentRoom].waypointSpheres);
  }
  panoMaterial.map = THREE.ImageUtils.loadTexture('panos/' + roomName + '.jpg');
  scene.add(rooms[roomName].waypointSpheres);
  currentRoom = roomName;
}

loadRoom('gallery');
