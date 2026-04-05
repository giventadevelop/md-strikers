# Requires ffmpeg on PATH (e.g. winget install Gyan.FFmpeg  OR  choco install ffmpeg)
# Produces: public/images/md_strikers_media/md_media/hero-home-ambient.mp4
# - First 39 seconds only
# - Scales to cover 1920x1080 then center-crops (removes typical letterbox/pillarbox from phone video)
# - H.264 + yuv420p for broad browser support; silent AAC stereo (Chrome often freezes / breaks loop on video-only -an MP4)
# - faststart for web
#
# Trim-only (no crop), if you prefer to fix framing in DaVinci / Premiere first:
# ffmpeg -y -i "<source.mp4>" -t 39 -c:v libx264 -pix_fmt yuv420p -crf 23 -an -movflags +faststart hero-home-ambient.mp4

$ErrorActionPreference = "Stop"
$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path

$src = Join-Path $root "public\images\md_strikers_media\md_media\WhatsApp Video 2026-03-24 at 10.56.17 AM.mp4"
$dst = Join-Path $root "public\images\md_strikers_media\md_media\hero-home-ambient.mp4"

if (-not (Test-Path $src)) {
  Write-Error "Source not found: $src"
}

$ffmpeg = Get-Command ffmpeg -ErrorAction SilentlyContinue
if (-not $ffmpeg) {
  Write-Host "ffmpeg not found. Install: winget install --id Gyan.FFmpeg -e" -ForegroundColor Yellow
  Write-Host "Or: https://www.gyan.dev/ffmpeg/builds/ (full build) and add bin to PATH" -ForegroundColor Yellow
  exit 1
}

Write-Host "Encoding 39s, 1920x1080 cover crop -> $dst" -ForegroundColor Cyan

# Silent audio keeps Chrome's media pipeline happy (video-only files are a known edge case).
& ffmpeg -y `
  -t 39 -i $src `
  -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=44100 `
  -map 0:v:0 -map 1:a:0 `
  -vf "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080" `
  -c:v libx264 -pix_fmt yuv420p -crf 23 -preset medium `
  -c:a aac -b:a 96k `
  -shortest `
  -movflags +faststart `
  $dst

if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Write-Host "Done." -ForegroundColor Green

# Optional: add silent AAC to an existing video-only file without re-encoding video:
# ffmpeg -y -i $dst -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=44100 -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 96k -shortest -movflags +faststart "$dst.tmp" ; Move-Item -Force "$dst.tmp" $dst
