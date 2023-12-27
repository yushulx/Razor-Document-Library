using Microsoft.JSInterop;

namespace RazorDocumentLibrary
{
    /// <summary>
    /// Represents a JavaScript module that can be used to interact with the Dynamsoft Document Normalizer SDK.
    /// </summary>
    public class DocumentJsInterop : IAsyncDisposable
    {
        // Holds a task that resolves to a JavaScript module reference.
        private readonly Lazy<Task<IJSObjectReference>> moduleTask;

        /// <summary>
        /// Initializes a new instance of the DocumentJsInterop class.
        /// </summary>
        /// <param name="jsRuntime">The JS runtime to use for invoking JavaScript functions.</param>
        public DocumentJsInterop(IJSRuntime jsRuntime)
        {
            moduleTask = new(() => jsRuntime.InvokeAsync<IJSObjectReference>(
                "import", "./_content/RazorDocumentLibrary/documentJsInterop.js").AsTask());
        }

        /// <summary>
        /// Releases unmanaged resources asynchronously.
        /// </summary>
        public async ValueTask DisposeAsync()
        {
            if (moduleTask.IsValueCreated)
            {
                var module = await moduleTask.Value;
                await module.DisposeAsync();
            }
        }

        /// <summary>
        /// Loads and initializes the JavaScript module.
        /// </summary>
        public async Task LoadJS()
        {
            var module = await moduleTask.Value;
            await module.InvokeAsync<object>("init");
        }

        /// <summary>
        /// Sets the license key for the Dynamsoft Document Normalizer SDK.
        /// </summary>
        /// <param name="license">The license key.</param>
        public async Task SetLicense(string license)
        {
            var module = await moduleTask.Value;
            await module.InvokeVoidAsync("setLicense", license);
        }

        /// <summary>
        /// Loads the WebAssembly for Document Normalizer.
        /// </summary>
        public async Task LoadWasm()
        {
            var module = await moduleTask.Value;
            await module.InvokeVoidAsync("loadWasm");
        }

        /// <summary>
        /// Creates a new DocumentNormalizer instance.
        /// </summary>
        /// <returns>A task that represents the asynchronous operation. The task result is a new DocumentNormalizer instance.</returns>
        public async Task<DocumentNormalizer> CreateDocumentNormalizer()
        {
            var module = await moduleTask.Value;
            IJSObjectReference jsObjectReference = await module.InvokeAsync<IJSObjectReference>("createDocumentNormalizer");
            DocumentNormalizer recognizer = new DocumentNormalizer(module, jsObjectReference);
            return recognizer;
        }
    }
}