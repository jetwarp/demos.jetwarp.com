/* global THREE */

// MAGIC: 500 = the radius of the room globe

function setVecFromLatLon(vec, lat, lon) {
  var phi = THREE.Math.degToRad( 90 - lat );
  var theta = THREE.Math.degToRad( lon );

  vec.x = Math.sin( phi ) * Math.cos( theta );
  vec.y = Math.cos( phi );
  vec.z = Math.sin( phi ) * Math.sin( theta );

  return vec;
}
