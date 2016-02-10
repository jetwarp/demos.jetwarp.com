/* global THREE scene camera */

var container = document.getElementById('container');
var renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

window.addEventListener('resize', function resizeRendererOnWindowResize() {
	renderer.setSize(window.innerWidth, window.innerHeight);
});

function renderScene() {
  renderer.render(scene, camera);
}
