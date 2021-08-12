
const deviceWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;
const canvasWidth = deviceWidth -50;
const canvasHeight = 400;
let resolution, cols, rows, currentGen, nextGen, fillcolor;

let randomValue = 0.8;
let nextGenReady = true;
let stop = false;


const buttonPause = document.querySelector('#pause');
buttonPause.addEventListener('click', () => {
    stop = !stop;
});

const buttonReset = document.querySelector('#reset');
buttonReset.addEventListener('click', setupRandomValues);

const formEL = document.querySelector('#changeResolution')
formEL.addEventListener('submit', (event) => {
    event.preventDefault();
    setupGridAndResolution(formEL[0].value);
})

setupGridAndResolution(8);

const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
canvas.width = canvasWidth;
canvas.height = canvasHeight;

let frameCount = 0;
let fps, fpsInterval, startTime, now, then, elapsed;
let totalLive = 0;

// Make random initial conditions for grid
function setupRandomValues() {
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            currentGen[i][j] = Math.random() < randomValue ? 0 : 1;
        }
    }
    // Copy values to next generation
    copy2dArrayValues(nextGen, currentGen);
}

setupRandomValues()
startAnimating(60);
// initialize the timer variables and start the animation
function startAnimating(fps) {
    fpsInterval = 1000 / fps;
    then = Date.now();
    startTime = then;
    draw();
}


// Draw grid
function draw() {
    requestAnimationFrame(draw);
    now = Date.now();
    elapsed = now - then;
    
    if (elapsed > fpsInterval && nextGenReady && !stop) {
        then = now - (elapsed % fpsInterval);
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                let value = currentGen[i][j];
                let x = i * resolution;
                let y = j * resolution;
                if (value == 0) {
                    fillcolor = "rgba(0,110,0,255)";
                } else {
                    fillcolor = "rgba(255,255,255,255)"
                }
                ctx.fillStyle = fillcolor;
                ctx.fillRect(x, y, x + resolution, y + resolution);
            }
        }
        nextGenReady = false;
    }
    getNextGeneration();
}


function getNextGeneration() {
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            let aliveCount = checkNeigbors(currentGen, i, j);
            if (currentGen[i][j] == 0 && aliveCount == 3) {
                nextGen[i][j] = 1;
            }
            if (currentGen[i][j] == 1 && (aliveCount < 2 || aliveCount > 3)) {
                nextGen[i][j] = 0;
            } 
        }
    }
    copy2dArrayValues(currentGen, nextGen);
    nextGenReady = true
}

function checkNeigbors(array, x, y) {
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


function make2dArray(cols, rows) {
    let arr = new Array(cols);
    for (let i = 0; i < arr.length; i++) {
        arr[i] = new Array(rows);
    }
    return arr;
}

function copy2dArrayValues(target, source) {
    for (let i = 0; i < target.length; i++) {
        for (let j = 0; j < target[0].length; j++) {
            target[i][j] = source[i][j];
        }
    }
}

function setupGridAndResolution(value) {
    resolution = value
    cols = Math.floor(canvasWidth / resolution);
    rows = Math.floor(canvasHeight / resolution);
    currentGen = make2dArray(cols, rows);
    nextGen = make2dArray(cols, rows);
    setupRandomValues()
}