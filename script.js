
let world;
fetch('websites-by-country.json').then(r=>r.json()).then(data=>{
  const container=document.getElementById('globeContainer');
  world = new ThreeGlobe()
    .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
    .polygonsData([])
    .rotationSpeed=0.001;

  const renderer=new THREE.WebGLRenderer();
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(45, container.clientWidth/container.clientHeight,0.1,2000);
  camera.position.z=500;
  scene.add(world);

  function animate(){ requestAnimationFrame(animate); world.rotation.y+=0.0005; renderer.render(scene,camera);}
  animate();
});
