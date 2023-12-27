# Razor Document Library
A Razor Class Library built using the [Dynamsoft Document Normalizer SDK](https://www.npmjs.com/package/dynamsoft-document-normalizer/), which provides APIs for document edge detection and document rectification.

## Demo Video
[https://github.com/yushulx/Razor-Document-Library/assets/2202306/b842c8b7-d0b6-47f1-9d04-a96475f8d5c4](https://github.com/yushulx/Razor-Document-Library/assets/2202306/b842c8b7-d0b6-47f1-9d04-a96475f8d5c4)

## Online Demo
[https://yushulx.me/Razor-MRZ-Library/](https://yushulx.me/Razor-MRZ-Library/)

## Prerequisites
- [Dynamsoft Document Normalizer License](https://www.dynamsoft.com/customer/license/trialLicense?product=ddn)

## Quick Usage
- Import and initialize the Razor Document Library.
    
    ```csharp
    @using RazorDocumentLibrary
    
    @code {
        private DocumentJsInterop? documentJsInterop;
        
        protected override async Task OnInitializedAsync()
        {
            documentJsInterop = new DocumentJsInterop(JSRuntime);
            await documentJsInterop.LoadJS();
        }
    }
    ```

- Set the license key and load the wasm module.
    
    ```csharp
    await documentJsInterop.SetLicense(licenseKey);
    await documentJsInterop.LoadWasm();
    ```

- Createa a document normalizer instance.
    
    ```csharp
    DocumentNormalizer normalizer = await documentJsInterop.CreateDocumentNormalizer();
    ```

- Detect document edges.
    
    ```csharp
    
    Quadrilateral? result = await normalizer.DetectCanvas(canvas);
    ```

- Rectify the document based on the detected edges.
    
    ```csharp
    
    IJSObjectReference rectifiedDocument = await normalizer.RectifyCanvas(canvas, result.location);
    ```

## API

### Quadrilateral Class
Represents the coordinates of the four corners of a quadrilateral.

### DocumentNormalizer Class

- `Task<Quadrilateral?> DetectCanvas(IJSObjectReference canvas)`: Detects document edges from a canvas.
- `Task<IJSObjectReference> RectifyCanvas(IJSObjectReference canvas, string location)`: Rectifies a document based on the detected edges.
- `Task SetFilter(string filter)`: Sets the filter for document edge detection.
- `Task ShowDocumentEditor(string elementId, IJSObjectReference imageCanvas, string location)`: Shows the document edge editor.
- `RegisterCallback(ICallback callback)`: Registers a callback function for receiving the coordinates of the four corners of a document.
- `Task ShowRectifiedDocument(string elementId, IJSObjectReference rectifiedDocument)`: Displays the rectified document within a specified HTML element.

### DocumentJsInterop Class 
- `Task LoadJS()`: Loads the Dynamsoft Document Normalizer JavaScript library.
- `Task SetLicense(string license)`: Sets the license key.
- `Task LoadWasm()`: Loads the Dynamsoft Document Normalizer WebAssembly module.
- `Task<MrzRecognizer> CreateDocumentNormalizer()`: Creates a Document Normalizer instance.

## Example
- [Blazor Document Scanner](https://github.com/yushulx/Razor-Document-Library/tree/main/example)

    ![blazor document rectification](https://camo.githubusercontent.com/4e15ffb2272f9af603cdc8a5c83ba60ffb0d2f6bf0c5c44d914595ffe37e7628/68747470733a2f2f7777772e64796e616d736f66742e636f6d2f636f6465706f6f6c2f696d672f323032332f31322f626c617a6f722d646f63756d656e742d72656374696669636174696f6e2e706e67)

## Build
```bash
cd RazorDocumentLibrary
dotnet build --configuration Release
```