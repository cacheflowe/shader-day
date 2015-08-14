

// variables that will be fed into uniforms for shaders.. how do we know the types?
var shader_waveModeTheta = 0; //This is an Integer, value 0-3
var shader_waveModeZenith = 0; //This is an Integer, value 0-3
var shader_colorPhaseAdjuster = 1.0;  //This is a float, range [-inf,inf].  This is a SHIFT on the color generator.

//KRC: We should abstract this "uniforms" object to be initialized by our shaders?
var uniforms = {};  // See animation loop for the dynamic setting of uniforms

// Boilerplate stuff
var camera, renderer, scene , controls;
var vs, fs;
var geometry, material;// , light;
var time = 0;








var shaders = new ShaderLoader('./shaders', './shaderChunks');
shaders.shaderSetLoaded = function(){
  init();
  animate();
}
shaders.load('vs-kc', 'cupcake', 'vertex');
shaders.load('fs-kc', 'cupcake', 'fragment');


function init(){
  var w = window.innerWidth;
  var h = window.innerHeight;

  window.onclick = function(event) {
    //Randomize some uniforms.. 
    shader_waveModeTheta = Math.floor(Math.random()*4.0); //I happen to know the shader wants range 0-3, how to determine?
    shader_waveModeZenith = Math.floor(Math.random()*4.0); //I happen to know the shader wants range 0-3, how to determine?
    shader_colorPhaseAdjuster = Math.random()*9999.0; //Push the color phase to some random value;
  }


  camera = new THREE.PerspectiveCamera( 65 , w/h , 1 , 2000 );
  camera.position.z = 1000;

  controls = new THREE.TrackballControls( camera );
  scene = new THREE.Scene();



  //KRC: We don't need to define lights, since fragment color is generative, so I removed these:
/*
  light = new THREE.PointLight( 0xff00ff , 3 , 1000 );
  light.position.set( 300 , 300 ,300 );
  scene.add( light );
*/
/*
  lightMarker = new THREE.Mesh(
    new THREE.IcosahedronGeometry( 10 , 1 ),
    new THREE.MeshBasicMaterial({ color: light.color })
  );
  light.add( lightMarker );
*/

  geometry = new THREE.SphereGeometry( 200, 420, 420 );   // KRC: I vastly increased the fidelity of the sphere for more accurate vertex displacement.
  geometry.computeVertexNormals();

  material = new THREE.ShaderMaterial({
    uniforms:       uniforms,
    vertexShader:   shaders.vertexShaders.cupcake,
    fragmentShader: shaders.fragmentShaders.cupcake,
  });
  //^^^I keep re-setting this material, per frame (below in animation loop).  Is there a better way?

  mesh = new THREE.Mesh( geometry, material );
  scene.add( mesh );
  renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );
}

function animate(){
  requestAnimationFrame( animate );
  controls.update();
  time++;
  uniforms["time"] = { type:"f" , value:""+time/10. };
  uniforms["waveModeTheta"] = { type:"i" , value:shader_waveModeTheta };
  uniforms["waveModeZenith"] = { type:"i" , value:shader_waveModeZenith };
  uniforms["colorPhaseAdjuster"] = { type:"f" , value:shader_colorPhaseAdjuster };


  material = new THREE.ShaderMaterial({
    uniforms:       uniforms,
    vertexShader:   shaders.vertexShaders.cupcake,
    fragmentShader: shaders.fragmentShaders.cupcake,
  });
    mesh.material = material;
  renderer.render( scene , camera );
}
