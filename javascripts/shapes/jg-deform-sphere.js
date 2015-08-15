var JGDeformSphere = function(scene, eqSpreads) {
  var time = 0;
  var timeForward = true;

  var material = new THREE.MeshLambertMaterial({
    color: 0xffff00,
    emissive: 0x000000,
    shininess: 100,
    specular: 0xcccccc
  });

  var sphereSize = 230;
  var sphereDivisor = 20;
  var geometry = new THREE.SphereGeometry(sphereSize, sphereDivisor, sphereDivisor);
  var geometryDefault = new THREE.SphereGeometry(sphereSize, sphereDivisor, sphereDivisor);

  // build mesh
  var mesh = new THREE.Mesh( geometry, material );
  scene.add( mesh );

  function onBeat() {
    timeForward = !timeForward;
  }
  events.on("onBeat", onBeat);

  function update() {
    time += (timeForward) ? 0.001 : -0.001;
    deformVertices();
  }
  events.on("update", update);

  function deformVertices() {
    var numVertices = mesh.geometry.vertices.length;
    var spectrum = AudioHandler.getLevelsData();
    var spectrumSize = spectrum.length;
    var eqSpreadStep = spectrumSize / numVertices;
    var deformAmp = 30;
    for(var i=0; i < numVertices; i++) {
      vertex = mesh.geometry.vertices[i];
      vertexOrig = geometryDefault.vertices[i];
      // vertex.set(
      //   vertexOrig.x + deformAmp * Math.sin(time*i),
      //   vertexOrig.y + deformAmp * Math.cos(time*i),
      //   vertexOrig.z + deformAmp * Math.cos(time*i)
      // );
      vertex.set(
        vertexOrig.x + vertexOrig.x * Math.sin(time*i)/10,
        vertexOrig.y + vertexOrig.y * Math.cos(time*i)/10,
        vertexOrig.z + vertexOrig.z * Math.cos(time*i)/10
      );
    }
    mesh.geometry.verticesNeedUpdate = true;
  }

  return {
    update: update,
    mesh: mesh
  }
};
