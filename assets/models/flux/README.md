AI Image Generator (Flux WebGPU) — model placement instructions

This folder is a placeholder. To enable the full Flux WebGPU-powered generator you must:

1) Obtain a WebGPU-compatible diffusion runtime (Flux WebGPU or an ONNXWeb WebGPU diffusion runtime).
   - Place the runtime script under: /assets/models/flux/runtime/flux-webgpu.min.js
   - The runtime should expose a loader such as window.FluxWebGPU.loadModel({ basePath, config, onProgress })

2) Download model shards and tokenizer files compatible with your runtime and place them under /assets/models/flux/.
   Example expected files (names depend on the runtime you use):
     - model-config.json          (JSON model config)
     - model-0001.bin             (binary shard 1)
     - model-0002.bin             (binary shard 2)
     - tokenizer.json             (tokenizer files)

3) Ensure model-config.json contains references to your shard file names and tokenizer.

4) The Flux runtime should provide a generate API similar to:
     const model = await window.FluxWebGPU.loadModel({ basePath: '/assets/models/flux/', config: modelConfig, onProgress });
     const result = await model.generate({ prompt, width, height, steps, style, progress });
     // result.rgbaBuffer -> Uint8Array with RGBA pixels

5) After placing the runtime and models, reload /tools/ai-image-generator.html. The page will detect the runtime and load the model.

Notes & Troubleshooting:
- WebGPU support: Chrome/Edge on desktop are the most likely to support WebGPU right now. On unsupported browsers the page will fall back to a placeholder preview.
- Model size: diffusion models are large (hundreds of MB). Ensure users expect downloads and memory usage.
- Licensing: verify model license before distributing.

If you want me to adapt the loader to a specific runtime API (Flux, ONNX Runtime Web, etc.), tell me which runtime and I'll update the loader code accordingly.
