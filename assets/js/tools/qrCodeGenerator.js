// QR Code Generator Tool Logic

let currentQrCode = null;
let selectedImage = null;

// Update character count as user types
document.addEventListener('DOMContentLoaded', function() {
    const input = document.getElementById('qr-input');
    if (input) {
        input.addEventListener('input', function() {
            document.getElementById('char-count').textContent = this.value.length;
        });
    }
    
    // Make drop zone clickable
    const dropZone = document.getElementById('image-drop-zone');
    if (dropZone) {
        dropZone.addEventListener('click', function() {
            document.getElementById('image-file-input').click();
        });
    }
});

// Tab switching
function switchTab(tab) {
    // Hide all tabs
    document.getElementById('text-tab').classList.add('hidden');
    document.getElementById('image-tab').classList.add('hidden');
    
    // Show selected tab
    document.getElementById(tab + '-tab').classList.remove('hidden');
    
    // Update tab buttons
    document.getElementById('tab-text').classList.remove('border-blue-600', 'text-blue-600');
    document.getElementById('tab-text').classList.add('border-transparent', 'text-gray-600');
    document.getElementById('tab-image').classList.remove('border-blue-600', 'text-blue-600');
    document.getElementById('tab-image').classList.add('border-transparent', 'text-gray-600');
    
    if (tab === 'text') {
        document.getElementById('tab-text').classList.add('border-blue-600', 'text-blue-600');
        document.getElementById('tab-text').classList.remove('border-transparent', 'text-gray-600');
    } else {
        document.getElementById('tab-image').classList.add('border-blue-600', 'text-blue-600');
        document.getElementById('tab-image').classList.remove('border-transparent', 'text-gray-600');
    }
}

// Image handling
function handleImageSelect(event) {
    const files = event.target.files;
    if (files.length > 0) {
        processImage(files[0]);
    }
}

function handleImageDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('drag-over');
    
    const files = event.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
        processImage(files[0]);
    } else {
        showNotification('Please upload an image file', 'error');
    }
}

function processImage(file) {
    if (!file.type.startsWith('image/')) {
        showNotification('Please upload an image file', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        // Compress the image before converting to QR
        const img = new Image();
        img.onload = function() {
            // Create canvas and compress image HEAVILY
            const canvas = document.createElement('canvas');
            const maxDim = 80; // Very small size = much smaller base64
            let width = img.width;
            let height = img.height;
            
            if (width > height) {
                height = (height * maxDim) / width;
                width = maxDim;
            } else {
                width = (width * maxDim) / height;
                height = maxDim;
            }
            
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            // Convert to base64 with very high compression (30% quality)
            selectedImage = canvas.toDataURL('image/jpeg', 0.3);
            
            // If still too large, try even lower quality
            if (selectedImage.length > 2400) {
                selectedImage = canvas.toDataURL('image/jpeg', 0.15);
            }
            
            document.getElementById('image-preview').src = selectedImage;
            document.getElementById('image-preview-container').classList.remove('hidden');
            
            // Show file size info
            const estimatedSize = Math.round(selectedImage.length / 1024);
            const charCount = selectedImage.length;
            showNotification(`Image ultra-compressed to ${charCount} chars (~${estimatedSize}KB). Ready to generate!`, 'success');
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function clearImage() {
    selectedImage = null;
    document.getElementById('image-preview-container').classList.add('hidden');
    document.getElementById('image-file-input').value = '';
    showNotification('Image removed', 'info');
}

function setPreset(type) {
    const input = document.getElementById('qr-input');
    const presets = {
        url: 'https://example.com',
        email: 'mailto:example@example.com',
        phone: 'tel:+1234567890',
        wifi: 'WIFI:T:WPA;S:NetworkName;P:Password;;'
    };
    
    input.value = presets[type] || '';
    document.getElementById('char-count').textContent = input.value.length;
    input.focus();
}

function generateQrCode() {
    // Determine which input to use
    let inputData = '';
    const activeTab = document.getElementById('text-tab').classList.contains('hidden') ? 'image' : 'text';
    
    if (activeTab === 'text') {
        inputData = document.getElementById('qr-input').value.trim();
        if (!inputData) {
            showNotification('Please enter text or URL', 'error');
            return;
        }
    } else {
        if (!selectedImage) {
            showNotification('Please upload an image', 'error');
            return;
        }
        inputData = selectedImage;
    }
    
    const size = parseInt(document.getElementById('qr-size').value);
    const correction = document.getElementById('qr-correction').value;
    
    document.getElementById('loading').classList.remove('hidden');
    
    try {
        // For images, check if data is too large and warn user
        if (activeTab === 'image') {
            if (inputData.length > 2953) {
                throw new Error(`Image still too large (${inputData.length} chars). Please try uploading a much smaller or simpler image.`);
            }
        }
        
        // Clear previous QR code
        const container = document.getElementById('qr-code-container');
        container.innerHTML = '';
        
        // Generate new QR code with high error correction for images
        const useCorrection = activeTab === 'image' ? 'H' : correction;
        
        currentQrCode = new QRCode(container, {
            text: inputData,
            width: size,
            height: size,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel[useCorrection]
        });
        
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('result-section').classList.remove('hidden');
        showNotification('QR code generated successfully!', 'success');
        
    } catch (error) {
        console.error('Error generating QR code:', error);
        document.getElementById('loading').classList.add('hidden');
        showNotification('Error: ' + error.message, 'error');
    }
}

function downloadQrCode(format) {
    const canvas = document.querySelector('#qr-code-container canvas');
    
    if (!canvas) {
        showNotification('Please generate a QR code first', 'error');
        return;
    }
    
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `qrcode_${timestamp}.${format}`;
    
    canvas.toBlob(function(blob) {
        downloadFile(blob, filename);
        showNotification(`QR code downloaded as ${format.toUpperCase()}!`, 'success');
        
        // Trigger monetag pop-under ad after download
        attachMonetagPop();
    }, `image/${format === 'jpg' ? 'jpeg' : format}`);
}

function copyQrCode() {
    const canvas = document.querySelector('#qr-code-container canvas');
    
    if (!canvas) {
        showNotification('Please generate a QR code first', 'error');
        return;
    }
    
    canvas.toBlob(function(blob) {
        const item = new ClipboardItem({'image/png': blob});
        navigator.clipboard.write([item]).then(function() {
            showNotification('QR code copied to clipboard!', 'success');
            
            // Trigger monetag pop-under ad after copy
            attachMonetagPop();
        }).catch(function(err) {
            console.error('Could not copy image:', err);
            showNotification('Failed to copy QR code', 'error');
        });
    });
}

function attachMonetagPop() {
    const MONETAG_URL = 'https://a.monetag.io/popup';
    const SESSION_KEY = 'monetag_download_triggered';
    const AD_DELAY_MS = 1500;
    
    // Check if already triggered this session
    if (sessionStorage.getItem(SESSION_KEY)) {
        return;
    }
    
    // Mark as triggered
    sessionStorage.setItem(SESSION_KEY, 'true');
    
    // Delayed pop-under
    setTimeout(() => {
        if (window.open) {
            window.open(MONETAG_URL, 'monetag_pop', 'width=800,height=600');
        }
    }, AD_DELAY_MS);
}
