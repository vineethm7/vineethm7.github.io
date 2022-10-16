
// Canvas
const canvas = document.querySelector('canvas.scene');

// Scene
const scene = new THREE.Scene();
//scene.background = new THREE.Color('#D3D3D3');

// Lights
const light = new THREE.DirectionalLight(0xffffff, 0.1);
light.position.set(0,2,20);
scene.add(light);

// Sizes
const sizes = {
    width: window.innerWidth * 0.5,
    height: window.innerHeight * 0.75
};

window.addEventListener('resize', () =>
{
    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
});


// Camera setup
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000 );
camera.position.set(-10,0,25);
camera.lookAt(0,0,0);
scene.add(camera);



//  Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
});
renderer.setSize(sizes.width, sizes.height);
// sets up the background color
renderer.setClearColor(0x000000);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));


const controls = new THREE.OrbitControls( camera, renderer.domElement );

// Animate
const animate = () =>
{
    // Call animate for each frame
    window.requestAnimationFrame( animate );
    // required if controls.enableDamping or controls.autoRotate are set to true
	controls.update();
    renderer.render(scene, camera);
};

animate();