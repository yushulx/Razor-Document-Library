using Microsoft.JSInterop;
using System.Text.Json;
using static RazorDocumentLibrary.DocumentNormalizer;

namespace RazorDocumentLibrary
{
    public class DocumentNormalizer
    {
        public class Filter
        {
            public static string BlackAndWhite = "ICM_BINARY";
            public static string Gray = "ICM_GRAYSCALE";
            public static string Colorful = "ICM_COLOUR";
        }
        // Fields to hold JavaScript object references.
        private IJSObjectReference _module;
        private IJSObjectReference _jsObjectReference;
        private DotNetObjectReference<DocumentNormalizer> objRef;
        private bool _disposed = false;
        private ICallback? _callback;

        /// <summary>
        /// Initializes a new instance of the DocumentNormalizer class.
        /// </summary>
        /// <param name="module">A reference to the JavaScript module.</param>
        /// <param name="normalizer">A reference to the JavaScript object for document normalization.</param>
        public DocumentNormalizer(IJSObjectReference module, IJSObjectReference normalizer)
        {
            _module = module;
            _jsObjectReference = normalizer;
            objRef = DotNetObjectReference.Create(this);
        }

        /// <summary>
        /// Asynchronously detect document edges from a canvas object.
        /// </summary>
        /// <param name="canvas">A reference to the JavaScript object representing the canvas with the document image.</param>
        /// <returns>A task that represents a quadrilateral that contains the coordinates of the detected edges.</returns>
        public async Task<Quadrilateral?> DetectCanvas(IJSObjectReference canvas)
        {
            JsonElement? quads = await _module.InvokeAsync<JsonElement>("detectCanvas", _jsObjectReference, canvas);
            List<Quadrilateral> all = Quadrilateral.WrapQuads(quads);
            return all.Count > 0 ? all[0] : null;
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

        /// <summary>
        /// Display the rectified document with an HTML div element.
        /// </summary>
        /// <param name="elementId">A div element ID.</param>
        /// <param name="rectifiedDocument">A reference to the JavaScript canvas object.</param>
        public async Task ShowRectifiedDocument(string elementId, IJSObjectReference rectifiedDocument)
        {
            await _module.InvokeVoidAsync("showRectifiedDocument", elementId, rectifiedDocument);
        }

        /// <summary>
        /// Set a filter for the rectified document.
        /// </summary>
        /// <param name="filter">The filter name.</param>
        public async Task SetFilter(string filter)
        {
            await _module.InvokeVoidAsync("setFilter", _jsObjectReference, filter);
        }

        [JSInvokable]
        public Task OnQuadChanged(JsonElement quad)
        {
            if (_callback != null)
            {
                Quadrilateral? q = Quadrilateral.WrapQuad(quad);
                if (q != null)
                {
                    _callback.OnCallback(q);
                }
            }
            return Task.CompletedTask;
        }

        /// <summary>
        /// Release unmanaged resources.
        /// </summary>
        public void Dispose()
        {
            if (_disposed == false)
            {
                objRef.Dispose();
                _disposed = true;
            }
        }

        /// <summary>
        /// Destructor for the DocumentNormalizer class.
        /// </summary>
        ~DocumentNormalizer()
        {
            if (_disposed == false)
                Dispose();
        }

        public async Task ShowDocumentEditor(string elementId, IJSObjectReference imageCanvas, string location)
        {
            await _module.InvokeVoidAsync("showDocumentEditor", objRef, "OnQuadChanged", elementId, imageCanvas, location);
        }

        public interface ICallback
        {
            Task OnCallback(Quadrilateral quad);
        }

        public void RegisterCallback(ICallback callback)
        {
            _callback = callback;
        }
    }
}
