/* global THREE scene panoMaterial setVecFromLatLon
  location fetch Loquate jsyaml */

var scene;

var roomMap = new Map();

var waypointSphereDestinationsByUUID = {};
var waypointSphereGeometry = new THREE.SphereGeometry(50, 20, 20);
var waypointSphereMaterial = new THREE.MeshBasicMaterial({color: '#ff0000'});
var roomGeometry = new THREE.SphereGeometry(500, 60, 40);
  roomGeometry.scale(-1, 1, 1);
var cdnPath;

var loader = new THREE.TextureLoader();
loader.crossOrigin = 'anonymous';

function populateRoom(roomObj) {
  var roomName = roomObj.room;
  roomMap.set(roomName, roomObj);
  var roomGroup = new THREE.Object3D();
  var panoMaterial = new THREE.MeshBasicMaterial({
    map: loader.load(cdnPath + 'panos/' + roomName + '.jpg')
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

function populateRooms(doc) {
  doc.rooms.forEach(populateRoom);
  return loadRoom(doc.rooms[0].room);
}

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
      roomMap.get(currentRoom).waypointSpheres.children);
    return (intersects.length > 0);
  }
}

function getDestForCameraPoint(camera, point) {
  if (currentRoom) {
    raycaster.setFromCamera(point, camera);
    var intersects = raycaster.intersectObjects(
      roomMap.get(currentRoom).waypointSpheres.children);
    if (intersects.length > 0) {
      return waypointSphereDestinationsByUUID[intersects[0].object.uuid];
    }
  }
}

function loadRoom(roomName) {
  currentRoom = roomName;
  currentRoomGroup.children[0] = roomMap.get(roomName).group;
}

// init from location hash

if (location.hash.slice(0,2) == '#?') {
  var hashq = Loquate(location.hash.slice(2));
  if (hashq.from) {
    cdnPath = hashq.from;
    if (cdnPath.slice(-1) != '/') {
      cdnPath += '/';
    }
    fetch(cdnPath + 'world.yaml')
      .then(function(res) {
        return res.text();
      }).then(function(body){
        return populateRooms(jsyaml.safeLoad(body));
      });
  }
}