# Generates one WAV per narration beat using the local Windows speech engine.
# No API key, no network call: everything is produced offline.

param(
  [Parameter(Mandatory = $true)][string]$ScriptPath,
  [Parameter(Mandatory = $true)][string]$OutDir
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech

$spec = Get-Content -Path $ScriptPath -Raw | ConvertFrom-Json
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$installed = $synth.GetInstalledVoices() | ForEach-Object { $_.VoiceInfo.Name }

# Prefer the requested voice, then any non-"Desktop" voice (those are the newer,
# noticeably clearer engines), then whatever is present.
$voice = $installed | Where-Object { $_ -eq $spec.voice } | Select-Object -First 1
if (-not $voice) { $voice = $installed | Where-Object { $_ -notlike '*Desktop*' } | Select-Object -First 1 }
if (-not $voice) { $voice = $installed | Select-Object -First 1 }
if (-not $voice) { throw 'No speech voices are installed on this machine.' }

$synth.SelectVoice($voice)
$synth.Rate = [int]$spec.rate
$synth.Volume = 100

Write-Host "Requested: '$($spec.voice)' | Available: $($installed -join ', ')"
Write-Host "Selected:  '$voice' (rate $($spec.rate))"

foreach ($beat in $spec.beats) {
  $path = Join-Path $OutDir "$($beat.id).wav"
  $synth.SetOutputToWaveFile($path)
  $synth.Speak($beat.speech)
  $synth.SetOutputToNull()   # flushes and closes the file handle
  $size = (Get-Item $path).Length
  Write-Host ("  {0,-14} {1,8:N0} bytes" -f $beat.id, $size)
}

$synth.Dispose()
Write-Host "Narration audio written to $OutDir"
