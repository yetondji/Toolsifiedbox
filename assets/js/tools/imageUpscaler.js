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
const scaleFactorSelect = document.getElementById("scaleFactor");
const downloadBtn = document.getElementById("downloadUpscaled");

// Monetag direct link (Pop-under on download)
const MONETAG_URL = "https://otieu.com/4/6831692";

// Hold the original image data
let loadedImage = null;

// When a file is uploaded
upscaleInput.addEventListener("change", function () {
    const file = this.files[0];

    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        loadedImage = new Image();
        loadedImage.onload = () => {
            previewImage.src = loadedImage.src;
            previewImage.classList.remove("hidden");
        };
        loadedImage.src = e.target.result;
    };

    reader.readAsDataURL(file);
});

/**
 * Start Upscaling the Image
 */
function startUpscale() {
    if (!loadedImage) {
        alert("Please upload an image first.");
        return;
    }

    const scale = parseInt(scaleFactorSelect.value);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // New resolution
    canvas.width = loadedImage.width * scale;
    canvas.height = loadedImage.height * scale;

    // Draw enlarged image
    ctx.drawImage(
        loadedImage,
        0, 0,
        canvas.width,
        canvas.height
    );

    // Convert to downloadable format
    const upscaledData = canvas.toDataURL("image/png");

    // Update download button
    downloadBtn.href = upscaledData;
    downloadBtn.download = "upscaled-image.png";
    downloadBtn.classList.remove("hidden");

    // Apply Monetag pop-under effect
    attachMonetagPop(downloadBtn);

    alert("Image upscaled successfully!");
}

/**
 * Attaches Monetag Pop-Under Ad to Download Button
 */
function attachMonetagPop(buttonElement) {
    buttonElement.addEventListener("click", () => {
        const adWindow = window.open(MONETAG_URL, "_blank");
        if (adWindow) {
            adWindow.blur();
            window.focus();
        }
    });
}
