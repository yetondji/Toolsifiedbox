// PDF Merger Tool Logic

let pdfFiles = [];
let mergedPdfBytes = null;

function handleFileSelect(event) {
    const files = Array.from(event.target.files);
    addPdfFiles(files);
}

function handlePdfDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove('drag-over');
    
    const files = Array.from(event.dataTransfer.files);
    const pdfFilesOnly = files.filter(file => file.type === 'application/pdf');
    
    if (pdfFilesOnly.length === 0) {
        showNotification('Please upload PDF files only', 'error');
        return;
    }
    
    addPdfFiles(pdfFilesOnly);
}

function addPdfFiles(files) {
    const validFiles = files.filter(file => file.type === 'application/pdf');
    
    if (validFiles.length === 0) {
        showNotification('Please upload valid PDF files', 'error');
        return;
    }
    
    pdfFiles = pdfFiles.concat(validFiles);
    updatePdfList();
    showNotification(`${validFiles.length} PDF file(s) added`, 'success');
}

function updatePdfList() {
    const listContainer = document.getElementById('pdf-list-container');
    const list = document.getElementById('pdf-list');
    
    if (pdfFiles.length === 0) {
        listContainer.classList.add('hidden');
        return;
    }
    
    listContainer.classList.remove('hidden');
    list.innerHTML = '';
    
    pdfFiles.forEach((file, index) => {
        const item = document.createElement('div');
        item.className = 'flex items-center justify-between bg-gray-50 p-3 rounded-lg';
        item.innerHTML = `
            <div class="flex items-center space-x-3">
                <span class="text-gray-500 font-semibold">${index + 1}.</span>
                <svg class="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd"></path>
                </svg>
                <span class="text-gray-700">${file.name}</span>
                <span class="text-gray-500 text-sm">(${formatFileSize(file.size)})</span>
            </div>
            <button 
                onclick="removePdf(${index})" 
                class="text-red-500 hover:text-red-700"
            >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        `;
        list.appendChild(item);
    });
}

function removePdf(index) {
    pdfFiles.splice(index, 1);
    updatePdfList();
    showNotification('PDF removed', 'info');
}

function clearAll() {
    pdfFiles = [];
    mergedPdfBytes = null;
    updatePdfList();
    document.getElementById('result-section').classList.add('hidden');
    showNotification('All files cleared', 'info');
}

async function mergePdfs() {
    if (pdfFiles.length < 2) {
        showNotification('Please upload at least 2 PDF files to merge', 'error');
        return;
    }
    
    document.getElementById('loading').classList.remove('hidden');
    document.getElementById('merge-button').disabled = true;
    
    try {
        const { PDFDocument } = window.PDFLib;
        const mergedPdf = await PDFDocument.create();
        
        for (const file of pdfFiles) {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await PDFDocument.load(arrayBuffer);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach((page) => mergedPdf.addPage(page));
        }
        
        mergedPdfBytes = await mergedPdf.save();
        
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('result-section').classList.remove('hidden');
        document.getElementById('merge-button').disabled = false;
        
        showNotification('PDFs merged successfully!', 'success');
        
    } catch (error) {
        console.error('Error merging PDFs:', error);
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('merge-button').disabled = false;
        showNotification('Error merging PDFs. Please try again.', 'error');
    }
}

function downloadMergedPdf() {
    if (!mergedPdfBytes) {
        showNotification('Please merge PDFs first', 'error');
        return;
    }
    
    const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
    const timestamp = new Date().toISOString().slice(0, 10);
    downloadFile(blob, `merged_${timestamp}.pdf`);
    showNotification('Merged PDF downloaded!', 'success');
}
