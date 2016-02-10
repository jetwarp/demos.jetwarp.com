/* global THREE requestAnimationFrame renderScene updateCamera */

function animate() {
  // TODO: Why is requestAnimationFrame *before* updates?
	requestAnimationFrame( animate );
	update();
}

function update() {
  updateCamera();
  renderScene();
}

animate();
