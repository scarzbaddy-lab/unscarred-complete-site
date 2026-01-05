# ====================================================
# CONVERT SVG THUMBNAILS TO PNG FOR PAYHIP
# ====================================================
# Run this script in PowerShell to convert all SVG thumbnails to PNG
# 
# OPTION 1: Use Inkscape (if installed)
# OPTION 2: Use online batch converter
# OPTION 3: Use Node.js with sharp (if you have Node)
#
# This script uses Inkscape method by default
# ====================================================

$thumbnailsDir = ".\thumbnails"
$outputDir = ".\thumbnails-png"

# Create output directory if it doesn't exist
if (!(Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir
    Write-Host "Created output directory: $outputDir" -ForegroundColor Green
}

# Check if Inkscape is installed
$inkscapePath = "C:\Program Files\Inkscape\bin\inkscape.exe"
if (!(Test-Path $inkscapePath)) {
    $inkscapePath = "inkscape" # Try PATH
}

# Get all SVG files
$svgFiles = Get-ChildItem -Path $thumbnailsDir -Filter "*.svg"
$total = $svgFiles.Count
$current = 0

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  UNSCARRED SVG TO PNG CONVERTER" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Found $total SVG files to convert" -ForegroundColor Yellow
Write-Host ""

foreach ($svg in $svgFiles) {
    $current++
    $outputFile = Join-Path $outputDir ($svg.BaseName + ".png")
    
    Write-Host "[$current/$total] Converting: $($svg.Name)" -ForegroundColor White
    
    try {
        # Try Inkscape first
        & $inkscapePath --export-type=png --export-filename="$outputFile" --export-width=1600 "$($svg.FullName)" 2>$null
        
        if (Test-Path $outputFile) {
            Write-Host "         ✓ Success: $($svg.BaseName).png" -ForegroundColor Green
        } else {
            Write-Host "         ✗ Failed - see manual options below" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "         ✗ Error: Inkscape not found or failed" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  CONVERSION COMPLETE" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "PNG files saved to: $outputDir" -ForegroundColor Green
Write-Host ""

# Count successful conversions
$pngCount = (Get-ChildItem -Path $outputDir -Filter "*.png" -ErrorAction SilentlyContinue).Count
Write-Host "Converted: $pngCount / $total files" -ForegroundColor Yellow
Write-Host ""

if ($pngCount -lt $total) {
    Write-Host "================================================" -ForegroundColor Yellow
    Write-Host "  ALTERNATIVE METHODS (if Inkscape fails)" -ForegroundColor Yellow
    Write-Host "================================================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "OPTION 1: Install Inkscape" -ForegroundColor Cyan
    Write-Host "  Download: https://inkscape.org/release/" 
    Write-Host "  Then run this script again" 
    Write-Host ""
    Write-Host "OPTION 2: Online Batch Converter" -ForegroundColor Cyan
    Write-Host "  Go to: https://cloudconvert.com/svg-to-png"
    Write-Host "  Upload all SVG files, download PNGs"
    Write-Host ""
    Write-Host "OPTION 3: Canva" -ForegroundColor Cyan
    Write-Host "  1. Go to canva.com"
    Write-Host "  2. Create new design 1600x900"
    Write-Host "  3. Upload SVG, download as PNG"
    Write-Host ""
}





