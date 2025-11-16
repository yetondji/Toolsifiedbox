FreeToolBox - Project Plan
Project Overview
A multi-page tools website providing 100% client-side text, image, and file manipulation tools with a modern, responsive design similar to TinyWow and Toolerbox.

Tech Stack
HTML5: All pages
Tailwind CSS: Styling via CDN
Vanilla JavaScript: Client-side logic
pdf-lib.js: PDF manipulation
Canvas API: Image processing
Project Structure
/
├── index.html
├── PLAN.md
├── /tools/
│   ├── text-tools.html
│   ├── image-tools.html
│   ├── file-tools.html
│   ├── word-counter.html
│   ├── text-case-converter.html
│   ├── character-counter.html
│   ├── image-compressor.html
│   ├── image-to-base64.html
│   ├── pdf-merger.html
│   └── image-to-pdf.html
├── /assets/
│   ├── /css/style.css
│   ├── /js/main.js
│   └── /js/tools/
│       ├── wordCounter.js
│       ├── caseConverter.js
│       ├── characterCounter.js
│       ├── imageCompressor.js
│       ├── base64Converter.js
│       ├── pdfMerger.js
│       └── imageToPdf.js
└── /ads/
    └── placeholders.html

Pages Checklist
Core Pages
 index.html - Homepage with tool grid and search
 tools/text-tools.html - Text tools category page
 tools/image-tools.html - Image tools category page
 tools/file-tools.html - File tools category page
Text Tool Pages
 tools/word-counter.html - Count words in text
 tools/text-case-converter.html - Convert text case (UPPER/lower/Capitalize)
 tools/character-counter.html - Count characters in text
Image Tool Pages
 tools/image-compressor.html - Compress images client-side
 tools/image-to-base64.html - Convert images to Base64
File Tool Pages
 tools/pdf-merger.html - Merge multiple PDFs
 tools/image-to-pdf.html - Convert images to PDF
Tools Functionality
Text Tools
Word Counter

Input: Textarea
Output: Word count, sentence count, paragraph count
Features: Real-time counting
Text Case Converter

Input: Textarea
Output: Converted text
Options: UPPERCASE, lowercase, Capitalize Each Word, Sentence case
Character Counter

Input: Textarea
Output: Total characters, characters without spaces, special characters
Features: Real-time counting
Image Tools
Image Compressor

Input: File upload (drag & drop)
Output: Compressed image with size comparison
Features: Quality slider, download button
Image to Base64

Input: File upload
Output: Base64 string
Features: Copy to clipboard, preview
File Tools
PDF Merger

Input: Multiple PDF file uploads
Output: Single merged PDF
Features: Drag to reorder, download merged PDF
Library: pdf-lib.js
Image to PDF

Input: Multiple image uploads
Output: Single PDF with all images
Features: Drag to reorder, download PDF
Library: pdf-lib.js
UI Components
Navigation Bar
Logo/brand name
Navigation links (Home, Text Tools, Image Tools, File Tools)
Mobile hamburger menu
Footer
Quick links
Copyright notice
Ad placeholder slots
Tool Card
SVG icon
Tool name
Description
"Use Tool" button
Search Bar
Real-time filtering
Placeholder text
Clear button
Ad Integration Points
Homepage: Top banner, between tool sections, footer
Tool pages: Top banner, bottom banner
Category pages: Top and bottom
Future Expansion Ideas
More text tools: Lorem Ipsum Generator, Text Diff, Markdown to HTML
More image tools: Image Cropper, Image Resizer, Format Converter
More file tools: JSON to CSV, CSV to JSON, YAML to JSON
User preferences with localStorage
Dark mode toggle
Tool usage history
Social sharing for results
Development Progress
Phase 1: Structure & Core Pages ✓
 Project structure created
 PLAN.md documentation
 Homepage
 Category pages
 Navigation components
Phase 2: Text Tools
 Word Counter page + logic
 Text Case Converter page + logic
 Character Counter page + logic
Phase 3: Image Tools
 Image Compressor page + logic
 Image to Base64 page + logic
Phase 4: File Tools
 PDF Merger page + logic
 Image to PDF page + logic
Phase 5: Polish & Integration
 Shared JavaScript (main.js)
 Custom CSS (style.css)
 Ad placeholders
 Mobile responsiveness testing
 Cross-browser testing
Hosting Compatibility
✓ GitHub Pages compatible (relative paths)
✓ Netlify compatible
✓ No build process required
✓ All CDN resources
Notes
All paths are relative for static hosting
No server-side processing required
All tools work offline after initial load
Monetization ready with ad slots