// Image Compressor Tool Logic

let originalImage = null;
let originalFileName = '';

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        processImage(file);
    }
}

function handleImageDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove('drag-over');
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
            processImage(file);
        } else {
            showNotification('Please upload an image file', 'error');
        }
    }
}

function processImage(file) {
    if (!file.type.startsWith('image/')) {
        showNotification('Please upload an image file', 'error');
        return;
    }
    
    originalFileName = file.name;
    const reader = new FileReader();
    
    reader.onload = function(e) {
        originalImage = new Image();
        originalImage.onload = function() {
            document.getElementById('original-preview').src = e.target.result;
            document.getElementById('original-size').textContent = formatFileSize(file.size);
            
            document.getElementById('controls').classList.remove('hidden');
            
            showNotification('Image loaded successfully! Adjust quality and compress.', 'success');
        };
        originalImage.src = e.target.result;
    };
    
    reader.readAsDataURL(file);
}

function updateQuality() {
    const quality = document.getElementById('quality-slider').value;
    document.getElementById('quality-value').textContent = quality;
}

function compressImage() {
    if (!originalImage) {
        showNotification('Please upload an image first', 'error');
        return;
    }
    
    const quality = document.getElementById('quality-slider').value / 100;
    
    const canvas = document.createElement('canvas');
    canvas.width = originalImage.width;
    canvas.height = originalImage.height;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(originalImage, 0, 0);
    
    canvas.toBlob(function(blob) {
        const compressedUrl = URL.createObjectURL(blob);
        
        document.getElementById('compressed-preview').src = compressedUrl;
        document.getElementById('compressed-size').textContent = formatFileSize(blob.size);
        
        const originalSize = parseInt(document.getElementById('original-size').textContent);
        const reduction = ((1 - blob.size / (originalImage.src.length * 0.75)) * 100).toFixed(1);
        document.getElementById('reduction').textContent = reduction + '%';
        
        document.getElementById('preview-section').classList.remove('hidden');
        
        showNotification('Image compressed successfully!', 'success');
    }, 'image/jpeg', quality);
}

function downloadCompressed() {
    const compressedImg = document.getElementById('compressed-preview');
    
    if (!compressedImg.src || compressedImg.src === '') {
        showNotification('Please compress an image first', 'error');
        return;
    }
    
    const quality = document.getElementById('quality-slider').value / 100;
    const canvas = document.createElement('canvas');
    canvas.width = originalImage.width;
    canvas.height = originalImage.height;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(originalImage, 0, 0);
    
    canvas.toBlob(function(blob) {
        const fileName = 'compressed_' + originalFileName.replace(/\.[^/.]+$/, '') + '.jpg';
        downloadFile(blob, fileName);
        showNotification('Image downloaded successfully!', 'success');
    }, 'image/jpeg', quality);
}
