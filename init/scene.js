/* global THREE */

var camera, scene, mesh;

camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1100 );
camera.target = new THREE.Vector3( 0, 0, 0 );

scene = new THREE.Scene();

var roomGeometry = new THREE.SphereGeometry( 500, 60, 40 );
roomGeometry.scale( - 1, 1, 1 );

var panoMaterial = new THREE.MeshBasicMaterial();

mesh = new THREE.Mesh( roomGeometry, panoMaterial );

scene.add( mesh );
