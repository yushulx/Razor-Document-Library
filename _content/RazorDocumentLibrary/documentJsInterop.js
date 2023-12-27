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
        let result = await normalizer.normalize(canvas, { quad: JSON.parse(location) });
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

export async function showRectifiedDocument(elementId, canvas)
{
    if (!Dynamsoft) return;

    try {
        let parent = document.getElementById(elementId);

        if (parent.firstChild) {
            parent.removeChild(parent.firstChild);
        }
        parent.appendChild(canvas);
    }
    catch (ex) {
        console.error(ex);
    }
    return null;
}

export async function setFilter(normalizer, filter)
{
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

