var data = [];

// Slider Objects
var zValue = document.getElementById("zAxis");
var sliderBar = document.getElementById("slidingBar");

var xyProjection = d3.select('#rectView');
zValue.innerHTML = sliderBar.value;

// bounds of the data
const bounds = {};

// create the containment box.
// This cylinder is only to guide development.
// TODO: Remove after the data has been rendered
const createCylinder = () => {
    // get the radius and height based on the data bounds
    const radius = (bounds.maxX - bounds.minX) / 2.0 + 1;
    const height = (bounds.maxY - bounds.minY) + 1;

    // create a cylinder to contain the particle system
    const geometry = new THREE.CylinderGeometry(radius, radius, height, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0xffff00, wireframe: true });
    const cylinder = new THREE.Mesh(geometry, material);

    // add the containment to the scene
    scene.add(cylinder);
};


//ColorScale
var colorScale = d3.scaleSequential(d3.interpolateCool).domain([0,100]);
var grayScale = d3.scaleSequential(d3.interpolateGreys);


//Plane (from documentation)
var geometryPlane = new THREE.PlaneGeometry( 12, 16 );
var materialPlane = new THREE.MeshBasicMaterial( {side: THREE.DoubleSide, transparent: true,opacity: 0.5 });
var plane = new THREE.Mesh( geometryPlane, materialPlane );
plane.position.set(0,5,0);
scene.add( plane );


// creates the particle system
var geometryParticles = new THREE.BufferGeometry();
var materialParticles = new THREE.PointsMaterial({sizeAttenuation: false,size:0.4, vertexColors: true, opacity:0.6});
var pointCloud = new THREE.Points();

const createParticleSystem = (data) => {
    // draw your particle system here!

    var pointData = [];
    var pointColor = [];

    var i=0;
    while(i<data.length) {
        var point = new THREE.Color(colorScale(data[i].concentration));
        pointColor.push(point.r, point.g, point.b);
        pointData.push(data[i].X, data[i].Y, data[i].Z);
        i++;
    }

    // Add attributes to particles in pointCloud
    geometryParticles.setAttribute('position', new THREE.Float32BufferAttribute(pointData, 3));
    geometryParticles.setAttribute('color', new THREE.Float32BufferAttribute(pointColor, 3));
    
    // Set geometry and material of particles in pointCloud
    pointCloud.geometry = geometryParticles;
    pointCloud.material = materialParticles;
    scene.add(pointCloud);
};


const createXYProjection = (data) => {
    // reset projection
    xyProjection.selectAll('*').remove();
    var pointProj = [];
    var i = 0;
    while(i<data.length) {
        if((data[i].Z >= -0.05) && (data[i].Z < 0.05)) {
            pointProj.push({"X": data[i].X , "Y": data[i].Y , "concentration": data[i].concentration});
        }
        i++;
    };
    var xScale = d3.scaleLinear().domain([bounds.minX, bounds.maxX]).range([0, 400 ]);
    var yScale = d3.scaleLinear().domain([bounds.minY, bounds.maxY]).range([400, 0]);
    xyProjection.selectAll("circles")
    .data(pointProj)
    .join("circle")
    .attr("r", 3)
    .attr("cx", d => {return xScale(d.X);})
    .attr("cy", d => {return yScale(d.Y);})
    .style("fill", d => {return colorScale(d.concentration)});
}

function planeXY(z, data) {
    // reset projection
    xyProjection.selectAll('*').remove();
    var planeColor = [];
    var planePoints = [];
    var i = 0; 
    while(i<data.length) {
        var plane = new THREE.Color();
        if((data[i].Z >= (z - 0.05)) && (data[i].Z < (z + 0.05))){
            planePoints.push({"X": data[i].X , "Y": data[i].Y , "concentration": data[i].concentration});
            plane.set(colorScale(data[i].concentration));
            planeColor.push(plane.r, plane.g, plane.b);
        }
        else {
            plane.set(grayScale(data[i].concentration));
            planeColor.push(plane.r, plane.g, plane.b);
        }
        i++;
    }
    geometryParticles.setAttribute('color', new THREE.Float32BufferAttribute(planeColor, 3));

    var xScale = d3.scaleLinear().domain([bounds.minX, bounds.maxX]).range([0, 400 ]);
    var yScale = d3.scaleLinear().domain([bounds.minY, bounds.maxY]).range([400, 0]);
    xyProjection.selectAll("circles")
    .data(planePoints)
    .join("circle")
    .attr("r", 3)
    .attr("cx", d => {return xScale(d.X);})
    .attr("cy", d => {return yScale(d.Y);})
    .style("fill", d => {return colorScale(d.concentration)});
};


// Slider to Move Z Plane
function sliderZPlane() {
    zValue.innerHTML = sliderBar.value;
    //console.log('Slider Value',sliderBar.value)
    var z_val = parseFloat(sliderBar.value);
    plane.position.z = z_val;
    planeXY(z_val, data);
};


// Reset to Original Configuration
function resetConfiguration() {
    zValue.innerHTML = sliderBar.value = 0;
    plane.position.set(0,5,0);
    createParticleSystem(data);
    createXYProjection(data);
};


const loadData = (file) => {

    // read the csv file
    d3.csv(file).then(function (fileData)
    // iterate over the rows of the csv file
    {
        fileData.forEach(d => {
            // get the min bounds
            bounds.minX = Math.min(bounds.minX || Infinity, d.Points0);
            bounds.minY = Math.min(bounds.minY || Infinity, d.Points2);
            bounds.minZ = Math.min(bounds.minZ || Infinity, d.Points1);

            // get the max bounds
            bounds.maxX = Math.max(bounds.maxX || -Infinity, d.Points0);
            bounds.maxY = Math.max(bounds.maxY || -Infinity, d.Points2);
            bounds.maxZ = Math.max(bounds.maxY || -Infinity, d.Points1);

            // add the element to the data collection
            data.push({
                // concentration density
                concentration: Number(d.concentration),
                // Position
                X: Number(d.Points0),
                Y: Number(d.Points2),
                Z: Number(d.Points1),
                // Velocity
                U: Number(d.velocity0),
                V: Number(d.velocity2),
                W: Number(d.velocity1)
            })
        });
        // draw the containment cylinder
        // TODO: Remove after the data has been rendered
        //createCylinder()


        // create the particle system
        createParticleSystem(data);

        // create the rectangle XY projection 
        createXYProjection(data);
    })


};


loadData('data/058.csv');