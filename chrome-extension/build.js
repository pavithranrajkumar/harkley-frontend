/**
 * Build Script for Harkley Extension
 * Copies and organizes files for distribution
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Source and destination directories
const srcDir = path.join(__dirname, 'src');
const distDir = path.join(__dirname, 'dist');
const assetsDir = path.join(__dirname, 'assets');

// Files to copy
const filesToCopy = [
  // Manifest
  { src: 'manifest.json', dest: 'manifest.json' },

  // Popup files
  { src: 'src/popup/popup.html', dest: 'popup.html' },
  { src: 'src/popup/popup.css', dest: 'popup.css' },
  { src: 'dist/popup.js', dest: 'popup.js' },

  // Content script (bundled by webpack)
  { src: 'dist/content.js', dest: 'content.js' },
];

/**
 * Ensure directory exists
 * @param {string} dirPath - Directory path
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Copy file
 * @param {string} src - Source file path
 * @param {string} dest - Destination file path
 */
function copyFile(src, dest) {
  try {
    const destDir = path.dirname(dest);
    ensureDir(destDir);

    if (!fs.existsSync(src)) {
      console.warn(`⚠️  Source file not found: ${src}`);
      return;
    }

    fs.copyFileSync(src, dest);
    console.log(`✓ Copied: ${src} → ${dest}`);
  } catch (error) {
    console.error(`✗ Failed to copy ${src}:`, error.message);
  }
}

/**
 * Copy directory recursively
 * @param {string} src - Source directory
 * @param {string} dest - Destination directory
 */
function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn(`Source directory does not exist: ${src}`);
    return;
  }

  ensureDir(dest);

  const items = fs.readdirSync(src);

  items.forEach((item) => {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);

    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFile(srcPath, destPath);
    }
  });
}

/**
 * Bundle with webpack
 */
function bundleWithWebpack() {
  try {
    console.log('🔧 Bundling with webpack...');
    execSync('npx webpack', { stdio: 'inherit' });
    console.log('✓ Webpack bundling completed');
  } catch (error) {
    console.error('✗ Webpack bundling failed:', error.message);
    process.exit(1);
  }
}

/**
 * Main build function
 */
function build() {
  console.log('🚀 Building Harkley Extension...\n');

  // Clean dist directory
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
  }
  ensureDir(distDir);

  // Bundle with webpack first
  bundleWithWebpack();

  // Copy files
  filesToCopy.forEach((file) => {
    const srcPath = path.join(__dirname, file.src);
    const destPath = path.join(distDir, file.dest);
    copyFile(srcPath, destPath);
  });

  // Copy assets directory if it exists
  if (fs.existsSync(assetsDir)) {
    console.log('\n📁 Copying assets...');
    copyDir(assetsDir, path.join(distDir, 'assets'));
  } else {
    console.log('\n⚠️  Assets directory not found, creating placeholder icons...');
    createPlaceholderIcons();
  }

  console.log('\n✅ Build completed successfully!');
  console.log(`📦 Extension files ready in: ${distDir}`);
  console.log('\n📋 Next steps:');
  console.log('1. Open Harkley and go to chrome://extensions/');
  console.log('2. Enable "Developer mode"');
  console.log('3. Click "Load unpacked" and select the dist folder');
  console.log('4. The extension should now appear in your toolbar!');
}

/**
 * Create placeholder icons for development
 */
function createPlaceholderIcons() {
  const assetsDistDir = path.join(distDir, 'assets');
  ensureDir(assetsDistDir);

  // Create a simple SVG icon
  const svgIcon = `<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
    <rect width="128" height="128" rx="20" fill="#3b82f6"/>
    <circle cx="64" cy="64" r="40" fill="white" opacity="0.9"/>
    <circle cx="64" cy="64" r="20" fill="#3b82f6"/>
  </svg>`;

  // Create different sizes
  const sizes = [16, 32, 48, 128];
  sizes.forEach((size) => {
    const iconPath = path.join(assetsDistDir, `icon-${size}.png`);
    // For now, just create a placeholder file
    fs.writeFileSync(iconPath, `<!-- Placeholder icon ${size}x${size} -->`);
    console.log(`✓ Created placeholder: icon-${size}.png`);
  });
}

// Run build
build();
