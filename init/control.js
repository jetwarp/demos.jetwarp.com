/* global THREE camera chiral setVecFromLatLon
  getDestForCameraPoint getDestForLatLon loadRoom */

var isUserInteracting = false, target = new THREE.Vector3(0, 0, 0),
  lat = 0, lon = 0;

function setFOV(newFOV) {
  camera.fov = Math.max(1, Math.min(90, newFOV));
  camera.updateProjectionMatrix();
}

function setLatitude(newLat) {
  lat = Math.max(-85, Math.min(85, newLat));
}

function onTransform( delta ) {
  var scale = camera.fov / 360;
  lon -= delta.translateX * scale;
  setLatitude(lat + delta.translateY * scale);
  setFOV(camera.fov / delta.scale);
}

// turned off in favor of VRControl
//chiral(onTransform).attach(window);

function onWheel( event ) {
  if (event.deltaMode == 0) { // pixel delta
    setFOV(camera.fov + event.deltaY / 5);
  } else { // line (or page) delta
    setFOV(camera.fov + event.deltaY);
  }
}

//window.addEventListener('wheel', onWheel);

var mousePoint = new THREE.Vector2();

function onClick( event ) {
  // TODO: raycast at 0,0 in VR mode
  mousePoint.x = (event.clientX / window.innerWidth) * 2 - 1;
  mousePoint.y = (event.clientY / window.innerHeight) * -2 + 1;
  var dest = getDestForCameraPoint(camera, mousePoint);
  if (dest) loadRoom(dest);
}

//TODO: make this on pointerup, when we don't move much
window.addEventListener('click', onClick);

// Apply VR headset positional data to camera.
var controls = new THREE.VRControls(camera);
