/* global THREE WebVRManager renderer effect camera lookingAtWaypoint */

// Create a VR manager helper to enter and exit VR mode.
var params = {
  hideButton: false, // Default: false.
  isUndistorted: false // Default: false.
};
var manager = new WebVRManager(renderer, effect, params);

function reticleRing(innerRadius, outerRadius) {
  return new THREE.RingGeometry(innerRadius, outerRadius,
    32, // theta segments
    3, // phi segments
    0, Math.PI * 2 );
}

var reticleGeometry = reticleRing(0.0001, 0.005);
reticleGeometry.morphTargets.push({name: "expansion", vertices:
  reticleRing(0.02, 0.025).vertices});
var reticle = new THREE.Mesh(reticleGeometry, new THREE.MeshBasicMaterial( {
  color: '#ffffff',
  morphTargets: true,
  fog: false,
  //depthWrite: false,
  //depthTest: false
}));

reticle.frustumCulled = false;

reticle.position.set(0, 0, -1);

camera.add(reticle);

function setReticleVisibility(newMode) {
  reticle.visible = (newMode == WebVRManager.Modes.VR);
}

manager.on('modechange', setReticleVisibility);
setReticleVisibility(manager.mode);

var growSpeed = 1/125;
var growSize = 0;

function updateReticle(delta) {
  if (reticle.visible) {
    var accel = delta * growSpeed;

    if (lookingAtWaypoint(camera)) {
      growSize = Math.min(growSize + accel, 1);
    } else {
      growSize = Math.max(growSize - accel, 0);
    }

    reticle.morphTargetInfluences[0] = growSize;
  }
}
