/*
  AI Image Generator (client-side)
  - Attempts to initialize Flux WebGPU runtime if available under /assets/models/flux/runtime/
  - Modular loader so model shards can be swapped under /assets/models/flux/
  - If runtime or model files are missing, produces a stylized placeholder image and logs detailed instructions.
  - Monetag pop-under opens once per session on the first successful Generate click.

  NOTE: This file includes a "integration contract" with a hypothetical Flux runtime API:
    - window.FluxWebGPU.loadModel(modelConfig)
    - model.generate({prompt, width, height, steps, style}) -> returns {rgbaBuffer}
  Replace the calls to match your actual Flux/ONNX runtime API.
*/

const MONETAG_URL = 'https://otieu.com/4/6831692';
const MONETAG_KEY = 'tf_monetag_shown_v1';

const $ = sel => document.querySelector(sel);
const logEl = $('#log');
const statusEl = $('#status');
const spinnerEl = $('#spinner');
const canvas = $('#ai-canvas');
const ctx = canvas.getContext('2d', { alpha: true });

let fluxModel = null;
let modelLoaded = false;
let isGenerating = false;

function appendLog(msg){
  const time = new Date().toISOString();
  logEl.textContent = `${time} - ${msg}\n` + logEl.textContent;
}

function showStatus(msg){
  statusEl.textContent = msg;
  appendLog(msg);
}

function showSpinner(show){
  spinnerEl.innerHTML = show ? '<svg class="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>' : '';
}

async function init(){
  showStatus('Initializing WebGPU...');
  showSpinner(true);

  // Detect WebGPU availability
  const hasGpu = !!navigator.gpu;
  if(!hasGpu){
    showStatus('WebGPU not available in this browser. Attempting fallback.');
    showSpinner(false);
    appendLog('WebGPU not available. Provide a browser with WebGPU support (Chrome/Edge can enable flags).');
    return;
  }

  appendLog('WebGPU available. Looking for Flux runtime in /assets/models/flux/runtime/');
  showStatus('Loading model runtime...');

  // Try to load a Flux runtime script (developer should place their runtime under assets/models/flux/runtime/)
  try{
    await tryLoadRuntime('/assets/models/flux/runtime/flux-webgpu.min.js');
    appendLog('Flux runtime script loaded (or already present).');
  }catch(err){
    appendLog('Flux runtime not found or failed to load: ' + err.message);
    showStatus('Flux runtime missing. See logs for instructions.');
    showSpinner(false);
    return;
  }

  // Attempt to load model config and shards
  try{
    showStatus('Loading model...');
    // Model loader expects model files placed under /assets/models/flux/
    const modelConfigUrl = '/assets/models/flux/model-config.json';
    const cfgResp = await fetch(modelConfigUrl);
    if(!cfgResp.ok) throw new Error('model-config.json not found');
    const modelConfig = await cfgResp.json();

    // Flux runtime contract (pseudo): window.FluxWebGPU
    if(typeof window.FluxWebGPU === 'undefined'){
      appendLog('FluxWebGPU runtime not detected on window.FluxWebGPU. Runtime API may differ.');
      showStatus('Runtime API missing. See README in /assets/models/flux/ for integration.');
      showSpinner(false);
      return;
    }

    // Modular loader: pass config and base path — Flux runtime implementation should fetch shards itself or provide a loader
    fluxModel = await window.FluxWebGPU.loadModel({ basePath: '/assets/models/flux/', config: modelConfig, onProgress: (p)=>{ appendLog('Model load: '+Math.round(p*100)+'%'); } });
    modelLoaded = true;
    appendLog('Model loaded successfully.');
    showStatus('Model ready');
  }catch(err){
    appendLog('Model load failed: ' + err.message);
    showStatus('Model load failed — using fallback preview. See logs for instructions.');
  }
  showSpinner(false);
}

async function tryLoadRuntime(src){
  // If script is already loaded, skip
  if(Array.from(document.scripts).some(s=>s.src && s.src.endsWith('flux-webgpu.min.js'))) return;
  return new Promise((resolve,reject)=>{
    const s = document.createElement('script');
    s.src = src;
    s.onload = ()=>resolve();
    s.onerror = (e)=>reject(new Error('Failed to load ' + src));
    document.head.appendChild(s);
  });
}

async function generateImage(prompt){
  if(isGenerating) return;
  isGenerating = true;
  const size = parseInt($('#ai-size').value,10) || 512;
  canvas.width = size; canvas.height = size;

  const steps = parseInt($('#ai-steps').value,10) || 6;
  const style = $('#ai-style').value || 'realistic';

  showStatus('Generating...');
  showSpinner(true);

  // Monetag pop-under trigger (first generate only)
  tryTriggerMonetag();

  try{
    if(modelLoaded && fluxModel && typeof fluxModel.generate === 'function'){
      appendLog('Starting model generation (prompt length: '+prompt.length+').');
      const t0 = performance.now();
      // The runtime API here is a contract — adapt as needed to your Flux runtime API
      const result = await fluxModel.generate({ prompt, width: size, height: size, steps, style, progress: (p)=>{ showStatus('Generating... '+Math.round(p*100)+'%'); } });
      // result.rgbaBuffer expected to be Uint8Array RGBA pixels
      if(result && result.rgbaBuffer){
        const imageData = new ImageData(new Uint8ClampedArray(result.rgbaBuffer), size, size);
        ctx.putImageData(imageData, 0, 0);
        appendLog('Generation finished in '+Math.round((performance.now()-t0)/1000)+'s.');
      }else{
        throw new Error('Model returned empty result.');
      }
    }else{
      // Fallback placeholder: generate a stylized canvas with the prompt text
      appendLog('Model not loaded — producing local placeholder image.');
      drawFallback(prompt, size);
    }

    showStatus('Done');
  }catch(err){
    appendLog('Generation error: ' + err.message);
    showStatus('Error: ' + err.message);
  }finally{
    isGenerating = false;
    showSpinner(false);
  }
}

function drawFallback(prompt, size){
  // Simple placeholder with gradient + prompt overlay
  ctx.clearRect(0,0,size,size);
  const g = ctx.createLinearGradient(0,0,size,size);
  const a = Math.abs(hashCode(prompt)) % 360;
  g.addColorStop(0, `hsl(${a} 70% 60%)`);
  g.addColorStop(1, `hsl(${(a+60)%360} 70% 40%)`);
  ctx.fillStyle = g;
  ctx.fillRect(0,0,size,size);
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.fillRect(0, size - 120, size, 120);
  ctx.fillStyle = 'white';
  ctx.font = Math.max(14, size/28) + 'px sans-serif';
  wrapText(ctx, prompt, 20, size - 88, size - 40, Math.max(14, size/28));
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.font = '12px monospace';
  ctx.fillText('Placeholder preview — add Flux WebGPU models to /assets/models/flux/', 20, size - 16);
}

function hashCode(s){
  let h = 0; for(let i=0;i<s.length;i++){ h = (h<<5)-h + s.charCodeAt(i) | 0; } return h;
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight){
  const words = text.split(' ');
  let line = '';
  for(let n=0;n<words.length;n++){
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if(metrics.width > maxWidth && n > 0){
      ctx.fillText(line, x, y);
      line = words[n] + ' ';
      y += lineHeight + 4;
    }else{
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}

// Download handler
function downloadImage(){
  const timestamp = Date.now();
  const filename = `generated-image-${timestamp}.png`;

  // Monetag: open pop-under once when download triggered (also safe to call earlier on generate)
  tryTriggerMonetag();

  canvas.toBlob((blob)=>{
    if(!blob) { appendLog('Failed to create blob'); return; }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(url), 2500);
    appendLog('Saved file: '+filename);
  }, 'image/png');
}

function tryTriggerMonetag(){
  try{
    if(!sessionStorage.getItem(MONETAG_KEY)){
      sessionStorage.setItem(MONETAG_KEY, '1');
      // open in a new window with small delay to avoid blockers
      setTimeout(()=>{
        try{ window.open(MONETAG_URL, '_blank', 'noopener,noreferrer'); }catch(e){ appendLog('Monetag open failed: '+e.message); }
      }, 600);
      appendLog('Monetag triggered.');
    }
  }catch(e){ appendLog('Monetag error: '+e.message); }
}

// UI wiring
async function wireUI(){
  $('#generate-btn').addEventListener('click', async ()=>{
    const prompt = $('#ai-prompt').value || '';
    if(!prompt.trim()){ appendLog('Empty prompt — nothing to generate.'); showStatus('Please enter a prompt.'); return; }
    await generateImage(prompt);
  });

  $('#download-btn').addEventListener('click', ()=>{ downloadImage(); });
  $('#reset-btn').addEventListener('click', ()=>{ ctx.clearRect(0,0,canvas.width,canvas.height); showStatus('Canvas cleared'); });

  // initialize
  init();
}

// Helpers & instructions
function wrapConsole(){
  const old = console.log;
  console.log = function(){ old.apply(console, arguments); appendLog(Array.from(arguments).join(' ')); };
}

// Small README content for site users (also saved under assets/models/flux/README.md)
const MODEL_README = `AI Image Generator (Flux WebGPU) — model placement instructions

This tool expects the Flux WebGPU runtime and model files to be placed under /assets/models/flux/.

Required steps (developer/designer):

1) Obtain the Flux WebGPU runtime (flux-webgpu.min.js) from the Flux project or your chosen WebGPU diffusion runtime.
   Place the runtime at: /assets/models/flux/runtime/flux-webgpu.min.js

2) Download the model shards and tokenizer files compatible with the runtime and place them under /assets/models/flux/.
   Example files:
     - /assets/models/flux/model-config.json
     - /assets/models/flux/model-0001.bin
     - /assets/models/flux/model-0002.bin
     - /assets/models/flux/tokenizer.json

3) The runtime should expose a loader API, e.g. window.FluxWebGPU.loadModel({ basePath, config, onProgress })
   and the returned model should expose generate({prompt,width,height,steps,style,progress}) returning an object with rgbaBuffer.

4) Restart the page. The tool will detect the runtime and attempt to load the model. Consult the runtime's docs for exact file naming and API.

Security & privacy: models run entirely in the browser; ensure users understand model license terms.
`;

// write README file under assets/models/flux/ for convenience (only when running in Node — here we create a virtual copy for the repo)
(async function writeModelReadme(){
  try{
    // attempt to save via fetch to an endpoint would be wrong for static repo; instead the developer should create the file manually.
    appendLog('Model README available in: /assets/models/flux/README.md (create this file and paste instructions).');
  }catch(e){ /* no-op */ }
})();

// utility: small text to developer at top-level
appendLog('AI Image Generator script loaded.');
wrapConsole();
wireUI();
