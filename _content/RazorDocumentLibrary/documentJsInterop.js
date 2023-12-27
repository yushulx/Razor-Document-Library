export function init() {
    return new Promise((resolve, reject) => {
        let script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = '_content/RazorDocumentLibrary/ddn.js';
        script.onload = async () => {
            resolve();
        };
        script.onerror = () => {
            reject();
        };
        document.head.appendChild(script);
    });
}

export function setLicense(license) {
    if (!Dynamsoft) return;
    try {
        Dynamsoft.DDN.DocumentNormalizer.license = license;
    }
    catch (ex) {
        console.error(ex);
    }
}

export async function loadWasm() {
    if (!Dynamsoft) return;
    try {
        await Dynamsoft.DDN.DocumentNormalizer.loadWasm();
    }
    catch (ex) {
        console.error(ex);
    }
}

export async function createDocumentNormalizer() {
    if (!Dynamsoft) return;

    try {
        let normalizer = await Dynamsoft.DDN.DocumentNormalizer.createInstance();
        return normalizer;
    }
    catch (ex) {
        console.error(ex);
    }
    return null;
}

export async function detectCanvas(normalizer, canvas) {
    if (!Dynamsoft) return;

    try {
        let quads = await normalizer.detectQuad(canvas);
        return quads;
    }
    catch (ex) {
        console.error(ex);
    }
    return null;
}

let globalCanvas;
let globalContext;
export async function rectifyCanvas(normalizer, canvas, location) {
    if (!Dynamsoft) return;

    try {
        let points = JSON.parse(location);
        let result = await normalizer.normalize(canvas, { quad: points });
        if (result.image) {
            return result.image.toCanvas();
        }
        else {
            return null;
        }
    }
    catch (ex) {
        console.error(ex);
    }
    return null;
}

export async function showDocumentEditor(dotNetHelper, cbName, elementId, canvas, location) {
    if (!Dynamsoft) return;
    try {
        let parent = document.getElementById(elementId);
        parent.innerHTML = '';

        parent.appendChild(canvas);

        // Create a new canvas element
        globalCanvas = document.createElement('canvas');
        globalCanvas.id = 'overlayCanvas';
        globalCanvas.width = canvas.width; // Match the width of the base canvas
        globalCanvas.height = canvas.height; // Match the height of the base canvas

        // Set positioning to overlay the base canvas
        globalCanvas.style.position = 'absolute';
        globalCanvas.style.left = canvas.offsetLeft + 'px';
        globalCanvas.style.top = canvas.offsetTop + 'px';

        // Add the overlay canvas to the parent of the base canvas
        parent.appendChild(globalCanvas);

        //globalCanvas = canvas;
        globalContext = globalCanvas.getContext("2d");
        let data = JSON.parse(location);
        globalCanvas.addEventListener("mousedown", (event) => updatePoint(event, dotNetHelper, cbName, data.points));
        globalCanvas.addEventListener("touchstart", (event) => updatePoint(event, dotNetHelper, cbName, data.points));
        drawQuad(dotNetHelper, cbName, data.points);
    }
    catch (ex) {
        console.error(ex);
    }
    return null;
}
export async function showRectifiedDocument(elementId, canvas) {
    if (!Dynamsoft) return;

    try {
        let parent = document.getElementById(elementId);
        parent.innerHTML = '';
        parent.appendChild(canvas);
    }
    catch (ex) {
        console.error(ex);
    }
    return null;
}

export async function setFilter(normalizer, filter) {
    if (!Dynamsoft) return;

    try {
        let settings = await normalizer.getRuntimeSettings();
        settings.ImageParameterArray[0].BinarizationModes[0].ThresholdCompensation = 10;
        settings.NormalizerParameterArray[0].ColourMode = filter;
        await normalizer.setRuntimeSettings(settings);
    }
    catch (ex) {
        console.error(ex);
    }
    return null;
}

function updatePoint(e, dotNetHelper, cbName, points) {
    let rect = globalCanvas.getBoundingClientRect();

    let scaleX = globalCanvas.clientWidth / globalCanvas.width;
    let scaleY = globalCanvas.clientHeight / globalCanvas.height;
    let mouseX = (e.clientX - rect.left) / scaleX;
    let mouseY = (e.clientY - rect.top) / scaleY;

    let delta = 10;
    for (let i = 0; i < points.length; i++) {
        if (Math.abs(points[i].x - mouseX) < delta && Math.abs(points[i].y - mouseY) < delta) {
            globalCanvas.addEventListener("mousemove", dragPoint);
            globalCanvas.addEventListener("mouseup", releasePoint);
            globalCanvas.addEventListener("touchmove", dragPoint);
            globalCanvas.addEventListener("touchend", releasePoint);
            function dragPoint(e) {
                let rect = globalCanvas.getBoundingClientRect();
                let mouseX = e.clientX || e.touches[0].clientX;
                let mouseY = e.clientY || e.touches[0].clientY;
                points[i].x = Math.round((mouseX - rect.left) / scaleX);
                points[i].y = Math.round((mouseY - rect.top) / scaleY);
                drawQuad(dotNetHelper, cbName, points);
            }
            function releasePoint() {
                globalCanvas.removeEventListener("mousemove", dragPoint);
                globalCanvas.removeEventListener("mouseup", releasePoint);
                globalCanvas.removeEventListener("touchmove", dragPoint);
                globalCanvas.removeEventListener("touchend", releasePoint);
            }
            break;
        }
    }
}

function drawQuad(dotNetHelper, cbName, points) {
    globalContext.clearRect(0, 0, globalCanvas.width, globalCanvas.height);
    globalContext.strokeStyle = "red";
    for (let i = 0; i < points.length; i++) {
        globalContext.beginPath();
        globalContext.arc(points[i].x, points[i].y, 5, 0, 2 * Math.PI);
        globalContext.stroke();
    }
    globalContext.beginPath();
    globalContext.moveTo(points[0].x, points[0].y);
    globalContext.lineTo(points[1].x, points[1].y);
    globalContext.lineTo(points[2].x, points[2].y);
    globalContext.lineTo(points[3].x, points[3].y);
    globalContext.lineTo(points[0].x, points[0].y);
    globalContext.stroke();
    dotNetHelper.invokeMethodAsync(cbName, { "location": { "points": points } });
}
