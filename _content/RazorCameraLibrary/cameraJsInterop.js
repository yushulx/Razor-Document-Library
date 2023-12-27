export function init() {
    return new Promise((resolve, reject) => {
        let script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = '_content/RazorCameraLibrary/dce.js';
        script.onload = async () => {
            resolve();
        };
        script.onerror = () => {
            reject();
        };
        document.head.appendChild(script);
    });
}

export async function createCameraEnhancer() {
    if (!Dynamsoft) return;

    try {
        let cameraEnhancer = await Dynamsoft.DCE.CameraEnhancer.createInstance();
        return cameraEnhancer;
    }
    catch (ex) {
        console.error(ex);
    }
    return null;
}

export async function getCameras(cameraEnhancer) {
    if (!Dynamsoft) return;

    try {
        return await cameraEnhancer.getAllCameras();
    }
    catch (ex) {
        console.error(ex);
    }
}

export async function openCamera(cameraEnhancer, cameraInfo, dotNetHelper, callback) {
    if (!Dynamsoft) return;

    try {
        await cameraEnhancer.selectCamera(cameraInfo);
        cameraEnhancer.on("played", function () {
            let resolution = cameraEnhancer.getResolution();
            dotNetHelper.invokeMethodAsync(callback, resolution[0], resolution[1]);
        });
        await cameraEnhancer.open();
    }
    catch (ex) {
        console.error(ex);
    }
}

export async function closeCamera(cameraEnhancer) {
    if (!Dynamsoft) return;

    try {
        await cameraEnhancer.close();
    }
    catch (ex) {
        console.error(ex);
    }
}

export async function setVideoElement(cameraEnhancer, elementId) {
    if (!Dynamsoft) return;

    try {
        let element = document.getElementById(elementId);
        element.className = "dce-video-container";
        await cameraEnhancer.setUIElement(element);
    }
    catch (ex) {
        console.error(ex);
    }
}

export function acquireCameraFrame(cameraEnhancer) {
    if (!Dynamsoft) return;

    try {
        let img = cameraEnhancer.getFrame().toCanvas();
        return img;
    }
    catch (ex) {
        console.error(ex);
    }
}

export async function setResolution(cameraEnhancer, width, height) {
    if (!Dynamsoft) return;

    try {
        await cameraEnhancer.setResolution(width, height);
    }
    catch (ex) {
        console.error(ex);
    }
}

export function clearOverlay(cameraEnhancer) {
    if (!Dynamsoft) return;

    try {
        let drawingLayers = cameraEnhancer.getDrawingLayers();
        if (drawingLayers.length > 0) {
            drawingLayers[0].clearDrawingItems();
        }
        else {
            cameraEnhancer.createDrawingLayer();
        }
    }
    catch (ex) {
        console.error(ex);
    }
}

export function drawLine(cameraEnhancer, x1, y1, x2, y2) {
    if (!Dynamsoft) return;

    try {
        let drawingLayers = cameraEnhancer.getDrawingLayers();
        let drawingLayer;
        let drawingItems = new Array(
            new Dynamsoft.DCE.DrawingItem.DT_Line({
                x: x1,
                y: y1
            }, {
                x: x2,
                y: y2
            }, 1)
        )
        if (drawingLayers.length > 0) {
            drawingLayer = drawingLayers[0];
        }
        else {
            drawingLayer = cameraEnhancer.createDrawingLayer();
        }
        drawingLayer.addDrawingItems(drawingItems);
    }
    catch (ex) {
        console.error(ex);
    }
}

export function drawText(cameraEnhancer, text, x, y) {
    if (!Dynamsoft) return;

    try {
        let drawingLayers = cameraEnhancer.getDrawingLayers();
        let drawingLayer;
        let drawingItems = new Array(
            new Dynamsoft.DCE.DrawingItem.DT_Text(text, x, y, 1),
        )
        if (drawingLayers.length > 0) {
            drawingLayer = drawingLayers[0];
        }
        else {
            drawingLayer = cameraEnhancer.createDrawingLayer();
        }
        drawingLayer.addDrawingItems(drawingItems);
    }
    catch (ex) {
        console.error(ex);
    }
}