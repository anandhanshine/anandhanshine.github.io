<#
  serve.ps1 — tiny static file server for local preview.
  Usage: powershell -ExecutionPolicy Bypass -File tools/serve.ps1 [port] [root]
#>
param(
  [int]$Port = 8765,
  [string]$Root = (Split-Path -Parent $PSScriptRoot)
)

$ErrorActionPreference = "Stop"
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "serving $Root on http://localhost:$Port/"

$mime = @{
  ".html" = "text/html; charset=utf-8"
  ".css"  = "text/css; charset=utf-8"
  ".js"   = "application/javascript; charset=utf-8"
  ".json" = "application/json; charset=utf-8"
  ".svg"  = "image/svg+xml"
  ".png"  = "image/png"
  ".jpg"  = "image/jpeg"
  ".jpeg" = "image/jpeg"
  ".webp" = "image/webp"
  ".gif"  = "image/gif"
  ".ico"  = "image/x-icon"
  ".mp4"  = "video/mp4"
  ".webm" = "video/webm"
  ".mp3"  = "audio/mpeg"
  ".woff2"= "font/woff2"
}

while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  try {
    $rel = [System.Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath).TrimStart('/')
    if ([string]::IsNullOrWhiteSpace($rel)) { $rel = "index.html" }
    $path = Join-Path $Root ($rel -replace '/', '\')
    if (-not (Test-Path $path -PathType Leaf)) {
      $ctx.Response.StatusCode = 404
      $ctx.Response.Close()
      continue
    }

    $ext = [System.IO.Path]::GetExtension($path).ToLower()
    $type = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { "application/octet-stream" }
    $length = (Get-Item -LiteralPath $path).Length

    $ctx.Response.ContentType = $type
    $ctx.Response.Headers.Add("Accept-Ranges", "bytes")

    # byte ranges keep <video> seeking (and metadata-only loads) cheap
    $range = $ctx.Request.Headers["Range"]
    $start = [int64]0
    $end = [int64]($length - 1)
    $partial = $false
    if ($range -and ($range -match 'bytes=(\d*)-(\d*)')) {
      $first = $matches[1]
      $last = $matches[2]
      if ($first -eq "" -and $last -ne "") {
        $start = [Math]::Max([int64]0, $length - [int64]$last)
        $end = [int64]($length - 1)
      } else {
        if ($first -ne "") { $start = [int64]$first }
        if ($last -ne "") { $end = [int64]$last }
        if ($end -ge $length) { $end = [int64]($length - 1) }
      }
      if ($start -gt $end) {
        $ctx.Response.StatusCode = 416
        $ctx.Response.Headers.Add("Content-Range", "bytes */$length")
        $ctx.Response.Close()
        continue
      }
      $partial = $true
    }

    $count = [int64]($end - $start + 1)
    if ($partial) {
      $ctx.Response.StatusCode = 206
      $ctx.Response.Headers.Add("Content-Range", "bytes $start-$end/$length")
    }
    $ctx.Response.ContentLength64 = $count

    $fs = [System.IO.File]::Open($path, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::ReadWrite)
    try {
      if ($ctx.Request.HttpMethod -ne "HEAD") {
        $fs.Seek($start, [System.IO.SeekOrigin]::Begin) | Out-Null
        $out = $ctx.Response.OutputStream
        $buffer = New-Object byte[] 65536
        $remaining = $count
        while ($remaining -gt 0) {
          $want = [int][Math]::Min([int64]$buffer.Length, $remaining)
          $read = $fs.Read($buffer, 0, $want)
          if ($read -le 0) { break }
          $out.Write($buffer, 0, $read)
          $remaining -= $read
        }
      }
    } finally {
      $fs.Close()
    }
    $ctx.Response.Close()
  } catch {
    try { $ctx.Response.StatusCode = 500; $ctx.Response.Close() } catch {}
  }
}
