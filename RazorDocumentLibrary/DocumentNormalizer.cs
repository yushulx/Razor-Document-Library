using Microsoft.JSInterop;
using System.Text.Json;

namespace RazorDocumentLibrary
{
    public class DocumentNormalizer
    {
        // Fields to hold JavaScript object references.
        private IJSObjectReference _module;
        private IJSObjectReference _jsObjectReference;

        /// <summary>
        /// Initializes a new instance of the DocumentNormalizer class.
        /// </summary>
        /// <param name="module">A reference to the JavaScript module.</param>
        /// <param name="normalizer">A reference to the JavaScript object for document normalization.</param>
        public DocumentNormalizer(IJSObjectReference module, IJSObjectReference normalizer)
        {
            _module = module;
            _jsObjectReference = normalizer;
        }

        /// <summary>
        /// Asynchronously detect document edges from a canvas object.
        /// </summary>
        /// <param name="canvas">A reference to the JavaScript object representing the canvas with the document image.</param>
        /// <returns>A task that represents the asynchronous edge detection. The task result contains the coordinates of the detected edges.</returns>
        public async Task<List<Quadrilateral>> DetectCanvas(IJSObjectReference canvas)
        {
            JsonElement? quads = await _module.InvokeAsync<JsonElement>("detectCanvas", _jsObjectReference, canvas);
            return Quadrilateral.WrapResult(quads);
        }

        /// <summary>
        /// Asynchronously rectify a document image from a canvas object based on the detected edges.
        /// </summary>
        /// <param name="canvas">A reference to the JavaScript object representing the canvas with the document image.</param>
        /// <param name="location">The location of the document image.</param>
        /// <returns>A task that represents the asynchronous rectification. The task result contains a reference to the JavaScript object representing the rectified canvas.</returns>
        public async Task<IJSObjectReference> RectifyCanvas(IJSObjectReference canvas, string location)
        {
            IJSObjectReference? rectifiedDocument = await _module.InvokeAsync<IJSObjectReference>("rectifyCanvas", _jsObjectReference, canvas, location);
            return rectifiedDocument;
        }

        public async Task ShowRectifiedDocument(string elementId, IJSObjectReference rectifiedDocument)
        {
            await _module.InvokeVoidAsync("showRectifiedDocument", elementId, rectifiedDocument);
        }
    }
}
