/* global THREE */

var camera = new THREE.PerspectiveCamera(
	30, window.innerWidth / window.innerHeight, 1, 1100);
camera.target = new THREE.Vector3(0, 0, 0);

window.addEventListener('resize', function resizeCameraWithWindow() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
});
