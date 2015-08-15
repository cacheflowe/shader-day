var KCSphere = function(scene, shaders) {
  // variables that will be fed into uniforms for shaders.. how do we know the types?
  var time = 0;
  var waveModeTheta = 0; //This is an Integer, value 0-3
  var waveModeZenith = 0; //This is an Integer, value 0-3
  var colorPhaseAdjuster = 1.0;  //This is a float, range [-inf,inf].  This is a SHIFT on the color generator.

  var kc_uniforms = {
    time: { type:"f" , value:window.time/10. },
    waveModeTheta: { type:"i" , value:waveModeTheta },
    waveModeZenith: { type:"i" , value:waveModeZenith },
    colorPhaseAdjuster: { type:"f" , value:colorPhaseAdjuster }
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

  function newRandomParams() {
    //Randomize some uniforms..
    waveModeTheta = Math.floor(Math.random()*4.0); //I happen to know the shader wants range 0-3, how to determine?
    waveModeZenith = Math.floor(Math.random()*4.0); //I happen to know the shader wants range 0-3, how to determine?
    colorPhaseAdjuster = Math.random()*9999.0; //Push the color phase to some random value;
  }
  events.on("onBeat", newRandomParams);

  function update() {
    time += 0.1;
    kc_uniforms.time.value = time;
    kc_uniforms.waveModeTheta.value = waveModeTheta;
    kc_uniforms.waveModeZenith.value = waveModeZenith;
    kc_uniforms.colorPhaseAdjuster.value = colorPhaseAdjuster;
  }
  events.on("update", update);

  return {
    update: update,
    mesh: mesh
  }
};
