/*
=======================================
 IMAGE UPSCALER TOOL - Toolsified
=======================================
Features:
✔ Upload image
✔ Preview image
✔ Upscale 2x / 3x / 4x
✔ Download enhanced image
✔ Monetag pop-ad trigger on download
✔ 100% client-side processing
*/

const upscaleInput = document.getElementById("upscaleInput");
const previewImage = document.getElementById("previewImage");
const upscaledPreview = document.getElementById("upscaledPreview");
const scaleFactorSelect = document.getElementById("scaleFactor");
const downloadBtn = document.getElementById("downloadUpscaled");
const dropZone = document.getElementById('drop-zone');
const upscaleButton = document.getElementById('upscaleButton');
const spinner = document.getElementById('upscale-spinner');
const progressBar = document.getElementById('upscale-progress');
const originalInfo = document.getElementById('original-info');
const upscaledInfo = document.getElementById('upscaled-info');

// Monetag direct link (Pop-under on download) - disabled by default
const MONETAG_URL = null; // set to your ad URL to enable pop-under behavior

// Hold the original image data
let loadedImage = null;
let upscaledBlobUrl = null;

// When a file is uploaded
// Handle file selection
upscaleInput.addEventListener("change", function () {
    const file = this.files[0];
    if (!file) return;
    loadImageFile(file);
});

// Drag & drop support
if (dropZone) {
    dropZone.addEventListener('click', () => upscaleInput.click());
    ['dragenter', 'dragover'].forEach(evt => dropZone.addEventListener(evt, (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    }));
    ['dragleave', 'drop'].forEach(evt => dropZone.addEventListener(evt, (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
    }));
    dropZone.addEventListener('drop', (e) => {
        const f = e.dataTransfer.files && e.dataTransfer.files[0];
        if (f) loadImageFile(f);
    });
}

function loadImageFile(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
        loadedImage = new Image();
        loadedImage.onload = () => {
            previewImage.src = loadedImage.src;
            previewImage.classList.remove('hidden');
            originalInfo.textContent = `${loadedImage.width} × ${loadedImage.height} — ${Math.round(file.size/1024)} KB`;
            originalInfo.classList.remove('hidden');
            // clear previous upscaled
            if (upscaledBlobUrl) {
                URL.revokeObjectURL(upscaledBlobUrl);
                upscaledBlobUrl = null;
            }
            upscaledPreview.classList.add('hidden');
            document.getElementById('upscale-placeholder').classList.remove('hidden');
            downloadBtn.classList.add('hidden');
        };
        loadedImage.src = e.target.result;
    };
    reader.readAsDataURL(file);
    showNotification('Image loaded', 'success');
}

/**
 * Start Upscaling the Image
 */
async function startUpscale() {
    if (!loadedImage) {
        showNotification('Please upload an image first.', 'error');
        return;
    }

    const scale = parseInt(scaleFactorSelect.value);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = loadedImage.width * scale;
    canvas.height = loadedImage.height * scale;

    // Show spinner and animate fake progress
    spinner.classList.remove('hidden');
    progressBar.style.width = '10%';

    // Draw enlarged image (synchronous)
    await new Promise((res) => setTimeout(res, 50));
    ctx.drawImage(loadedImage, 0, 0, canvas.width, canvas.height);
    progressBar.style.width = '60%';

    // Convert to blob asynchronously for better memory handling
    canvas.toBlob((blob) => {
        if (!blob) {
            spinner.classList.add('hidden');
            showNotification('Failed to upscale image.', 'error');
            return;
        }

        // Create object URL and show preview
        upscaledBlobUrl = URL.createObjectURL(blob);
        upscaledPreview.src = upscaledBlobUrl;
        upscaledPreview.classList.remove('hidden');
        document.getElementById('upscale-placeholder').classList.add('hidden');
        upscaledInfo.textContent = `${canvas.width} × ${canvas.height} — ${Math.round(blob.size/1024)} KB`;
        upscaledInfo.classList.remove('hidden');

        // Set download
        downloadBtn.href = upscaledBlobUrl;
        downloadBtn.download = 'upscaled-image.png';
        downloadBtn.classList.remove('hidden');

        // hide spinner and set progress to 100%
        progressBar.style.width = '100%';
        setTimeout(() => spinner.classList.add('hidden'), 500);

        showNotification('Image upscaled successfully!', 'success');
    }, 'image/png');
}

/**
 * Attaches Monetag Pop-Under Ad to Download Button
 */
function attachMonetagPop(buttonElement) {
    if (!MONETAG_URL) return;
    const SESSION_KEY = "monetag_download_triggered";
    const AD_DELAY_MS = 1500; // 1.5 sec delay

    buttonElement.addEventListener('click', () => {
        // Only trigger once per session
        if (!sessionStorage.getItem(SESSION_KEY)) {
            setTimeout(() => {
                try {
                    const adWindow = window.open(MONETAG_URL, '_blank');
                    if (adWindow) {
                        adWindow.blur();
                        window.focus();
                    }
                } catch (e) { /* ignore popup errors */ }
            }, AD_DELAY_MS);
            sessionStorage.setItem(SESSION_KEY, "yes");
        }
    });
}

// Wire UI events
if (upscaleButton) upscaleButton.addEventListener('click', startUpscale);
if (downloadBtn) attachMonetagPop(downloadBtn);
