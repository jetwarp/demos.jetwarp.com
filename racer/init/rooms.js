/* global THREE scene panoMaterial setVecFromLatLon */

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
var cdnPath =
  'https://objects-us-west-1.dream.io/jetwarp-cdn/demos/racer/panos';

var loader = new THREE.TextureLoader();
loader.crossOrigin = 'anonymous';

function populateRoom(roomName) {
  var roomObj = rooms[roomName];
  var roomGroup = new THREE.Object3D();
  var panoMaterial = new THREE.MeshBasicMaterial({
    map: loader.load(cdnPath + roomName + '.jpg')
  });
  var mesh = new THREE.Mesh( roomGeometry, panoMaterial );
  roomGroup.add( mesh );

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
  roomGroup.add(waypointSpheres);
  roomObj.group = roomGroup;
}

Object.keys(rooms).forEach(populateRoom);

var currentRoom;
var currentRoomGroup = new THREE.Object3D();

scene.add(currentRoomGroup);

var raycaster = new THREE.Raycaster();
var centerPoint = new THREE.Vector2(0, 0);

// for reticle hover state
function lookingAtWaypoint(camera) {
  if (currentRoom) {
    raycaster.setFromCamera(centerPoint, camera);
    var intersects = raycaster.intersectObjects(
      rooms[currentRoom].waypointSpheres.children);
    return (intersects.length > 0);
  }
}

function getDestForCameraPoint(camera, point) {
  if (currentRoom) {
    raycaster.setFromCamera(point, camera);
    var intersects = raycaster.intersectObjects(
      rooms[currentRoom].waypointSpheres.children);
    if (intersects.length > 0) {
      return waypointSphereDestinationsByUUID[intersects[0].object.uuid];
    }
  }
}

function loadRoom(roomName) {
  currentRoom = roomName;
  currentRoomGroup.children[0] = rooms[roomName].group;
}

loadRoom('gallery');
