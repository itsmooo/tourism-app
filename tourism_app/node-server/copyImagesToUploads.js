const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '../assets/places');
const targetDir = path.join(__dirname, 'uploads');

console.log('🖼️ Copying images to uploads folder...');
console.log('Source:', sourceDir);
console.log('Target:', targetDir);

// Ensure uploads directory exists
if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
    console.log('✅ Created uploads directory');
}

// Check if source directory exists
if (!fs.existsSync(sourceDir)) {
    console.log('❌ Source directory not found:', sourceDir);
    process.exit(1);
}

// Copy all images
const files = fs.readdirSync(sourceDir);
let copiedCount = 0;

files.forEach(file => {
    const sourcePath = path.join(sourceDir, file);
    const targetPath = path.join(targetDir, file);
    
    if (fs.statSync(sourcePath).isFile()) {
        try {
            fs.copyFileSync(sourcePath, targetPath);
            console.log(`✅ Copied: ${file}`);
            copiedCount++;
        } catch (error) {
            console.log(`❌ Failed to copy ${file}:`, error.message);
        }
    }
});

console.log(`🎉 Successfully copied ${copiedCount} images to uploads folder!`);
console.log('📍 Images are now accessible at: http://localhost:9000/uploads/filename.jpg');
