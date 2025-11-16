// Image to PDF Converter Tool Logic

let imageFiles = [];
let pdfBytes = null;

function handleFileSelect(event) {
    const files = Array.from(event.target.files);
    addImageFiles(files);
}

function handleImageDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove('drag-over');
    
    const files = Array.from(event.dataTransfer.files);
    const imageFilesOnly = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFilesOnly.length === 0) {
        showNotification('Please upload image files only', 'error');
        return;
    }
    
    addImageFiles(imageFilesOnly);
}

function addImageFiles(files) {
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (validFiles.length === 0) {
        showNotification('Please upload valid image files', 'error');
        return;
    }
    
    imageFiles = imageFiles.concat(validFiles);
    updateImageList();
    showNotification(`${validFiles.length} image(s) added`, 'success');
}

async function updateImageList() {
    const listContainer = document.getElementById('image-list-container');
    const list = document.getElementById('image-list');
    
    if (imageFiles.length === 0) {
        listContainer.classList.add('hidden');
        return;
    }
    
    listContainer.classList.remove('hidden');
    list.innerHTML = '';
    
    for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const item = document.createElement('div');
            item.className = 'relative bg-gray-100 rounded-lg overflow-hidden';
            item.innerHTML = `
                <img src="${e.target.result}" class="w-full h-32 object-cover" alt="${file.name}">
                <div class="absolute top-2 right-2">
                    <button 
                        onclick="removeImage(${i})" 
                        class="bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                <div class="p-2">
                    <p class="text-xs text-gray-600 truncate">${file.name}</p>
                    <p class="text-xs text-gray-500">${formatFileSize(file.size)}</p>
                </div>
            `;
            list.appendChild(item);
        };
        
        reader.readAsDataURL(file);
    }
}

function removeImage(index) {
    imageFiles.splice(index, 1);
    updateImageList();
    showNotification('Image removed', 'info');
}

function clearAll() {
    imageFiles = [];
    pdfBytes = null;
    updateImageList();
    document.getElementById('result-section').classList.add('hidden');
    showNotification('All files cleared', 'info');
}

async function createPdf() {
    if (imageFiles.length === 0) {
        showNotification('Please upload at least one image', 'error');
        return;
    }
    
    document.getElementById('loading').classList.remove('hidden');
    document.getElementById('create-button').disabled = true;
    
    try {
        const { PDFDocument } = window.PDFLib;
        const pdfDoc = await PDFDocument.create();
        
        for (const file of imageFiles) {
            const arrayBuffer = await file.arrayBuffer();
            
            let image;
            if (file.type === 'image/png') {
                image = await pdfDoc.embedPng(arrayBuffer);
            } else if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
                image = await pdfDoc.embedJpg(arrayBuffer);
            } else {
                const reader = new FileReader();
                const base64 = await new Promise((resolve) => {
                    reader.onload = () => resolve(reader.result);
                    reader.readAsDataURL(file);
                });
                
                const jpgArrayBuffer = await fetch(base64).then(r => r.arrayBuffer());
                image = await pdfDoc.embedJpg(jpgArrayBuffer);
            }
            
            const page = pdfDoc.addPage();
            const { width, height } = page.getSize();
            
            const imageAspectRatio = image.width / image.height;
            const pageAspectRatio = width / height;
            
            let drawWidth, drawHeight;
            if (imageAspectRatio > pageAspectRatio) {
                drawWidth = width;
                drawHeight = width / imageAspectRatio;
            } else {
                drawHeight = height;
                drawWidth = height * imageAspectRatio;
            }
            
            const x = (width - drawWidth) / 2;
            const y = (height - drawHeight) / 2;
            
            page.drawImage(image, {
                x: x,
                y: y,
                width: drawWidth,
                height: drawHeight,
            });
        }
        
        pdfBytes = await pdfDoc.save();
        
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('result-section').classList.remove('hidden');
        document.getElementById('create-button').disabled = false;
        
        showNotification('PDF created successfully!', 'success');
        
    } catch (error) {
        console.error('Error creating PDF:', error);
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('create-button').disabled = false;
        showNotification('Error creating PDF. Please try again.', 'error');
    }
}

function downloadPdf() {
    if (!pdfBytes) {
        showNotification('Please create a PDF first', 'error');
        return;
    }
    
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const timestamp = new Date().toISOString().slice(0, 10);
    downloadFile(blob, `images_to_pdf_${timestamp}.pdf`);
    showNotification('PDF downloaded!', 'success');
}
