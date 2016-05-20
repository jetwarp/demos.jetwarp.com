/* global THREE scene panoMaterial setVecFromLatLon
  location fetch Loquate jsyaml canwrap camera */

var scene;

var roomMap = new Map();

var roomRadius = 4096;
var roomGeometry = new THREE.SphereGeometry(roomRadius, 60, 40);
  roomGeometry.scale(-1, 1, 1);
var cdnPath;

var loader = new THREE.TextureLoader();
loader.crossOrigin = 'anonymous';

var plateWidth = 512;
var titleFont = '800 40px Open Sans';
var bodyFont = '400 20px Open Sans';
var plateMargin = 12;
// These next two are admittedly kind of clumsy
var titleLineHeight = 40;
var bodyLineHeight = 25;

var bgFillStyle = 'rgba(224, 224, 224, 0.875)';
var textFillStyle = 'black';

var plateTextWidth = plateWidth - plateMargin * 2;

// The pixels-to-world-units scale for the geometry
var plateScale = 0.25;
// How far away to place plates
var plateDistance = 128;

function nextPowerOfTwo(x) {
  return Math.pow(2, Math.ceil(Math.log(x) / Math.log(2)));
}

function makePlate(plate) {
  // TODO: figure out a way for each plate to not need its own canvas
  // see https://github.com/jetwarp/demos.jetwarp.com/issues/6
  var plateRenderCanvas = document.createElement('canvas');
  plateRenderCanvas.width = plateWidth;
  var ctx = plateRenderCanvas.getContext('2d');
  var textWrapper = new canwrap(ctx);
  // TODO: only split lines once
  // (this is a change that would need to happen in canwrap upstream)
  ctx.font = bodyFont;
  var bodyLineCount = textWrapper.splitLines(
    plate.body, plateTextWidth).length;
  var bodyTop = plate.title ? titleLineHeight + plateMargin * 2 : plateMargin;

  var plateHeight = bodyTop + bodyLineCount * bodyLineHeight + plateMargin;
  plateRenderCanvas.height = nextPowerOfTwo(plateHeight);

  // TODO: Probably not this, when using shader for background
  // https://github.com/jetwarp/demos.jetwarp.com/issues/7

  // NOTE: This globalCompositeOperation trickery is kind of redundant
  // when we're not reusing the canvas, since it should start empty anyway,
  // but we're doing it anyway Because It's The Right Thing To Do
  ctx.globalCompositeOperation = 'copy';
  ctx.fillStyle = bgFillStyle;
  ctx.fillRect(0, 0, plateRenderCanvas.width, plateRenderCanvas.height);
  ctx.globalCompositeOperation = 'source-over';

  ctx.fillStyle = textFillStyle;

  // TODO: Text rendering should probably block
  // until we're sure the font is ready
  ctx.font = bodyFont;
  textWrapper.fillWrappedText(
    plate.body, plateMargin, bodyTop + bodyLineHeight,
    plateTextWidth, bodyLineHeight);

  if (plate.title) {
    ctx.font = titleFont;
    ctx.fillText(plate.title, plateMargin, plateMargin + titleLineHeight,
      // because we want the title to fit one line
      plateTextWidth);
  }

  var plateGeometry = new THREE.PlaneGeometry(
    plateWidth * plateScale, plateHeight * plateScale);

  // Cut the UVs so they end at the bottom of the texture
  // TODO: Maybe scale the texture instead? Depends on how issue #6 shakes out
  var uvs = plateGeometry.faceVertexUvs[0]
  uvs[0][1].y = uvs[1][0].y = uvs[1][1].y =
    1 - plateHeight / plateRenderCanvas.height;

  var plateTexture = new THREE.Texture(plateRenderCanvas);
  // For some reason we need to update the texture we just created
  // https://github.com/mrdoob/three.js/issues/8939
  plateTexture.needsUpdate = true;

  var plateMaterial = new THREE.MeshBasicMaterial({map: plateTexture});
  plateMaterial.transparent = true;

  var plateMesh = new THREE.Mesh(plateGeometry, plateMaterial);
  setVecFromLatLon(plateMesh.position, plate.lat, plate.lon)
    .multiplyScalar(plateDistance);
  plateMesh.lookAt(camera.position);

  return plateMesh;
}

var waypointDistance = 512;

var waypointSphereDestinationsByUUID = {};
var waypointSphereGeometry = new THREE.SphereGeometry(50, 20, 20);
var waypointSphereMaterial = new THREE.MeshBasicMaterial({color: '#ff0000'});

function makeWaypointSphere(waypoint) {
  var waypointSphere = new THREE.Mesh(
    waypointSphereGeometry, waypointSphereMaterial);
  setVecFromLatLon(waypointSphere.position, waypoint.lat, waypoint.lon)
    .multiplyScalar(waypointDistance);
  return waypointSphere;
}

function populateRoom(roomObj) {
  var roomName = roomObj.room;
  roomMap.set(roomName, roomObj);
  var roomGroup = new THREE.Object3D();
  var panoMaterial = new THREE.MeshBasicMaterial({
    map: loader.load(cdnPath + 'panos/' + roomName + '.jpg')
  });
  var mesh = new THREE.Mesh( roomGeometry, panoMaterial );
  roomGroup.add( mesh );

  if (roomObj.waypoints) {
    var waypointSpheres = new THREE.Object3D();
    for (var i = 0; i < roomObj.waypoints.length; i++) {
      var waypoint = roomObj.waypoints[i];
      var waypointSphere = makeWaypointSphere(waypoint);
      waypointSphereDestinationsByUUID[waypointSphere.uuid] = waypoint.dest;
      waypointSpheres.add(waypointSphere);
    }
    roomObj.waypointSpheres = waypointSpheres;
    roomGroup.add(waypointSpheres);
  }

  if (roomObj.plates) {
    var plateGroup = new THREE.Object3D();
    for (var i = 0; i < roomObj.plates.length; i++) {
      var plate = roomObj.plates[i];
      var plateMesh = makePlate(plate);
      setVecFromLatLon(waypointSphere.position, waypoint.lat, waypoint.lon)
        .multiplyScalar(waypointDistance);
      plateGroup.add(plateMesh);
    }
    roomGroup.add(plateGroup);
  }

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
