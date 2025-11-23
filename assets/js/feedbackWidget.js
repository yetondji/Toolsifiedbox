/* Feedback Widget - Toolsified
 - Floating FAB that opens a modal
 - Inline thumbs on /tools/ pages
 - Posts to Google Apps Script Web App endpoint

Configuration:
 - Replace ENDPOINT_URL with your deployed Apps Script Web App URL.
*/

const TF_FEEDBACK_CONFIG = {
  ENDPOINT_URL: 'https://script.google.com/macros/s/AKfycbx1z-PYvqXJKcp9c14Nxjc9BO92tQ2vhk7ZiemDMXg-oROYsLEW70GRFEUY5UQin2vuLQ/exec',
  SESSION_PREFIX: 'tf_feedback_submitted_',
  BRAND_COLOR: 'bg-blue-600',
  DEBUG: true // set to `false` to disable verbose console logging
};

// Utility: safe showNotification if main.js provides it
function tfShowNotification(msg, type='info'){
  if (window.showNotification) return window.showNotification(msg, type);
  // tiny fallback
  const n = document.createElement('div');
  n.textContent = msg;
  n.style.position = 'fixed'; n.style.right='1rem'; n.style.top='1rem'; n.style.padding='8px 12px'; n.style.background = (type==='success'? 'green' : type==='error'? 'crimson' : '#333'); n.style.color='#fff'; n.style.borderRadius='6px'; n.style.zIndex=99999;
  document.body.appendChild(n);
  setTimeout(()=> n.remove(),3000);
}

// Build modal + FAB
function tfBuildWidget(){
  // FAB
  const fab = document.createElement('button');
  fab.className = 'tf-feedback-fab fixed bottom-5 right-5 bg-white shadow-lg rounded-lg p-3 flex items-center justify-center gap-2 hover:scale-105 transition-transform';
  fab.title = 'Feedback';
  fab.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l3-3h4V5a2 2 0 00-2-2H6a2 2 0 00-2 2v11a2 2 0 002 2h3l3 3z"/></svg><span class="text-sm font-medium text-gray-700">Feedback</span>';
  fab.addEventListener('click', ()=>tfOpenModal());
  document.body.appendChild(fab);

  // Modal backdrop
  const modal = document.createElement('div');
  modal.id = 'tf-feedback-modal';
  modal.className = 'hidden fixed inset-0 flex items-center justify-center tf-feedback-backdrop';
  modal.innerHTML = `
    <div class="bg-white rounded-lg shadow-xl max-w-xl w-full mx-4">
      <div class="p-4 border-b flex items-center justify-between">
        <h3 class="text-lg font-semibold">Did this tool help you?</h3>
        <button id="tf-close" class="text-gray-500 hover:text-gray-800">✕</button>
      </div>
      <div class="p-4">
        <div class="flex gap-4 items-center mb-3">
          <button id="tf-thumb-yes" class="p-2 rounded-md hover:bg-gray-100">👍</button>
          <button id="tf-thumb-no" class="p-2 rounded-md hover:bg-gray-100">👎</button>
          <div class="ml-auto text-sm text-gray-500">Optional: leave a comment below</div>
        </div>
        <textarea id="tf-comment" class="w-full tf-feedback-input border rounded-md p-2" rows="3" placeholder="Tell us what to improve (optional)"></textarea>
        <input id="tf-request-tool" class="w-full mt-2 border rounded-md p-2" placeholder="Request a new tool (optional)">
        <input id="tf-email" type="email" class="w-full mt-2 border rounded-md p-2" placeholder="Email (optional)">
        <div class="flex items-center justify-end gap-2 mt-3">
          <button id="tf-submit" class="px-4 py-2 rounded-md text-white">Submit</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  // apply brand color class to modal submit button after insertion
  const modalBtn = document.getElementById('tf-submit');
  if (modalBtn) modalBtn.classList.add(TF_FEEDBACK_CONFIG.BRAND_COLOR);

  // Wire modal buttons
  document.getElementById('tf-close').addEventListener('click', tfCloseModal);
  document.getElementById('tf-thumb-yes').addEventListener('click', ()=>tfSubmit(true));
  document.getElementById('tf-thumb-no').addEventListener('click', ()=>tfSubmit(false));
  document.getElementById('tf-submit').addEventListener('click', ()=>{
    // if neither thumb clicked, assume helpful = unknown (null)
    tfSubmit(null);
  });
}

function tfOpenModal(){
  const m = document.getElementById('tf-feedback-modal');
  if (!m) return;
  m.classList.remove('hidden');
}
function tfCloseModal(){
  const m = document.getElementById('tf-feedback-modal');
  if (!m) return;
  m.classList.add('hidden');
}

function tfGetDevice(){
  const ua = navigator.userAgent || '';
  if (/Mobile|Android|iP(hone|od|ad)|IEMobile|Windows Phone/i.test(ua)) return 'mobile';
  if (/iPad|Tablet/i.test(ua)) return 'tablet';
  return 'desktop';
}

async function tfSubmit(helpful){
  const page_key = TF_FEEDBACK_CONFIG.SESSION_PREFIX + location.pathname;
  if (sessionStorage.getItem(page_key)){
    tfShowNotification('You already submitted feedback on this page this session', 'info');
    tfCloseModal();
    return;
  }

  const comment = (document.getElementById('tf-comment')||{}).value || '';
  const request_tool = (document.getElementById('tf-request-tool')||{}).value || '';
  const email = (document.getElementById('tf-email')||{}).value || '';

  const payload = {
    timestamp: new Date().toISOString(),
    page_url: location.href,
    page_title: document.title || '',
    helpful: helpful,
    comment: comment,
    request_tool: request_tool,
    email: email,
    device: tfGetDevice()
  };

  // basic validation
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){
    tfShowNotification('Please enter a valid email or leave blank', 'error');
    return;
  }

  if (!TF_FEEDBACK_CONFIG.ENDPOINT_URL || TF_FEEDBACK_CONFIG.ENDPOINT_URL.includes('REPLACE_WITH')){
    tfShowNotification('Feedback endpoint not configured. Replace ENDPOINT_URL in feedbackWidget.js', 'error');
    return;
  }

  try{
    const form = new URLSearchParams();
    Object.keys(payload).forEach(k => { if (payload[k] !== undefined && payload[k] !== null) form.append(k, String(payload[k])); });
    if (TF_FEEDBACK_CONFIG.DEBUG) console.log('TFFeedback: sending', payload);
    const resp = await fetch(TF_FEEDBACK_CONFIG.ENDPOINT_URL, {
      method: 'POST',
      headers: {'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},
      body: form.toString()
    });
    let json = null;
    try { json = await resp.json(); } catch (parseErr) { if (TF_FEEDBACK_CONFIG.DEBUG) console.warn('TFFeedback: response not JSON', parseErr); }
    let respText = null;
    if (!json) {
      try { respText = await resp.text(); } catch(e) { respText = null; }
    }
    if (TF_FEEDBACK_CONFIG.DEBUG) console.log('TFFeedback: response', resp.status, json || respText);
    if (json && json.status === 'ok'){
      sessionStorage.setItem(page_key, 'yes');
      tfShowNotification('Thanks for your feedback!', 'success');
      tfCloseModal();
    } else {
      if (TF_FEEDBACK_CONFIG.DEBUG && respText) {
        tfShowNotification('Server error: ' + resp.status + ' — see console', 'error');
        console.error('TFFeedback server response:', resp.status, respText);
      } else {
        tfShowNotification('Failed to send feedback', 'error');
      }
    }
  }catch(err){
    if (TF_FEEDBACK_CONFIG.DEBUG) console.error('TFFeedback: network/error', err);
    tfShowNotification('Network error sending feedback', 'error');
  }
}

// Inline thumbs for tool pages
function tfInsertInline(){
  if (!location.pathname.includes('/tools/')) return;
  const container = document.querySelector('.tool-content') || document.querySelector('main') || document.body;
  const div = document.createElement('div');
  div.className = 'tf-feedback-inline p-3 bg-white rounded-md shadow-sm';
  div.innerHTML = `
    <div class="flex items-center gap-3">
      <div class="text-lg font-medium">Did this tool help you?</div>
      <button id="tf-inline-yes" class="p-2 rounded-md hover:bg-gray-100">👍</button>
      <button id="tf-inline-no" class="p-2 rounded-md hover:bg-gray-100">👎</button>
    </div>
    <div id="tf-inline-expand" class="hidden mt-3">
      <textarea id="tf-inline-comment" class="w-full mt-2 border rounded-md p-2" placeholder="Tell us what to improve (optional)"></textarea>
      <input id="tf-inline-request" class="w-full mt-2 border rounded-md p-2" placeholder="Request a new tool (optional)">
      <input id="tf-inline-email" class="w-full mt-2 border rounded-md p-2" placeholder="Email (optional)">
      <div class="flex justify-end mt-2"><button id="tf-inline-submit" class="px-3 py-1 rounded-md text-white">Send</button></div>
    </div>
  `;
  container.appendChild(div);
  // apply brand color to inline send button
  const inlineBtn = document.getElementById('tf-inline-submit');
  if (inlineBtn) inlineBtn.classList.add(TF_FEEDBACK_CONFIG.BRAND_COLOR);

  document.getElementById('tf-inline-yes').addEventListener('click', ()=>{
    document.getElementById('tf-inline-expand').classList.remove('hidden');
    tfInlineSubmit(true);
  });
  document.getElementById('tf-inline-no').addEventListener('click', ()=>{
    document.getElementById('tf-inline-expand').classList.remove('hidden');
    tfInlineSubmit(false);
  });
  document.getElementById('tf-inline-submit').addEventListener('click', ()=>{
    // if user clicks send without pressing thumbs, treat as null
    tfInlineSubmit(null);
  });
}

function tfInlineSubmit(helpful){
  const page_key = TF_FEEDBACK_CONFIG.SESSION_PREFIX + location.pathname;
  if (sessionStorage.getItem(page_key)){
    tfShowNotification('You already submitted feedback on this page this session', 'info');
    return;
  }
  const comment = (document.getElementById('tf-inline-comment')||{}).value || '';
  const request_tool = (document.getElementById('tf-inline-request')||{}).value || '';
  const email = (document.getElementById('tf-inline-email')||{}).value || '';
  const payload = {
    timestamp: new Date().toISOString(),
    page_url: location.href,
    page_title: document.title || '',
    helpful: helpful,
    comment: comment,
    request_tool: request_tool,
    email: email,
    device: tfGetDevice()
  };

  // same checks as modal
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){
    tfShowNotification('Please enter a valid email or leave blank', 'error');
    return;
  }
  if (!TF_FEEDBACK_CONFIG.ENDPOINT_URL || TF_FEEDBACK_CONFIG.ENDPOINT_URL.includes('REPLACE_WITH')){
    tfShowNotification('Feedback endpoint not configured. Replace ENDPOINT_URL in feedbackWidget.js', 'error');
    return;
  }

  // Send as application/x-www-form-urlencoded to avoid CORS preflight
  const form = new URLSearchParams();
  Object.keys(payload).forEach(k => { if (payload[k] !== undefined && payload[k] !== null) form.append(k, String(payload[k])); });
  if (TF_FEEDBACK_CONFIG.DEBUG) console.log('TFFeedback (inline): sending', payload);
  fetch(TF_FEEDBACK_CONFIG.ENDPOINT_URL, {
    method: 'POST', headers: {'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'}, body: form.toString()
  }).then(async r=>{
    let j = null; let text = null;
    try{ j = await r.json(); } catch(e){ if (TF_FEEDBACK_CONFIG.DEBUG) console.warn('TFFeedback inline: response not JSON', e); try { text = await r.text(); } catch(e2) { text = null; } }
    if (TF_FEEDBACK_CONFIG.DEBUG) console.log('TFFeedback inline: response', r.status, j || text);
    return {status: r.status, json: j, text: text};
  }).then(obj=>{
    if (obj.json && obj.json.status === 'ok'){
      sessionStorage.setItem(page_key, 'yes');
      tfShowNotification('Thanks for your feedback!', 'success');
      document.getElementById('tf-inline-expand').classList.add('hidden');
    } else {
      if (TF_FEEDBACK_CONFIG.DEBUG && obj.text) {
        tfShowNotification('Server error: ' + obj.status + ' — see console', 'error');
        console.error('TFFeedback inline server response:', obj.status, obj.text);
      } else {
        tfShowNotification('Failed to send feedback', 'error');
      }
    }
  }).catch(err=>{ if (TF_FEEDBACK_CONFIG.DEBUG) console.error('TFFeedback inline: network/error', err); tfShowNotification('Network error sending feedback', 'error'); });
}

// Auto-run
// Initialize function (was accidentally removed) — builds widget and inline elements
function tfInit(){
  try{
    tfBuildWidget();
    tfInsertInline();
    if (TF_FEEDBACK_CONFIG.DEBUG) console.log('TFFeedback: widget initialized');
    window.TF_FEEDBACK_LOADED = true;
  } catch (e) {
    console.error('TFFeedback init error', e);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', tfInit);
} else {
  tfInit();
}
