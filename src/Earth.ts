/* Assignment 3: Earthquake Visualization
 * CSCI 4611, Spring 2023, University of Minnesota
 * Instructor: Evan Suma Rosenberg <suma@umn.edu>
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 */ 

import * as gfx from 'gophergfx'
import { EarthquakeMarker } from './EarthquakeMarker';
import { EarthquakeRecord } from './EarthquakeRecord';

export class Earth extends gfx.Transform3
{
    private earthMesh: gfx.MorphMesh;
    private morphDirection: number;
    public globeMode: boolean;

    constructor()
    {
        // Call the superclass constructor
        super();

        this.earthMesh = new gfx.MorphMesh();
        this.morphDirection = 1;
        this.globeMode = false;
    }

    public createMesh() : void
    {
        // Initialize texture: you can change to a lower-res texture here if needed
        // Note that this won't display properly until you assign texture coordinates to the mesh
        this.earthMesh.material.texture = new gfx.Texture('./assets/earth-2k.png');
        
        // This disables mipmapping, which makes the texture appear sharper
        this.earthMesh.material.texture.setMinFilter(true, false);   

        // You can use this variable to define the resolution of your flat map and globe map
        // using a nested loop. 20x20 is reasonable for a good looking sphere, and you don't
        // need to change this constant to complete the base assignment  However,if you want 
        // to use height map or bathymetry data for a wizard bonus, you might need to increase
        // the mesh resolution to get better results.
        const meshResolution = 20;
        
        // Precalculated vertices and normals for the earth plane mesh.
        // After we compute them, we can store them directly in the earthMesh,
        // so they don't need to be member variables.
        const mapVertices: gfx.Vector3[] = [];
        const mapNormals: number[] = [];
        const indices: number[] = [];
        const texCoords: number[] = [];
        const globeVertices: number[] = [];
        const globeNormals: number[] = [];        

        // Part 1: Creating the Flat Map Mesh
        // As a demo, we'll add an rectangle with two triangles.
        // First, we define four vertices at each corner of the earth
        // in latitude and longitude and convert to the coordinates
        // used for the flat map.
        // mapVertices.push(this.convertLatLongToPlane(-90, -180));
        // mapVertices.push(this.convertLatLongToPlane(-90, 180));
        // mapVertices.push(this.convertLatLongToPlane(90, 180));
        // mapVertices.push(this.convertLatLongToPlane(90, -180));

        for(let n = 0; n <= meshResolution; n++) {
            for(let m = 0; m <= meshResolution; m++) {
                const x = n / meshResolution * 180 - 90;
                const y = m / meshResolution * 360 - 180;
                // Degrees to radian
                const x_rad = y * Math.PI / 180;
                const y_rad = x * Math.PI / 180;
                mapVertices.push(new gfx.Vector3(x_rad, y_rad, 0));
                mapNormals.push(0, 0, 1);   // Map is on xy plane, so changed normals to 0,0,1 to make sure

                // Part 2: Texturing the Mesh
                // Again, you should replace the example code below
                // with texture coordinates for the earth mesh.
                // uvs[] in the lecture
                texCoords.push(m / meshResolution, 1 - n / meshResolution);
                
                // Part 3: Creating the Globe Mesh
                // You should compute a new set of vertices and normals
                // for the globe. You will need to also add code in
                // the convertLatLongToSphere() method below.
                const convertToSphere = this.convertLatLongToSphere(x, y);
                globeVertices.push(convertToSphere.x, convertToSphere.y, convertToSphere.z);
                convertToSphere.normalize();
                globeNormals.push(convertToSphere.x, convertToSphere.y, convertToSphere.z);
            }
        }

        // Define indices into the array for the two triangles
    
        // indices.push(0, 1, 2);
        // indices.push(0, 2, 3);
        for(let n = 0; n < meshResolution; n++) {
            for(let m = 0; m < meshResolution; m++) {
                // Clockwise order
                // Upper-side/Right Triangle
                indices.push((meshResolution + 1) * n + m);
                indices.push((meshResolution + 1) * n + m + 1);
                indices.push((meshResolution + 1) * (n + 1) + m);
                // Lower-side/Left Triangle
                indices.push((meshResolution + 1) * n + m + 1);
                indices.push((meshResolution + 1) * (n + 1) + m + 1);
                indices.push((meshResolution + 1) * (n + 1) + m);
            }
        }

        // The flat map normals are always directly outward towards the camera
        mapNormals.push(0, 0, 1);
        mapNormals.push(0, 0, 1);
        mapNormals.push(0, 0, 1);
        mapNormals.push(0, 0, 1);





        // Set all the earth mesh data
        this.earthMesh.setVertices(mapVertices, true);
        this.earthMesh.setNormals(mapNormals, true);
        this.earthMesh.setIndices(indices);
        this.earthMesh.setTextureCoordinates(texCoords);
        this.earthMesh.createDefaultVertexColors();
        // For morphing between the Map and Globe
        this.earthMesh.setMorphTargetVertices(globeVertices);
        this.earthMesh.setMorphTargetNormals(globeNormals);

        // Add the mesh to this group
        this.add(this.earthMesh);
    }

    public update(deltaTime: number) : void
    {
        // Part 4: Morphing Between the Map and Globe
        // The value of this.globeMode will be changed whenever
        // the user selects flat map or globe mode in the GUI.
        // You should use this boolean to control the morphing
        // of the earth mesh, as described in the readme.
        if(this.globeMode == true) {
            this.earthMesh.morphAlpha += this.morphDirection * deltaTime;
            this.earthMesh.morphAlpha = gfx.MathUtils.clamp(this.earthMesh.morphAlpha, 0, 1);
        } else {
            this.earthMesh.morphAlpha += -this.morphDirection * deltaTime;
            this.earthMesh.morphAlpha = gfx.MathUtils.clamp(this.earthMesh.morphAlpha, 0, 1);
        }
    }

    public createEarthquake(record: EarthquakeRecord)
    {
        // Number of milliseconds in 1 year (approx.)
        const duration = 12 * 28 * 24 * 60 * 60;

        // Part 5: Creating the Earthquake Markers
        // Currently, the earthquake is just placed randomly
        // on the plane. You will need to update this code to
        // correctly calculate both the map and globe positions.
        // const mapPosition = new gfx.Vector3(Math.random()*6-3, Math.random()*4-2, 0);
        // const globePosition = new gfx.Vector3(Math.random()*6-3, Math.random()*4-2, 0);
        const mapPosition = this.convertLatLongToPlane(record.latitude, record.longitude);
        const globePosition = this.convertLatLongToSphere(record.latitude, record.longitude);

        const earthquake = new EarthquakeMarker(mapPosition, globePosition, record, duration);

        // Global adjustment to reduce the size. You should probably
        // update this be a more meaningful representation..
        // markers' color
        const minRGB = new gfx.Color(255, 230, 0);  // Yellow
        const maxRGB = new gfx.Color(255, 0, 0);    // Red
        // Multiplied 2 to the normalized magnitude for easier distinction
        const markerColor = gfx.Color.lerp(minRGB, maxRGB, record.normalizedMagnitude*2);
        earthquake.material.setColor(markerColor);
        // markers' scale
        const minRadius = 0.2
        const maxRadius = 4;
        // Radius range - 0.2 + (0 ~ 1) * 3.8 = 0.2 ~ 4
        const markerRad = minRadius + record.normalizedMagnitude * (maxRadius - minRadius);
        earthquake.scale.set(markerRad, markerRad, record.normalizedMagnitude);
        
        // Uncomment this line of code to active the earthquake markers
        this.add(earthquake);
    }

    public animateEarthquakes(currentTime : number)
    {
        // This code removes earthquake markers after their life has expired
        this.children.forEach((quake: gfx.Transform3) => {
            if(quake instanceof EarthquakeMarker)
            {
                const playbackLife = (quake as EarthquakeMarker).getPlaybackLife(currentTime);

                // The earthquake has exceeded its lifespan and should be moved from the scene
                if(playbackLife >= 1)
                {
                    quake.remove();
                }
                // The earthquake positions should be updated
                else
                {
                    // Part 6: Morphing the Earthquake Positions
                    // If you have correctly computed the flat map and globe positions
                    // for each earthquake marker in part 5, then you can simply lerp
                    // between them using the same alpha as the earth mesh.
                    quake.scale.set(quake.magnitude * 0.5, quake.magnitude * 0.5, quake.magnitude * 0.5);
                    quake.position.lerp(quake.mapPosition, quake.globePosition, this.earthMesh.morphAlpha);
                }
            }
        });
    }

    // This convenience method converts from latitude and longitude (in degrees) to a Vector3 object
    // in the flat map coordinate system described in the readme.
    public convertLatLongToPlane(latitude: number, longitude: number): gfx.Vector3
    {
        return new gfx.Vector3(longitude * Math.PI / 180, latitude * Math.PI / 180, 0);
    }

    // This convenience method converts from latitude and longitude (in degrees) to a Vector3 object
    // in the globe mesh map coordinate system described in the readme.
    public convertLatLongToSphere(latitude: number, longitude: number): gfx.Vector3
    {
        // Part 3: Creating the Globe Mesh
        // Add code here to correctly compute the 3D sphere position
        // based on latitude and longitude.
        const x = Math.cos(latitude * Math.PI / 180) * Math.sin(longitude * Math.PI / 180);
        const y = Math.sin(latitude * Math.PI / 180);
        const z = Math.cos(latitude * Math.PI / 180) * Math.cos(longitude * Math.PI / 180);
        return new gfx.Vector3(x, y, z);
    }

    // This function toggles the wireframe debug mode on and off
    public toggleDebugMode(debugMode : boolean)
    {
        this.earthMesh.material.wireframe = debugMode;
    }
}