// global THREE.js/scene elements
var camera, renderer, scene, controls;
var kcSphere, kcSphere2, shaderPlane;
var w = window.innerWidth;
var h = window.innerHeight;
var events = new Events();

// load shaders and fire up THREE scene once we've completed the async load
var shaders = new ShaderLoader('./shaders', './shaderChunks');
shaders.shaderSetLoaded = function(){
  init();
  animate();
}
shaders.load('vs-default', 'default', 'vertex');
shaders.load('fs-dots', 'dots', 'fragment');
shaders.load('vs-kc', 'cupcake', 'vertex');
shaders.load('fs-kc', 'cupcake', 'fragment');

function init(){
  // build rotatable camera & scene
  camera = new THREE.PerspectiveCamera( 65 , w/h , 1 , 2000 );
  camera.position.z = 1000;
  controls = new THREE.TrackballControls( camera );
  scene = new THREE.Scene();

  // init custom shapes
  kcSphere = new KCSphere(scene, shaders);
  kcSphere.mesh.position.x = -500;
  kcSphere2 = new KCSphere(scene, shaders);
  kcSphere2.mesh.position.x = 500;
  shaderPlane = new ShaderPlane(scene, shaders, 100, h);

  // fire up the webGL <canvas> renderer and attach it to the DOM
  renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  // init audio player
  AudioHandler.init();
  // AudioHandler.onUseMic();
  AudioHandler.onUseSample('./audio/Scaffolding - Rebuild (Wayne Winters remix).mp3');
}

// render loop
function animate(){
  events.emit('update');
  // update our shapes
  kcSphere.update();
  kcSphere2.update();
  shaderPlane.update();
  // update camera
  controls.update();
  // render and keep animating
  requestAnimationFrame( animate );
  renderer.render( scene , camera );
}
