var ShaderPlane = function(scene, shaders, w, h) {
  // Create a plane with a generative shader texture.
  // The vUv varying is super important in the fragment shader to display the proper plane perspective here.
  // If the vUv varying is not used, the texture will be *unmasked* by the plane, rather than appear attached to the plane...
  // see: http://mrdoob.github.io/three.js/examples/webgl_shader2.html
  // or http://mrdoob.github.io/three.js/examples/webgl_shader.html for a flat full-screen texture shader display
  // docs: http://threejs.org/docs/#Reference/Materials/ShaderMaterial
  var time = 0;
  var planeTextureUniforms = {
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

  function update() {
    time += 0.01;
    planeTextureUniforms.time.value = time;
  }

  return {
    update: update,
    mesh: mesh
  }
};
