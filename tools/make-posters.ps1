<#
  make-posters.ps1 â€” generates the six project poster artworks as SVG.
  Run:  powershell -ExecutionPolicy Bypass -File tools/make-posters.ps1
  Every poster is built for a circular crop (the discs are round), so all
  type sits inside the middle safe zone.
#>

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$out  = Join-Path $root "assets\img"
if (-not (Test-Path $out)) { New-Item -ItemType Directory -Path $out | Out-Null }

$projects = @(
  @{ n = 1; title = "NEON";     title2 = "ABYSS";   tag = "UNREAL ENGINE 5";  sub = "A DROWNED CITY THAT SELLS MEMORY";  a = "#2ef0d6"; b = "#b79bff"; shape = "rings" }
  @{ n = 2; title = "HOLLOW";   title2 = "SPIRE";   tag = "UNITY";             sub = "EVERY FLOOR IS A DIFFERENT MONSTER";  a = "#b79bff"; b = "#4f6bff"; shape = "spire" }
  @{ n = 3; title = "DRIFT";    title2 = "CIRCUIT"; tag = "UNREAL ENGINE 5";  sub = "GRIP IS A DECISION, NOT A BUTTON";     a = "#2ef0d6"; b = "#3ea0ff"; shape = "chevron" }
  @{ n = 4; title = "POCKET";   title2 = "TITAN";   tag = "UNITY";             sub = "TWENTY MINUTES. FORTY HOURS.";        a = "#b79bff"; b = "#2ef0d6"; shape = "hex" }
  @{ n = 5; title = "SIGNAL";   title2 = "LOST";    tag = "UNREAL ENGINE 5";  sub = "THE FREQUENCY KNOWS YOUR NAME";      a = "#5ef0ff"; b = "#7a5cf0"; shape = "wave" }
  @{ n = 6; title = "BLOOM";    title2 = "PROTOCOL";tag = "UNITY";             sub = "GROW A GARDEN INSIDE A MACHINE";      a = "#b79bff"; b = "#2ef0d6"; shape = "bloom" }
)

function Get-Shape {
  param($kind, $a, $b)

  switch ($kind) {
    "rings" {
      $s = ""
      for ($i = 0; $i -lt 9; $i++) {
        $r = 70 + $i * 42
        $op = [math]::Round(0.5 - $i * 0.05, 3)
        $sw = 10 - $i
        if ($sw -lt 1) { $sw = 1 }
        $col = if ($i % 2 -eq 0) { $a } else { $b }
        $s += "<circle cx='450' cy='450' r='$r' fill='none' stroke='$col' stroke-width='$sw' opacity='$op'/>"
      }
      $s += "<circle cx='450' cy='450' r='52' fill='url(#core)'/>"
      $s += "<circle cx='450' cy='450' r='18' fill='#05060a'/>"
      return $s
    }
    "spire" {
      $s = ""
      for ($i = 0; $i -lt 7; $i++) {
        $y = 690 - $i * 76
        $w = 300 - $i * 38
        $h = 120
        $col = if ($i % 2 -eq 0) { $a } else { $b }
        $op = [math]::Round(0.24 + $i * 0.1, 3)
        $s += "<polygon points='450,$($y - $h) $($w + 450),$y $($w - 450 + 450),$y' fill='none' stroke='$col' stroke-width='5' opacity='$op'/>"
      }
      $s += "<polygon points='450,150 590,700 310,700' fill='url(#core)' opacity='.5'/>"
      return $s
    }
    "chevron" {
      $s = ""
      for ($i = 0; $i -lt 7; $i++) {
        $off = 120 + $i * 62
        $op = [math]::Round(0.14 + $i * 0.11, 3)
        $col = if ($i % 3 -eq 0) { $b } else { $a }
        $s += "<path d='M150 $($off + 210) L450 $($off) L750 $($off + 210) L750 $($off + 250) L450 $($off + 40) L150 $($off + 250) Z' fill='none' stroke='$col' stroke-width='6' opacity='$op' stroke-linejoin='round'/>"
      }
      return $s
    }
    "hex" {
      $s = ""
      $r = 78
      for ($row = -1; $row -le 8; $row++) {
        for ($col = -1; $col -le 8; $col++) {
          $cx = 450 + $col * $r * 1.74
          $cy = 450 + $row * $r * 1.5 + ($(if ($col % 2 -eq 0) { 0 } else { $r * 0.75 }))
          if ([math]::Abs($cx - 450) -gt 330 -or [math]::Abs($cy - 450) -gt 330) { continue }
          $op = [math]::Round(0.1 + (0.5 - [math]::Abs($cy - 450) / 700), 3)
          $col2 = if (($row + $col) % 2 -eq 0) { $a } else { $b }
          $pts = ""
          for ($k = 0; $k -lt 6; $k++) {
            $ang = 60 * $k - 30
            $px = [math]::Round($cx + $r * 0.86 * [math]::Cos($ang * [math]::PI / 180), 1)
            $py = [math]::Round($cy + $r * 0.86 * [math]::Sin($ang * [math]::PI / 180), 1)
            $pts += "$px,$py "
          }
          $s += "<polygon points='$pts' fill='none' stroke='$col2' stroke-width='3' opacity='$op'/>"
        }
      }
      $s += "<polygon points='450,300 606,375 606,525 450,600 294,525 294,375' fill='url(#core)' opacity='.75'/>"
      $s += "<polygon points='450,340 570,400 570,500 450,560 330,500 330,400' fill='none' stroke='$a' stroke-width='6' opacity='.9'/>"
      return $s
    }
    "wave" {
      $s = ""
      for ($i = 0; $i -lt 46; $i++) {
        $x = 90 + $i * 15.6
        $h = 40 + 300 * [math]::Abs([math]::Sin($i * 0.55)) * (0.35 + 0.65 * [math]::Abs([math]::Cos($i * 0.19)))
        $col = if ($i % 3 -eq 0) { $b } else { $a }
        $op = [math]::Round(0.25 + 0.6 * [math]::Abs([math]::Sin($i * 0.4)), 2)
        $s += "<rect x='$([math]::Round($x,1))' y='$([math]::Round(450 - $h,1))' width='6' height='$([math]::Round($h * 2,1))' fill='$col' opacity='$op' rx='3'/>"
      }
      $s += "<circle cx='450' cy='450' r='120' fill='url(#core)' opacity='.55'/>"
      $s += "<circle cx='450' cy='450' r='150' fill='none' stroke='$a' stroke-width='3' opacity='.45' stroke-dasharray='14 10'/>"
      return $s
    }
    "bloom" {
      $s = ""
      for ($i = 0; $i -lt 12; $i++) {
        $ang = $i * 30
        $col = if ($i % 2 -eq 0) { $a } else { $b }
        $op = [math]::Round(0.16 + 0.1 * ($i % 3), 3)
        $s += "<ellipse cx='450' cy='450' rx='70' ry='230' fill='none' stroke='$col' stroke-width='5' opacity='$op' transform='rotate($ang 450 450)'/>"
      }
      $s += "<circle cx='450' cy='450' r='86' fill='url(#core)'/>"
      $s += "<circle cx='450' cy='450' r='34' fill='#05060a'/>"
      return $s
    }
  }
  return ""
}

foreach ($p in $projects) {
  $shape = Get-Shape -kind $p.shape -a $p.a -b $p.b
  $idx = "{0:D2}" -f $p.n

  $svg = @"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 900" width="900" height="900" role="img" aria-label="$($p.title) $($p.title2) poster">
  <defs>
    <radialGradient id="bg" cx="50%" cy="42%" r="72%">
      <stop offset="0%" stop-color="#131a2c"/>
      <stop offset="55%" stop-color="#080a12"/>
      <stop offset="100%" stop-color="#04050a"/>
    </radialGradient>
    <radialGradient id="core" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="$($p.a)" stop-opacity=".95"/>
      <stop offset="55%" stop-color="$($p.b)" stop-opacity=".35"/>
      <stop offset="100%" stop-color="$($p.b)" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="typ" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="60%" stop-color="$($p.a)"/>
      <stop offset="100%" stop-color="$($p.b)"/>
    </linearGradient>
    <pattern id="scan" width="6" height="6" patternUnits="userSpaceOnUse">
      <rect width="6" height="3" fill="#ffffff" opacity=".035"/>
    </pattern>
    <filter id="soft" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="22"/>
    </filter>
  </defs>

  <rect width="900" height="900" fill="url(#bg)"/>
  <circle cx="450" cy="430" r="330" fill="$($p.b)" opacity=".12" filter="url(#soft)"/>
  <circle cx="450" cy="470" r="250" fill="$($p.a)" opacity=".1" filter="url(#soft)"/>

  <g>$shape</g>

  <rect width="900" height="900" fill="url(#scan)"/>
  <circle cx="450" cy="450" r="446" fill="none" stroke="#ffffff" stroke-opacity=".07" stroke-width="2"/>

  <g font-family="'Arial Black','Segoe UI',Arial,sans-serif" font-weight="900" text-anchor="middle">
    <text x="450" y="300" font-size="26" letter-spacing="9" fill="$($p.a)" opacity=".95">$($p.tag)</text>
    <text x="450" y="585" font-size="104" letter-spacing="4" fill="url(#typ)">$($p.title)</text>
    <text x="450" y="685" font-size="104" letter-spacing="4" fill="url(#typ)">$($p.title2)</text>
  </g>
  <g font-family="'Segoe UI',Arial,sans-serif" text-anchor="middle">
    <text x="450" y="748" font-size="21" letter-spacing="5" fill="#c9d3e6" opacity=".8">$($p.sub)</text>
  </g>

  <g font-family="'Arial Black','Segoe UI',Arial,sans-serif" font-weight="900">
    <text x="450" y="128" font-size="64" text-anchor="middle" fill="none" stroke="$($p.a)" stroke-width="2" opacity=".85">$idx</text>
  </g>
  <g stroke="$($p.b)" stroke-width="3" opacity=".7">
    <line x1="250" y1="152" x2="380" y2="152"/>
    <line x1="520" y1="152" x2="650" y2="152"/>
    <line x1="250" y1="800" x2="650" y2="800" opacity=".5"/>
  </g>
  <g fill="$($p.a)">
    <rect x="238" y="144" width="8" height="8"/>
    <rect x="654" y="144" width="8" height="8"/>
  </g>
</svg>
"@

  $file = Join-Path $out ("poster-{0}.svg" -f $idx)
  Set-Content -Path $file -Value $svg -Encoding UTF8
  Write-Host "wrote $file"
}

Write-Host "posters done"

