/* global THREE */

var camera, scene, mesh;

camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1100 );
camera.target = new THREE.Vector3( 0, 0, 0 );

scene = new THREE.Scene();

var geometry = new THREE.SphereGeometry( 500, 60, 40 );
geometry.scale( - 1, 1, 1 );

var material = new THREE.MeshBasicMaterial( {
	map: THREE.ImageUtils.loadTexture( 'panos/gallery.jpg' )
} );

mesh = new THREE.Mesh( geometry, material );

scene.add( mesh );
