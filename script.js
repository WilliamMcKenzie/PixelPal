/**
 * @type HTMLCanvasElement
 */

var curTool = "pencil"
var brushSize = 2
var fillMode = false

document.body.style.cursor = "url('icons/cursor.png'), auto";
if (document.querySelector('.selectedTool')) document.querySelector('.selectedTool').classList.remove('selectedTool')
document.getElementById("pencil").classList.add('selectedTool')

var canvas = document.getElementById("canvas")
var canvasOverlay = document.getElementById("overlay")
var canvasBackground = document.getElementById("canvasBackground")
var canvasSelection = document.getElementById("selection")
var guide = document.getElementById("guide")
var colorInput = document.getElementById("colorInput")
var clearButton = document.getElementById("clearButton")
var toggleGuide = document.getElementById("toggleGuide")

const drawingContext = canvas.getContext("2d")
const overlayContext = canvasOverlay.getContext("2d")
const backgroundContext = canvasBackground.getContext("2d")
const selectionContext = canvasSelection.getContext("2d")
drawingContext.imageSmoothingEnabled = false;

const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)

canvas.width = vh/1.5
canvas.height = vh/1.5

canvasOverlay.width = vh/1.5
canvasOverlay.height = vh/1.5

canvasBackground.width = vh/1.5
canvasBackground.height = vh/1.5

canvasSelection.width = vh/1.5
canvasSelection.height = vh/1.5

var CELL_SIDE_COUNT = 64;
var cellPixelLength = canvas.width / CELL_SIDE_COUNT;
var colorHistory = {};
var usedColors = ["#000000"]
var previewHistory = ["//location", "//prev color"];
let mousePos = { x: undefined, y: undefined };
var previousMousePos
setClearCells()
checkerboard()

function getKeyByValue( value) {
    return Object.keys(colorHistory).filter(key => colorHistory[key] === value);
}

// Set default color
colorInput.value = "#000000"

colorInput.addEventListener("input", () => {
    usedColors.push(colorInput.value)
})

function updateBrushSize(){
    brushSize = parseInt(document.getElementById('brushSize').value)
}

//Set canvas bg color 
drawingContext.fillStyle = "rgba(255, 99, 71, 0)"
drawingContext.fillRect(0, 0, canvas.width, canvas.height)

function checkerboard(){
    var fillColor = "#fff"
    for(var i = 0; i < CELL_SIDE_COUNT; i++){
        for(var k = 0; k < CELL_SIDE_COUNT; k++){

            const startX = i * cellPixelLength
            const startY = k * cellPixelLength

            backgroundContext.fillStyle = fillColor
            backgroundContext.fillRect((startX), (startY), (cellPixelLength), (cellPixelLength))

            fillColor == "#fff" ? fillColor = "#e0e0e0" : fillColor = "#fff"
        } 
        fillColor == "#fff" ? fillColor = "#e0e0e0" : fillColor = "#fff"
    }
}

//make pallet
var colors = document.querySelectorAll(".color")

colors.forEach(color => {
    color.addEventListener('click', () => {
        rgbColor = window.getComputedStyle(color).getPropertyValue("background-color")
        var rgb = rgbColor.replace(/^rgba?\(|\s+|\)$/g, '').split(',');
        colorInput.value = rgbToHex(parseInt(rgb[0]), parseInt(rgb[1]), parseInt(rgb[2]))
        usedColors.push(colorInput.value)

        //set selected
        if (document.querySelector('.selectedColor')) document.querySelector('.selectedColor').classList.remove('selectedColor')
        if (document.querySelector('.selectedInput')) document.querySelector('.selectedInput').classList.remove('selectedInput')
        color.classList.add('selectedColor')
    })
});

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

colorInput.addEventListener('click', () => {
    if (document.querySelector('.selectedColor')) document.querySelector('.selectedColor').classList.remove('selectedColor')
    if (document.querySelector('.selectedInput')) document.querySelector('.selectedInput').classList.remove('selectedInput')
    colorInput.classList.add('selectedInput')
})
function handleCanvasMouseDown(e) {
    if (e.button !== 0) {
        return;
    }

    const canvasBoundingRect = canvas.getBoundingClientRect()
    const x = Math.floor((e.clientX - canvasBoundingRect.left) / cellPixelLength)
    const y = Math.floor((e.clientY - canvasBoundingRect.top) / cellPixelLength)

    fillCell(x, y)
}

function handleToggleGuideChange() {

}

function fillCell() {
    const canvasBoundingRect = canvas.getBoundingClientRect()
    const cellX = Math.floor((mousePos.x - canvasBoundingRect.left) / cellPixelLength)
    const cellY = Math.floor((mousePos.y - canvasBoundingRect.top) / cellPixelLength)

    const startX = cellX * cellPixelLength
    const startY = cellY * cellPixelLength

    drawingContext.fillStyle = colorInput.value
    drawingContext.fillRect(Math.floor(startX), Math.floor(startY), Math.ceil(cellPixelLength*brushSize), Math.ceil(cellPixelLength*brushSize))
    
    for(var i = cellX; i < cellX+brushSize; i++){
        console.log(cellX)
        console.log(brushSize)
        for(var k = cellY; k < cellY+brushSize; k++){
            const cur = i + "_" + k
            colorHistory[cur] = colorInput.value
        } 
    }
}


function deleteCell() {
    const canvasBoundingRect = canvas.getBoundingClientRect()
    const cellX = Math.floor((mousePos.x - canvasBoundingRect.left) / cellPixelLength)
    const cellY = Math.floor((mousePos.y - canvasBoundingRect.top) / cellPixelLength)

    const startX = cellX * cellPixelLength
    const startY = cellY * cellPixelLength

    drawingContext.clearRect(Math.floor(startX), Math.floor(startY), Math.ceil(cellPixelLength*brushSize), Math.ceil(cellPixelLength*brushSize))
    for(var i = cellX; i < cellX+brushSize; i++){
        for(var k = cellY; k < cellY+brushSize; k++){
            const cur = i + "_" + k
            colorHistory[cur] = 'clear'
        } 
    }
}

function bucketFill() {
    const canvasBoundingRect = canvas.getBoundingClientRect()
    const cellX = Math.floor((mousePos.x - canvasBoundingRect.left) / cellPixelLength)
    const cellY = Math.floor((mousePos.y - canvasBoundingRect.top) / cellPixelLength)
    const cur = cellX + "_" + cellY

    const startX = cellX * cellPixelLength
    const startY = cellY * cellPixelLength

    console.log(cur)

    var values = getKeyByValue(colorHistory[cur])

    console.log(brushSize)

    for (var i = 0; i < values.length; i++) {
        var curValue = values[i].split("_")

        colorHistory[values[i]] = colorInput.value

        drawingContext.fillStyle = colorInput.value
        drawingContext.fillRect(Math.floor(curValue[0] * cellPixelLength), Math.floor(curValue[1] * cellPixelLength), Math.ceil(cellPixelLength), Math.ceil(cellPixelLength))
        
        Math.floor(startX), Math.floor(startY), Math.ceil(cellPixelLength*brushSize), Math.ceil(cellPixelLength*brushSize)
    }
}

function eyedropperTool() {
    const canvasBoundingRect = canvas.getBoundingClientRect()
    const cellX = Math.floor((mousePos.x - canvasBoundingRect.left) / cellPixelLength)
    const cellY = Math.floor((mousePos.y - canvasBoundingRect.top) / cellPixelLength)
    const cur = cellX + "_" + cellY

    if (colorHistory[cur]) {
        colorInput.value = colorHistory[cur]
        if (document.querySelector('.selectedColor')) document.querySelector('.selectedColor').classList.remove('selectedColor')
        if (document.querySelector('.selectedInput')) document.querySelector('.selectedInput').classList.remove('selectedInput')
        colorInput.classList.add('selectedInput')
    }
}

function selectionTool(e) {
    const canvasBoundingRect = canvas.getBoundingClientRect()
    const cellX = Math.floor((e.clientX - canvasBoundingRect.left) / cellPixelLength)
    const cellY = Math.floor((e.clientY - canvasBoundingRect.top) / cellPixelLength)
    const cur = cellX + "_" + cellY

    const startX = cellX * cellPixelLength
    const startY = cellY * cellPixelLength

    drawingContext.fillStyle = colorInput.value
    drawingContext.fillRect(Math.floor(startX), Math.floor(startY), Math.ceil(cellPixelLength), Math.ceil(cellPixelLength))

    id = setInterval(() => {
        drawSelection(startX, startY, cellX, cellY, canvasBoundingRect, selectionContext, "temp")
    }, 1)
}

var lastSelection = []


function drawSelection(startX, startY, cellX, cellY, canvasBoundingRect, ctx, status) {

    const cellX2 = Math.floor((mousePos.x - canvasBoundingRect.left) / cellPixelLength)
    const cellY2 = Math.floor((mousePos.y - canvasBoundingRect.top) / cellPixelLength)

    const startX2 = cellX2 * cellPixelLength
    const startY2 = cellY2 * cellPixelLength

    selectionContext.clearRect(0, 0, canvas.width, canvas.height);

    if (status == "final") {
        colorHistory[`${cellX2}_${cellY2}`] = colorInput.value
    }

    ctx.fillStyle = colorInput.value
    ctx.fillRect(Math.floor(startX2), Math.floor(startY2), Math.ceil(cellPixelLength), Math.ceil(cellPixelLength))

    var distancex = 0
    var distancey = 0

    console.log(Math.abs(cellX-cellX2))

    for (var i = 0; i < Math.abs(cellX - cellX2); i++) {

        if (cellX2 < cellX) {
            distancex--
        } else {
            distancex++
        }

        if (status == "final") {
            drawingContext.fillRect(Math.floor(startX + distancex * cellPixelLength), Math.floor(startY2), Math.ceil(cellPixelLength), Math.ceil(cellPixelLength))
            drawingContext.fillRect(Math.floor(startX + distancex * cellPixelLength), Math.floor(startY), Math.ceil(cellPixelLength), Math.ceil(cellPixelLength))
            drawingContext.fillRect(Math.floor(startX2), Math.floor(startY2), Math.ceil(cellPixelLength), Math.ceil(cellPixelLength))
            colorHistory[`${cellX + distancex}_${cellY2}`] = colorInput.value
            colorHistory[`${cellX + distancex}_${cellY}`] = colorInput.value
            colorHistory[`${cellX}_${cellY}`] = colorInput.value
        } else {
            ctx.fillRect((startX + distancex * cellPixelLength), (startY2), (cellPixelLength), (cellPixelLength))
            ctx.fillRect((startX + distancex * cellPixelLength), (startY), (cellPixelLength), (cellPixelLength))
            ctx.fillRect((startX2), (startY2), (cellPixelLength), (cellPixelLength))
        }
    }
    for (var i = 0; i < Math.abs(cellY - cellY2); i++) {

        if (cellY2 < cellY) {
            distancey--
        } else {
            distancey++
        }

        if (status == "final") {
            colorHistory[`${cellX}_${cellY + distancey}`] = colorInput.value
            colorHistory[`${cellX2}_${cellY + distancey}`] = colorInput.value
        }

        ctx.fillRect((startX), (startY + distancey * cellPixelLength), (cellPixelLength), (cellPixelLength))
        ctx.fillRect((startX2), (startY + distancey * cellPixelLength), (cellPixelLength), (cellPixelLength))
    }

    if(status == "final" && fillMode){
        drawingContext.fillRect((startX), (startY), (distancex*cellPixelLength), (distancey*cellPixelLength))
        distancex = 0;
        distancey = 0;

        for (var i = 0; i < Math.abs(cellX - cellX2); i++) {
            distancey = 0;
            if (cellX2 < cellX) {
                distancex--
            } else {
                distancex++
            }
            for (var k = 0; k < Math.abs(cellY - cellY2); k++) {
                console.log(distancex, distancey)
                if (cellY2 < cellY) {
                    distancey--
                } else {
                    distancey++
                }
                colorHistory[`${cellX+distancex}_${cellY+distancey}`] = colorInput.value
            }
        }
    }


    if (status) {
        var values = getKeyByValue(colorInput.value)

        for (var i = 0; i < values.length; i++) {
            var curValue = values[i].split("_")

            colorHistory[values[i]] = colorInput.value

            drawingContext.fillStyle = colorInput.value
            drawingContext.fillRect(Math.floor(curValue[0] * cellPixelLength), Math.floor(curValue[1] * cellPixelLength), Math.ceil(cellPixelLength), Math.ceil(cellPixelLength))
        }
    }

    lastSelection = [startX, startY, cellX, cellY, canvasBoundingRect]
}

function previewAction() {
    curTool == "pencil" ? document.body.style.cursor = "url('icons/pencil_cursor.png'), auto" : curTool == "bucket" ? document.body.style.cursor = "url('icons/bucket_cursor.png'), auto" : curTool == "eraser" ? document.body.style.cursor = "url('icons/eraser_cursor.png'), auto" : curTool == "eyedropper" ? document.body.style.cursor = "url('icons/eyedropper_cursor.png'), auto" : document.body.style.cursor = "url('icons/selection_cursor.png'), auto";

    id = setInterval(() => {
        const canvasBoundingRect = canvasOverlay.getBoundingClientRect()
        const cellX = Math.floor((mousePos.x - canvasBoundingRect.left) / cellPixelLength)
        const cellY = Math.floor((mousePos.y - canvasBoundingRect.top) / cellPixelLength)

        const startX = cellX * cellPixelLength
        const startY = cellY * cellPixelLength


        overlayContext.clearRect(0, 0, canvas.width, canvas.height);

        overlayContext.fillStyle = colorInput.value
        overlayContext.fillRect(Math.floor(startX), Math.floor(startY), Math.ceil(cellPixelLength*brushSize), Math.ceil(cellPixelLength*brushSize))
    }, 1);
}

function setClearCells() {
    document.getElementById('rating').style.visibility = "hidden"
    for (var i = 0; i < CELL_SIDE_COUNT; i++) {
        for (var k = 0; k < CELL_SIDE_COUNT; k++) {
            colorHistory[`${k}_${i}`] = "clear"
        }
        colorHistory[`0_${i}`] = "clear"
    }
}

function newTopic() {
    // banner = document.getElementById("bannerHeader")
    // banner.innerHTML = drawingSubjects[Math.floor(Math.random() * drawingSubjects.length)]
    document.getElementById('rating').style.visibility = "hidden"
    window.alert(`Draw me a ${drawingSubjects[Math.floor(Math.random() * drawingSubjects.length)]}`)
}

function clearCanvas() {
    drawingContext.clearRect(0, 0, canvas.width, canvas.height)
    colorHistory = {}
    setClearCells()
}

function saveCanvas() {
    var savedCanvas = document.getElementById("savedCanvas")
    let downloadLink = document.createElement('a');
    downloadLink.setAttribute('download', `${banner = document.getElementById("bannerHeader").innerHTML}.png`);

    savedCanvas.width = CELL_SIDE_COUNT
    savedCanvas.height = CELL_SIDE_COUNT

    drawPixelArt()

    var dataURL = savedCanvas.toDataURL("image/png");
    let url = dataURL.replace(/^data:image\/png/, 'data:application/octet-stream');
    downloadLink.setAttribute('href', url);
    downloadLink.click();
}

function drawPixelArt() {
    var savedCanvas = document.getElementById("savedCanvas")
    savedCanvas.getContext("2d").clearRect(0, 0, savedCanvas.width, savedCanvas.height)

    usedColors.forEach(color => {

        var values = getKeyByValue(color)
        

        values.forEach(cur => {
            cur = cur.split("_")

            var x = cur[0]
            var y = cur[1]

            savedCanvas.getContext("2d").fillStyle = color
            savedCanvas.getContext("2d").fillRect(x, y, 1, 1)
        });
    });
}

let id = null;
function mouseHolding(e) {
    if (curTool != "selection") {
        id = setInterval(() => curTool == "pencil" ? fillCell() : curTool == "eraser" ? deleteCell() : curTool == "bucket" ? bucketFill() : eyedropperTool(), 1);
    } else {
        selectionTool(e)
        selectionContext.clearRect(0, 0, canvas.width, canvas.height);
        canvasSelection.classList.add("selectionActive")
    }
}
function mouseRelease() {
    if (curTool != "selection") {
        clearInterval(id);
    }
    else {
        clearInterval(id);
        canvasSelection.classList.remove("selectionActive")
        console.log(lastSelection)
        drawSelection(lastSelection[0], lastSelection[1], lastSelection[2], lastSelection[3], canvas.getBoundingClientRect(), drawingContext, "final")
    }
}

function mouseOut() {
    clearInterval(id);
    document.body.style.cursor = "url('icons/cursor.png'), auto"
    overlayContext.clearRect(0, 0, canvas.width, canvas.height);
    canvasSelection.classList.remove("selectionActive")
}


//for pc devices
canvasOverlay.addEventListener("mousedown", mouseHolding)
canvasOverlay.addEventListener("mouseup", () => { mouseRelease() })
canvasOverlay.addEventListener("mouseout", () => {
    mouseOut();
})


//for mobile devices
canvasOverlay.addEventListener("touchstart", mouseHolding)
canvasOverlay.addEventListener("touchend", () => { mouseRelease() })
canvasOverlay.addEventListener("touchcancel", () => {
    mouseOut();
})

document.addEventListener("wheel", function (e) {

    // // get the old value of the translation (there has to be an easier way than this)
    // var oldVal = parseInt(document.getElementById("body").style.transform.replace("translateY(","").replace("px)",""));

    // // to make it work on IE or Chrome
    // var variation = parseInt(e.deltaY);
    
    // update the body translation to simulate a scroll
    document.getElementById('canvas').style.width = `transform: scale(${1.1});`

    canvasOverlay.style.transform = `transform: scale(${1.1});`

    canvasBackground.style.transform = `transform: scale(${1.1});`

    canvasSelection.style.transform = `transform: scale(${1.1});`

    return false;
    
}, true);
window.addEventListener('mousemove', (event) => {
    mousePos = { x: event.clientX, y: event.clientY };
});
canvasOverlay.addEventListener("mouseover", previewAction)


function switchPencil() {
    curTool = "pencil"

    if (document.querySelector('.selectedTool')) document.querySelector('.selectedTool').classList.remove('selectedTool')
    document.getElementById("pencil").classList.add('selectedTool')
}

function switchBucket() {
    curTool = "bucket"

    if (document.querySelector('.selectedTool')) document.querySelector('.selectedTool').classList.remove('selectedTool')
    document.getElementById("bucket").classList.add('selectedTool')
}

function switchEraser() {
    curTool = "eraser"
    document.body.style.cursor = "url('icons/eraser_cursor.png'), auto";

    if (document.querySelector('.selectedTool')) document.querySelector('.selectedTool').classList.remove('selectedTool')
    document.getElementById("eraser").classList.add('selectedTool')
}

function switchEyedropper() {
    curTool = "eyedropper"

    if (document.querySelector('.selectedTool')) document.querySelector('.selectedTool').classList.remove('selectedTool')
    document.getElementById("eyedropper").classList.add('selectedTool')
}

function switchSelect() {
    curTool = "selection"

    if (document.querySelector('.selectedTool')) document.querySelector('.selectedTool').classList.remove('selectedTool')
    document.getElementById("select").classList.add('selectedTool')
}
function switchFill() {
    if(fillMode == true) fillMode = false
    else fillMode = true

    if (document.querySelector('.fillMode')) document.querySelector('.fillMode').classList.remove('fillMode')
    else document.getElementById("fill").classList.add('fillMode')
}


var draggableElements = document.querySelectorAll(".draggable")

draggableElements.forEach(element => {
    let offsetX
    let offsetY

    const move = (e) => {
        element.style.left = `${e.clientX - offsetX}px`;
        element.style.top = `${e.clientY - offsetY}px`;
    }

    element.addEventListener('mousedown', (e) => {
        offsetX = e.clientX - element.offsetLeft
        offsetY = e.clientY - element.offsetTop
        document.addEventListener('mousemove', move)
    })

    document.addEventListener("mouseup", () => {
        document.removeEventListener('mousemove', move)
    })
});

var drawingSubjects = ["Unicorn",
    "Jellyfish",
    "Hammer",
    "Lemon",
    "Cherry",
    "Firetruck",
    "Cactus",
    "Ferris Wheel",
    "Donkey",
    "Tiger",
    "Palm Tree",
    "Dinosaur",
    "Soccer",
    "Rocket",
    "Bicycle",
    "Ice Cream",
    "Cake",
    "Book",
    "Fish",
    "Carrot",
    "Rainbow",
    "Sunset",
    "Castle",
    "Starfish",
    "Moonlight",
    "Train",
    "Camera",
    "Piano",
    "Butterfly",
    "Hamburger",
    "Cupcake",
    "Anchor",
    "Cowboy",
    "Toucan",
    "Vampire",
    "Kangaroo",
    "Elephant",
    "Ghost",
    "Robot",
    "Horse",
    "Lion",
    "Octopus",
    "Snowman",
    "Apple",
    "Bear",
    "Zebra",
    "Flamingo",
    "Pizza",
    "Helicopter",
    "Spider",
    "Sailboat",
    "Banana",
    "Bee",
    "Football",
    "Rocket",
    "Basketball",
    "Balloon",
    "Sunflower",
    "Truck",
    "Crown",
    "Donut",
    "Soccer",
    "Ice Cream",
    "Dragon",
    "Penguin",
    "Caterpillar",
    "Spaceship",
    "Turtle",
    "Rainbow",
    "Dolphin",
    "Unicorn",
    "Guitar",
    "Submarine",
    "Jellyfish",
    "Pirate",
    "Mermaid",
    "Spacesuit",
    "Dinosaur",
    "Cake",
    "Train",
    "Moon",
    "Castle",
    "Fire",
    "Fish",
    "Robot",
    "Tree",
    "Mountain",
    "Beach",
    "Moonlight",
    "Sunset",
    "Ocean",
    "City",
    "Desert",
    "Skyline",
    "Underwater",
    "Countryside",
    "Galaxy",
    "Volcano",
    "Forest",
    "Cave",
    "Waterfall",
    "Space",
    "Jungle",
    "Snowscape",
    "Island",
    "Sunrise",
    "Sunflower",
    "Park",
    "Skyscraper",
    "Night",
    "Farm",
    "Bridge",
    "Cliff",
    "Meadow",
    "Ruins",
    "Lighthouse",
    "Harbor",
    "Rainforest",
    "Carnival",
    "Fairy",
    "Mars",
    "Candy",
    "Alien",
    "Planet",
    "Comet",
    "Asteroid",
    "Satellite",
    "Spaceship",
    "Telescope",
    "Astronaut",
    "Black Hole",
    "Meteor",
    "Rocket",
    "Orbit",
    "Star",
    "Galaxy",
    "Nebula",
    "Constellation",
    "Supernova",
    "Cosmos",
];


