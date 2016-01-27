/* global THREE requestAnimationFrame renderer scene camera updateCamera */

function animate() {
  // TODO: Why is requestAnimationFrame *before* updates?
	requestAnimationFrame( animate );
	update();
}

function update() {
  updateCamera();
	renderer.render( scene, camera );
}

animate();
