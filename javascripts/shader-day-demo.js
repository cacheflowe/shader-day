// lots based on & borrowed from: view-source:http://www.airtightinteractive.com/demos/js/uberviz/wordproblems/
// global THREE.js/scene elements
var camera, renderer, scene, controls;
var kcSphere, jgAudioSphere, jgDeformSphere;
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

  // add lights for jg spheres...
  var directionalLight = new THREE.DirectionalLight( 0xffffff );
  directionalLight.position.set( 0, 0, 1 ).normalize();
  scene.add( directionalLight );


  // init custom shapes
  kcSphere = new KCSphere(scene, shaders);
  kcSphere.mesh.scale.set(0.8,0.8,0.8);
  jgAudioSphere = new JGAudioSphere(scene);
  jgAudioSphere.mesh.position.x = -500;
  jgAudioSphere.mesh.scale.set(0.5,0.5,0.5);
  jgDeformSphere = new JGDeformSphere(scene);
  jgDeformSphere.mesh.position.x = 500;
  jgDeformSphere.mesh.scale.set(0.5,0.5,0.5);
  shaderPlane = new ShaderPlane(scene, shaders, w, h);
  shaderPlane.mesh.position.z = -500;

  // fire up the webGL <canvas> renderer and attach it to the DOM
  renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  // init audio player
  AudioHandler.init(32);
  AudioHandler.onUseMic();
  // AudioHandler.onUseSample('./audio/Scaffolding - Rebuild (Wayne Winters remix).mp3');
  events.emit('onBeat');
  window.addEventListener('click', function(){ events.emit('onBeat'); });
}

// render loop
function animate(){
  events.emit('update');
  // update camera
  controls.update();
  // render and keep animating
  requestAnimationFrame( animate );
  renderer.render( scene , camera );
}
