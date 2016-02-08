/* global THREE camera chiral */

var isUserInteracting = false,
onMouseDownMouseX = 0, onMouseDownMouseY = 0,
lon = 0, onMouseDownLon = 0,
lat = 0, onMouseDownLat = 0,
phi = 0, theta = 0;

function updateCamera() {
	if ( isUserInteracting === false ) {

		//TODO: drift into gyroscope-based control based on tilt delta?

	}

	lat = Math.max( - 85, Math.min( 85, lat ) );
	phi = THREE.Math.degToRad( 90 - lat );
	theta = THREE.Math.degToRad( lon );

	camera.target.x = 500 * Math.sin( phi ) * Math.cos( theta );
	camera.target.y = 500 * Math.cos( phi );
	camera.target.z = 500 * Math.sin( phi ) * Math.sin( theta );

	camera.lookAt( camera.target );

	// distortion
	camera.position.copy( camera.target ).negate();

}

function onTransform( delta ) {
	lon -= delta.translateX / 10;
	lat += delta.translateY / 10;
	camera.fov /= delta.scale;
	camera.updateProjectionMatrix();
}

chiral(onTransform).attach(window);

function onWheel( event ) {
	if (event.deltaMode == 0) { // pixel delta
		camera.fov += event.deltaY / 5;
	} else { // line (or page) delta
		camera.fov += event.deltaY;
	}
	camera.updateProjectionMatrix();
}

window.addEventListener('wheel', onWheel);
