var JGAudioSphere = function(scene, eqSpreads) {
  var time = 0;
  var eqSpreads = eqSpreads || false;

  var material = new THREE.MeshLambertMaterial({
    color: 0x00ffff,
    emissive: 0x000000,
    shininess: 100,
    specular: 0xcccccc
  });

  var sphereSize = 230;
  var sphereDivisor = 20;
  var geometry = new THREE.SphereGeometry(sphereSize, sphereDivisor, sphereDivisor);
  var geometryDefault = new THREE.SphereGeometry(sphereSize, sphereDivisor, sphereDivisor);

  // build mesh and mesh origin
  var mesh = new THREE.Mesh( geometry, material );
  scene.add( mesh );

  function onBeat() {

  }
  events.on("onBeat", onBeat);

  function update() {
    updateVerticesWithSpectrum();
  }
  events.on("update", update);

  function updateVerticesWithSpectrum() {
    var numVertices = mesh.geometry.vertices.length;
    var spectrum = AudioHandler.getLevelsData();
    var spectrumSize = spectrum.length;
    var eqSpreadStep = spectrumSize / numVertices;

    for(var i=0; i < numVertices; i++) {
      // map eq band count to vertex count
      var iWrapped = 0;
      if(eqSpreads == false) {
        // wrap the spectrum
        iWrapped = i % spectrumSize;
      } else {
        // spread the spectrum across all vertices
        iWrapped = Math.floor(i * eqSpreadStep);
      }

      // deform from original vertex;
      vertex = mesh.geometry.vertices[i];
      vertexOrig = geometryDefault.vertices[i];
      vertex.set(
        vertexOrig.x + vertexOrig.x * spectrum[iWrapped],
        vertexOrig.y + vertexOrig.y * spectrum[iWrapped],
        vertexOrig.z + vertexOrig.z * spectrum[iWrapped]
      );
    }
    mesh.geometry.verticesNeedUpdate = true;
  }

  return {
    update: update,
    mesh: mesh
  }
};
