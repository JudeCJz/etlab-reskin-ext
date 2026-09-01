# build-release.ps1 — Generates a clean production release ZIP

$ErrorActionPreference = "Stop"
$rootDir = $PSScriptRoot
$releaseDir = Join-Path $rootDir "release"
$stagingDir = Join-Path $releaseDir "staging"
$zipPath = Join-Path $releaseDir "etlab-mits-reskin-v1.2.0.zip"

Write-Host "Creating release package for ETLab MITS Reskin v1.2.0..."

# Create clean directories
if (Test-Path $releaseDir) {
    Remove-Item -Recurse -Force $releaseDir
}
New-Item -ItemType Directory -Path $stagingDir -Force | Out-Null

# Copy production files
Copy-Item (Join-Path $rootDir "manifest.json") -Destination $stagingDir
Copy-Item (Join-Path $rootDir "content.js") -Destination $stagingDir
Copy-Item (Join-Path $rootDir "reskin.css") -Destination $stagingDir
Copy-Item (Join-Path $rootDir "popup.html") -Destination $stagingDir
Copy-Item (Join-Path $rootDir "popup.js") -Destination $stagingDir
Copy-Item (Join-Path $rootDir "README.md") -Destination $stagingDir
Copy-Item (Join-Path $rootDir "INSTALL.txt") -Destination $stagingDir
Copy-Item -Recurse (Join-Path $rootDir "icons") -Destination $stagingDir

# Compress to ZIP
Compress-Archive -Path "$stagingDir\*" -DestinationPath $zipPath -Force

# Clean staging folder
Remove-Item -Recurse -Force $stagingDir

Write-Host "Release created successfully at: $zipPath"
Get-Item $zipPath | Select-Object Name, Length, LastWriteTime
