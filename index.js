/* Game of life simulation
    Classical cellular automaton simulation where simple rules gives complex results. Goal was to make mobile friendly application
    More information at https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life
*/

const deviceWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;
const deviceHeight = (window.innerHeight > 0) ? window.innerHeight : screen.height;
const canvasWidth = deviceWidth -50;
const canvasHeight = deviceHeight - 250;
let resolution, cols, rows, currentGen, nextGen, fillcolor, aliveColor, deadColor;
let fps, fpsInterval, startTime, now, then, elapsed;
let randomValue = 0.6;
let evolutionCount = 0;
let changesInGeneration = 0;
let previousChanges = 0;
let toleranceToStop = 100;
let frameCount = 0;
let stop = false;

// Controls 
const buttonPause = document.querySelector('#pause');
buttonPause.addEventListener('click', () =>  stop = !stop);
const buttonReset = document.querySelector('#reset');
buttonReset.addEventListener('click', setupRandomValues);
const buttonResolution = document.querySelector('#res')
buttonResolution.addEventListener('click', changeResolution);
const colorAliveEl = document.querySelector('#alive');
colorAliveEl.addEventListener('input', changeColor);
const colorDeadEl = document.querySelector('#dead');
colorDeadEl.addEventListener('input', changeColor);

// Statistics (show some information about simulation)
const statisticEl = document.querySelector('#statistics');
const stoppedEl = document.querySelector('#morestatistics');

//Initial setup and start animation loop (Make 2d grid for simulation and fill it with random values)
setupGridAndResolution(8);
startAnimating(30);

// Setup canvas for drawing - Todo alter size if windows size is changed
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
canvas.width = canvasWidth;
canvas.height = canvasHeight;

function changeColor() {
    aliveColor = document.querySelector('#alive').value;
    deadColor = document.querySelector('#dead').value;
}

// Make random initial conditions for grid and reset simulation settings
function setupRandomValues() {
    changeColor()
    stoppedEl.innerHTML = `Simulation unstable`;
    toleranceToStop = 100;
    stop = false;
    evolutionCount = 0;
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            currentGen[i][j] = Math.random() < randomValue ? 0 : 1;
        }
    }
    // Copy values to next generation
    copy2dArrayValues(nextGen, currentGen);
}

// initialize the timer variables and start the animation
function startAnimating(fps) {
    fpsInterval = 1000 / fps;
    then = Date.now();
    startTime = then;
    draw();
}


// Draw cells
function draw() {
    requestAnimationFrame(draw);
    now = Date.now();
    elapsed = now - then;
    
    if (elapsed > fpsInterval && !stop) {
        then = now - (elapsed % fpsInterval);
        // Go through all the cells and draw them
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                let value = currentGen[i][j];
                let x = i * resolution;
                let y = j * resolution;
                if (value == 0) {
                    fillcolor = deadColor;
                } else {
                    fillcolor = aliveColor;
                }
                ctx.fillStyle = fillcolor;
                ctx.fillRect(x, y, x + resolution, y + resolution);
            }
        }
    }
    getNextGeneration();
}

// Check neighbors and compute next state according to the rules
// Also check if simulation has become stable - stop if this happens
function getNextGeneration() {
    if (!stop) {
        changesInGeneration = 0;
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                let aliveCount = checkNeighbors(currentGen, i, j);
                // If dead cell and alive neighbors is 3 - cell becomes alive
                if (currentGen[i][j] == 0 && aliveCount == 3) {
                    nextGen[i][j] = 1;
                    changesInGeneration++;
                }
                // If alive cell and neighbors under 2 or over 3 - cell dies
                if (currentGen[i][j] == 1 && (aliveCount < 2 || aliveCount > 3)) {
                    nextGen[i][j] = 0;
                    changesInGeneration++;
                } 
            }
        }
        if (previousChanges == changesInGeneration) {
            toleranceToStop--;
        }
        if (toleranceToStop < 0) {
            stop = true;
            stoppedEl.innerHTML = `Simulation stable at generation ${evolutionCount + 1}`;
        }
    // 
    //
    copy2dArrayValues(currentGen, nextGen);
    evolutionCount++;
    statisticEl.innerHTML = `Generation ${evolutionCount} : Mutations ${changesInGeneration}`;
    previousChanges = changesInGeneration;
    }
}

// Check neighboring cells - return number of alive cells (status = 1)
function checkNeighbors(array, x, y) {
    let alive = 0;
    for (let i = - 1; i < 2; i++) {
        for (let j = -1; j < 2; j++) {

            if (x + i > -1 && x + i < array.length && y + j > -1 && y + 1 < array[0].length) {
                if (array[x + i][y + j] == 1) {
                    alive += 1;
                }
            }
        }
    }
    // Ignore own status if alive
    if (array[x][y] == 1) {
        alive -= 1;
    }
    return alive;
}

// Make nested array to simulate 2D array.
function make2dArray(cols, rows) {
    let arr = new Array(cols);
    for (let i = 0; i < arr.length; i++) {
        arr[i] = new Array(rows);
    }
    return arr;
}

// Copy values between 2D arrays
function copy2dArrayValues(target, source) {
    for (let i = 0; i < target.length; i++) {
        for (let j = 0; j < target[0].length; j++) {
            target[i][j] = source[i][j];
        }
    }
}

// Function to alter resolution in UI
function changeResolution() {
    let input = document.querySelector('#resolution')
    let value = input.value;
    if (value < 1 || value > 20) {
        value = 8;
    }
    setupGridAndResolution(value);
}

// Make grid acording to resolution (Basicly resolution is size of one cell - smaller is more resolution in simulation)
function setupGridAndResolution(value) {
    resolution = value
    cols = Math.floor(canvasWidth / resolution);
    rows = Math.floor(canvasHeight / resolution);
    currentGen = make2dArray(cols, rows);
    nextGen = make2dArray(cols, rows);
    setupRandomValues()
}