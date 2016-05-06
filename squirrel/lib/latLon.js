/* global THREE */

// MAGIC: 500 = the radius of the room globe

function setVecFromLatLon(vec, lat, lon) {
  var phi = THREE.Math.degToRad( 90 - lat );
  var theta = THREE.Math.degToRad( lon );

  vec.x = 500 * Math.sin( phi ) * Math.cos( theta );
  vec.y = 500 * Math.cos( phi );
  vec.z = 500 * Math.sin( phi ) * Math.sin( theta );
}
