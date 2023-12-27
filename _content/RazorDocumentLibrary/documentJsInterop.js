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

        let overlayCanvas = document.createElement('canvas');
        overlayCanvas.id = 'overlayCanvas';
        overlayCanvas.width = canvas.width; 
        overlayCanvas.height = canvas.height; 
        overlayCanvas.style.position = 'absolute';
        overlayCanvas.style.left = canvas.offsetLeft + 'px';
        overlayCanvas.style.top = canvas.offsetTop + 'px';
        parent.appendChild(overlayCanvas);
        let overlayContext = overlayCanvas.getContext("2d");

        let data = JSON.parse(location);
        overlayCanvas.addEventListener("mousedown", (event) => updatePoint(event, dotNetHelper, cbName, data.points, overlayContext, overlayCanvas));
        overlayCanvas.addEventListener("touchstart", (event) => updatePoint(event, dotNetHelper, cbName, data.points, overlayContext, overlayCanvas));
        drawQuad(dotNetHelper, cbName, data.points, overlayContext, overlayCanvas);
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

function updatePoint(e, dotNetHelper, cbName, points, overlayContext, overlayCanvas) {
    let rect = overlayCanvas.getBoundingClientRect();

    let scaleX = overlayCanvas.clientWidth / overlayCanvas.width;
    let scaleY = overlayCanvas.clientHeight / overlayCanvas.height;
    let mouseX = (e.clientX - rect.left) / scaleX;
    let mouseY = (e.clientY - rect.top) / scaleY;

    let delta = 10;
    for (let i = 0; i < points.length; i++) {
        if (Math.abs(points[i].x - mouseX) < delta && Math.abs(points[i].y - mouseY) < delta) {
            overlayCanvas.addEventListener("mousemove", dragPoint);
            overlayCanvas.addEventListener("mouseup", releasePoint);
            overlayCanvas.addEventListener("touchmove", dragPoint);
            overlayCanvas.addEventListener("touchend", releasePoint);
            function dragPoint(e) {
                let rect = overlayCanvas.getBoundingClientRect();
                let mouseX = e.clientX || e.touches[0].clientX;
                let mouseY = e.clientY || e.touches[0].clientY;
                points[i].x = Math.round((mouseX - rect.left) / scaleX);
                points[i].y = Math.round((mouseY - rect.top) / scaleY);
                drawQuad(dotNetHelper, cbName, points, overlayContext, overlayCanvas);
            }
            function releasePoint() {
                overlayCanvas.removeEventListener("mousemove", dragPoint);
                overlayCanvas.removeEventListener("mouseup", releasePoint);
                overlayCanvas.removeEventListener("touchmove", dragPoint);
                overlayCanvas.removeEventListener("touchend", releasePoint);
            }
            break;
        }
    }
}

function drawQuad(dotNetHelper, cbName, points, overlayContext, overlayCanvas) {
    overlayContext.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    overlayContext.strokeStyle = "red";
    for (let i = 0; i < points.length; i++) {
        overlayContext.beginPath();
        overlayContext.arc(points[i].x, points[i].y, 5, 0, 2 * Math.PI);
        overlayContext.stroke();
    }
    overlayContext.beginPath();
    overlayContext.moveTo(points[0].x, points[0].y);
    overlayContext.lineTo(points[1].x, points[1].y);
    overlayContext.lineTo(points[2].x, points[2].y);
    overlayContext.lineTo(points[3].x, points[3].y);
    overlayContext.lineTo(points[0].x, points[0].y);
    overlayContext.stroke();
    dotNetHelper.invokeMethodAsync(cbName, { "location": { "points": points } });
}
