/* global performance requestAnimationFrame controls manager scene camera */

(function(){
function update(delta) {
  // Update VR headset position and apply to camera.
  controls.update();
}

// Request animation frame loop function
var lastRender = 0;
function animate(timestamp) {
  var delta = Math.min(timestamp - lastRender, 500);
  lastRender = timestamp;

  update(delta);

  // Render the scene through the manager.
  manager.render(scene, camera, timestamp);

  requestAnimationFrame(animate);
}

// Kick off animation loop
animate(performance ? performance.now() : Date.now());
})();
