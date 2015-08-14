// global THREE.js/scene elements
var camera, renderer, scene, controls;
var w = window.innerWidth;
var h = window.innerHeight;

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

function init(){
  // build rotatable camera & scene
  camera = new THREE.PerspectiveCamera( 65 , w/h , 1 , 2000 );
  camera.position.z = 1000;
  controls = new THREE.TrackballControls( camera );
  scene = new THREE.Scene();

  buildLight();
  buildSphere();
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
  var planeGeom = new THREE.PlaneGeometry(w/2, h/2);
  var mesh = new THREE.Mesh(planeGeom, planeMat);
  scene.add( mesh );
}

// render loop
function animate(){
  // update time uniform on generative texture shader
  planeTextureUniforms.time.value = Math.sin(Date.now()/1000);
  // update camera
  controls.update();
  // render and keep animating
  requestAnimationFrame( animate );
  renderer.render( scene , camera );
}
