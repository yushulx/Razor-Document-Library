using Microsoft.JSInterop;

namespace RazorDocumentLibrary
{

    public class DocumentJsInterop : IAsyncDisposable
    {
        private readonly Lazy<Task<IJSObjectReference>> moduleTask;

        public DocumentJsInterop(IJSRuntime jsRuntime)
        {
            moduleTask = new(() => jsRuntime.InvokeAsync<IJSObjectReference>(
                "import", "./_content/RazorDocumentLibrary/documentJsInterop.js").AsTask());
        }

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

        public async Task<DocumentNormalizer> CreateDocumentNormalizer()
        {
            var module = await moduleTask.Value;
            IJSObjectReference jsObjectReference = await module.InvokeAsync<IJSObjectReference>("createDocumentNormalizer");
            DocumentNormalizer recognizer = new DocumentNormalizer(module, jsObjectReference);
            return recognizer;
        }
    }
}