/***********************************************************
 * kaleidoscope.js
 *
 * Author: Lena Gieseke
 * 
 * Based on: http://beautifulprogramming.com/endless-kaleidoscope/
 *
 * Purpose: Recreating the effect of a 
 *          kaleidoscope by animation the stones,
 *          not rotating the overall shape
 *
 * Usage: 
 *       key 'f|F' -> Fill the whole canvas with
 *                    the hexagon
 *       key 'k|K' -> Show one kaleidoscope only
 *       key 't|T' -> Show the texture only
 *       key 'c|C' -> Camera Texture
 * 
 * Notes: Please note that the code is not
 *        excessively tested.
 * 
 * Changes 181216:
 *        - More code comments
 *        - Camera is turned of after capture
 *        - Texture size aligned to one facet size
 *********************************************************/ 

"use strict";

// The whole kaleidoscope
// (calls StoneCluster)
let gGrid;

//Variable to save which key was pressed last
let gDisplaymode;

// Grabbing the camera capture globally
// as I failed to get it from the p5.MediaElement
let gStream;

let image;

function preload() 
{
    image = loadImage('dogs.png')
}

function setup() 
{
    displayDensity(1);
    colorMode(HSB);
    createCanvas(768, 768, WEBGL);
    background(0, 0, 90);

    gGrid = new Grid();
    gDisplaymode = 1;
}

function draw()
{
    background(0, 0, 100);
    gGrid.show(gDisplaymode);
}

// Capture certain keys to
// control what is displayed
function keyPressed()
{
    if (key == 'f' || key == 'F' ) // Canvas filled with multiple kaleidoscopes
    {
        gDisplaymode = 1;
    }
    else if (key == 'k' || key == 'K' ) // Single kaleidoscope
    {
        gDisplaymode = 2;
    }
    else if (key == 't' || key == 'T' ) // The texture for one facet of the kaleidoscope
    {
        gDisplaymode = 3;
    }
    else if (key == 'c' || key == 'C' ) // You insides the kaleidoscope
    {
        gDisplaymode = 4;
	}
}

class Grid
{

    constructor()
    {
        this.radius = 300;

        // numFacets should be a constant as of now
        // as the canvas filling is only computed for
        // 6 facets
        this.numFacets = 6; 

        // The angle of one facet
        // (at the center point of the kaleidoscope)
        this.angleFacets = radians(360.0/this.numFacets);

        // We need these sizes
        // for repeating the kaleidoscope
        // and fill the canvas
        this.gridWidth;
        this.gridHeight;
        this.texWidth = this.radius;
        this.texHeight;

        // The sizes of the kaleidoscope
        this.computeWidthHeight();

        // Add the stones to the grid
        this.stoneCluster = new StoneCluster(this.radius, this.gridHeight * 0.5); 
        
        this.cam;
    }

    computeWidthHeight()
    {
        // Please refer to the script for
        // a visualization of the geometric
        // setup

        // The height of one facet
        let angle = this.angleFacets * 0.5;
        let h = (this.radius - 1) * cos(angle);
        // The height of the kaleidoscope
        // with 6 facets
        this.gridHeight = h * 2;
        this.texHeight = h;
        
        // The distance to the next 
        // kaleidoscope in that row,
        // which is offset in y by h 
        let a = sqrt((this.radius-1)*(this.radius-1) - h*h);
        this.gridWidth = (this.radius-1) + a;
    }

    fillCanvas()
    { 
        // How many kaleidoscopes fit onto the
        // current canvas?
        let xCount = int(width/this.gridWidth + 1);
        let yCount = int(height/this.gridHeight + 1);
        let yOffset;

        // Iterate over the rows and columns
        for (let y = 0; y <= yCount; y++)
        {
            for (let x = 0; x <= xCount; x++)
            {
                // Every other column, the position
                // of the kaleidoscope has 
                // an offset in y
                if (x % 2 == 0)
                {
                    yOffset = 0;
                }
                else 
                {
                    // The height of one facet
                    yOffset = this.gridHeight * 0.5;
                }

                push();
                     // Move to the upper left corner, it is
                     // easier to start the filling there
                    translate(x - (width * 0.5), y - (height * 0.5)); 

                    // Move the width (r + a/2) of the kaleidoscope in x
                    // and height (2*h) in y
                    translate(x * this.gridWidth, (y * this.gridHeight) + yOffset, 0);
                    this.drawFacets();
                pop();
            }
        }
    }

    drawFacets()
    {
        beginShape(TRIANGLE_FAN);

        // Please refer to the script for
        // a visualization of the geometric
        // setup

        // Center of the triangle fan
        vertex(0, 0, 0, 0.5, 1);

        // Draw the triangles around the center
        for (let i = 0; i < this.numFacets; i++)
        {
            // The first vertex of the triangel on
            // the circumference of the kaleidoscope
            let x1 = cos(this.angleFacets*i) * this.radius;
            let y1 = sin(this.angleFacets*i) * this.radius;

            // The second vertex of the triangel 
            let x2 = cos(this.angleFacets*(i+1)) * this.radius;
            let y2 = sin(this.angleFacets*(i+1)) * this.radius;

            if (i % 2 == 0)
            {
                vertex(x1, y1, 0, 0);
                vertex(x2, y2, 1, 0);
            }
            // every other facet the texture 
            // or better its uvs should be 
            // switched horizontally
            else 
            {
                vertex(x1, y1, 1, 0);
                vertex(x2, y2, 0, 0);
            }
        }
        endShape();
    }

    show(displayMode)
    {
        // Quick & dirty code for a keys to display modes setup
        if(displayMode == 1)
        {
            // In case the last mode was video capturing,
            // stop it now
            this.stopCamCapture();

            // Animate the stones
            this.stoneCluster.update();
            // Use the stoneCluster graphics element
            // as texture
            texture(this.stoneCluster.graphics, this.texWidth, this.texHeight);

            this.fillCanvas();
        }
        else if(displayMode == 2)
        {
            this.stopCamCapture();

            this.stoneCluster.update();
            texture(this.stoneCluster.graphics, this.texWidth, this.texHeight);

            this.drawFacets();
        }
        else if(displayMode == 3)
        {
            this.stopCamCapture();

            this.stoneCluster.update();
            texture(this.stoneCluster.graphics, this.texWidth, this.texHeight);
            
            // Everything but a box leads to a crash.
            // Not sure why.
            box(this.texWidth, this.texHeight); 
        }
        else if(displayMode == 4)
        {
            this.startCamCapture();
            texture(this.cam);
            this.fillCanvas();
        }
    }

    startCamCapture()
    {
        if(!this.cam)
        {
            // Starting the camera capture
            // You don't have to understand the syntax
            // specifics for now
            this.cam = createCapture(VIDEO, pipeStream);

            // Piping the camera stream to a global
            // variable so that I can access it later
            // for stopping it.
            // Couldn't make it work otherwise.
            function pipeStream(stream) 
            {
                gStream = stream;
            };
            this.cam.size(320, 240);
            this.cam.hide();
        }
    }

    stopCamCapture()
    {
        if(this.cam)
        {
            // print('trying to stop this.cam', this.cam);
            // this.cam.src.stop(); // couldn't make this work

            // This stops the camera capture
            // You don't have to understand the syntax
            // specifics for now
            gStream.getTracks().forEach(track => track.stop());
            this.cam = false;
        }
    }
}

class StoneCluster
{

    constructor(w, h)
    {
        this.texWidth = w;
        this.texHeight = h;

        // An off-screen graphics buffer
        // It can be used like a canvas object,
        // hence you can draw on it, transform it, etc.
        // We will use it as texture for one facet
        // of the kaleidoscope
        this.graphics = createGraphics(this.texWidth, this.texHeight, WEBGL);
        this.graphics.colorMode(HSB);
		this.graphics.noStroke();
		
		//TODO
		//this.graphics.texture(image);

        this.angle = 0.5;
        this.translateStep = 0.75;
		this.pos1 = 0;
	
    }

    update()
    {
        this.graphics.background(10,10,10);

        
        // Blue spheres
        this.graphics.push()
            // Rotation around the origin, not the pivot
			// of the box!
			//TODO
			this.graphics.texture(image);
            this.graphics.rotateX(this.angle);
            this.graphics.rotateY(this.angle * 0.75);
            this.graphics.rotateZ(this.angle * 0.5);

           // this.graphics.fill(200,100,50);
            this.graphics.translate(40, 40, 0);
            this.graphics.sphere(100);
            
        this.graphics.pop();

        this.pos1 += this.translateStep;
        // Change the step direction if the position in x
        // is outside of the texture
        if(this.pos1 >= this.graphics.width * 0.5 || this.pos1 <= 0 )
        {
            this.translateStep *= -1;
        }
        
        this.angle += 0.001;

    }
}