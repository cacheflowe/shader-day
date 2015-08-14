// global THREE.js/scene elements
var camera, renderer, scene, controls;
var w = window.innerWidth;
var h = window.innerHeight;
var time = 0;

// load shaders and fire up THREE scene once we've completed the async load
var shaders = new ShaderLoader('./shaders', './shaderChunks');
shaders.shaderSetLoaded = function(){
  init();
  animate();
}
shaders.load('vs-ads', 'ads', 'vertex');
shaders.load('fs-ads', 'ads', 'fragment');
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

  // buildLight();
  // buildSphere();
  buildKCSphere();
  buildShaderPlane();

  // fire up the webGL <canvas> renderer and attach it to the DOM
  renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );
}

function buildLight() {
  // add a light
  var light = new THREE.PointLight( 0xff00ff , 3 , 1000 );
  light.position.set( 300 , 300 ,300 );
  scene.add( light );

  // show where the light is with a dummy object
  lightMarker = new THREE.Mesh(
    new THREE.IcosahedronGeometry( 10 , 1 ),
    new THREE.MeshBasicMaterial({ color: light.color })
  );
  light.add( lightMarker );
}

function buildSphere() {
  // create the main sphere for the scene
  var geometry = new THREE.SphereGeometry( 200, 20, 20 );
  geometry.computeVertexNormals();

  var uniforms = {
    ambientLightColor:{ type:"c" , value:new THREE.Color( 0xffffff) },
    diffuseLightColor:{ type:"c" , value:new THREE.Color( 0xffffff ) },
    specularLightColor:{ type:"c" , value:new THREE.Color( 0xffffff ) },

    ambientMaterialColor:{ type:"c" , value:new THREE.Color( 0x000fee ) },
    diffuseMaterialColor:{ type:"c" , value:new THREE.Color( 0xc0aa99 ) },
    specularMaterialColor:{ type:"c" , value:new THREE.Color( 0xff0000 ) },

    shininess:{ type:"f" , value:80 },
    lightPosition:{ type:"v3" , value: new THREE.Vector3( 300 , 300 , 300 ) }
  };

  var material = new THREE.ShaderMaterial({
    uniforms:       uniforms,
    vertexShader:   shaders.vertexShaders.ads,
    fragmentShader: shaders.fragmentShaders.ads,
  });

  var mesh = new THREE.Mesh( geometry, material );
  scene.add( mesh );
}

function buildKCSphere() {
  // variables that will be fed into uniforms for shaders.. how do we know the types?
  window.shader_waveModeTheta = 0; //This is an Integer, value 0-3
  window.shader_waveModeZenith = 0; //This is an Integer, value 0-3
  window.shader_colorPhaseAdjuster = 1.0;  //This is a float, range [-inf,inf].  This is a SHIFT on the color generator.

  window.kc_uniforms = {
    time: { type:"f" , value:""+time/10. },
    waveModeTheta: { type:"i" , value:shader_waveModeTheta },
    waveModeZenith: { type:"i" , value:shader_waveModeZenith },
    colorPhaseAdjuster: { type:"f" , value:shader_colorPhaseAdjuster }
  };

  var geometry = new THREE.SphereGeometry( 200, 420, 420 );   // KRC: I vastly increased the fidelity of the sphere for more accurate vertex displacement.
  geometry.computeVertexNormals();

  var material = new THREE.ShaderMaterial({
    uniforms:       kc_uniforms,
    vertexShader:   shaders.vertexShaders.cupcake,
    fragmentShader: shaders.fragmentShaders.cupcake,
  });

  var mesh = new THREE.Mesh( geometry, material );
  scene.add( mesh );

  window.addEventListener('click', function(){
    //Randomize some uniforms..
    shader_waveModeTheta = Math.floor(Math.random()*4.0); //I happen to know the shader wants range 0-3, how to determine?
    shader_waveModeZenith = Math.floor(Math.random()*4.0); //I happen to know the shader wants range 0-3, how to determine?
    shader_colorPhaseAdjuster = Math.random()*9999.0; //Push the color phase to some random value;
  });
}

function buildShaderPlane() {
  // Create a plane with a generative shader texture.
  // The vUv varying is super important in the fragment shader to display the proper plane perspective here.
  // If the vUv varying is not used, the texture will be *unmasked* by the plane, rather than appear attached to the plane...
  // see: http://mrdoob.github.io/three.js/examples/webgl_shader2.html
  // or http://mrdoob.github.io/three.js/examples/webgl_shader.html for a flat full-screen texture shader display
  // docs: http://threejs.org/docs/#Reference/Materials/ShaderMaterial
  window.planeTextureUniforms = {
    time:{ type:"f" , value:0 }
  };

  var planeMat = new THREE.ShaderMaterial({
    uniforms:       planeTextureUniforms,
    vertexShader:   shaders.vertexShaders.default,
    fragmentShader: shaders.fragmentShaders.dots,
    side: THREE.DoubleSide
  });
  var planeGeom = new THREE.PlaneGeometry(w, h);
  var mesh = new THREE.Mesh(planeGeom, planeMat);
  scene.add( mesh );
}

// render loop
function animate(){
  // increment time for shader updates
  time++;

  // update kris' freaky cupcake sphere
  kc_uniforms.time.value = time/10.;
  kc_uniforms.waveModeTheta.value = shader_waveModeTheta;
  kc_uniforms.waveModeZenith.value = shader_waveModeZenith;
  kc_uniforms.colorPhaseAdjuster.value = shader_colorPhaseAdjuster;
  // update time uniform on generative texture shader
  planeTextureUniforms.time.value = time/100;
  // update camera
  controls.update();
  // render and keep animating
  requestAnimationFrame( animate );
  renderer.render( scene , camera );
}
