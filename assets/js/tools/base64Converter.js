// Image to Base64 Converter Tool Logic

let base64String = '';
let imageType = '';

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        processImageFile(file);
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
            processImageFile(file);
        } else {
            showNotification('Please upload an image file', 'error');
        }
    }
}

function processImageFile(file) {
    if (!file.type.startsWith('image/')) {
        showNotification('Please upload an image file', 'error');
        return;
    }
    
    imageType = file.type;
    const reader = new FileReader();
    
    reader.onload = function(e) {
        base64String = e.target.result;
        
        const img = new Image();
        img.onload = function() {
            document.getElementById('image-preview').src = base64String;
            document.getElementById('file-size').textContent = formatFileSize(file.size);
            document.getElementById('dimensions').textContent = `${img.width} x ${img.height} px`;
            
            const base64Only = base64String.split(',')[1];
            document.getElementById('base64-output').value = base64Only;
            document.getElementById('base64-length').textContent = base64Only.length.toLocaleString();
            
            document.getElementById('css-output').value = `background-image: url('${base64String}');`;
            
            document.getElementById('html-output').value = `<img src="${base64String}" alt="Base64 Image">`;
            
            document.getElementById('result-section').classList.remove('hidden');
            
            showNotification('Image converted to Base64 successfully!', 'success');
        };
        img.src = base64String;
    };
    
    reader.readAsDataURL(file);
}

function copyBase64() {
    const base64Output = document.getElementById('base64-output').value;
    
    if (!base64Output) {
        showNotification('Please convert an image first', 'error');
        return;
    }
    
    copyToClipboard(base64Output);
}

function copyCssDataUri() {
    const cssOutput = document.getElementById('css-output').value;
    
    if (!cssOutput) {
        showNotification('Please convert an image first', 'error');
        return;
    }
    
    copyToClipboard(cssOutput);
}

function copyHtmlTag() {
    const htmlOutput = document.getElementById('html-output').value;
    
    if (!htmlOutput) {
        showNotification('Please convert an image first', 'error');
        return;
    }
    
    copyToClipboard(htmlOutput);
}
