Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.SelectVoice('Microsoft Zira Desktop')
$synth.Rate = 1  # Brisk and lively for exact 60-second video

$scenes = @(
    "Welcome to Giggles, The Baby Who Makes the Internet Smile! Built for the haX-baby hackathon, this retro pastel desktop brings pure childlike joy.",
    "In Candyland Creator, compose dream artwork with custom baby stickers, sparkling candy brushes, colorful stamps, and one-click export.",
    "Relax in Giggles' Dream Library, featuring whimsical storybooks, soothing lullabies, and an ambient sleep soundboard for sweet dreams.",
    "Launch Giggles into candy clouds in Rainbow Launch! An arcade mini-game with bouncy trampolines, star combos, and confetti celebrations.",
    "Experience Baby-Me Magic powered by Google Gemini AI! Upload any portrait to generate an adorable baby version with rosy cheeks and sparkling eyes.",
    "Leave your wish on the interactive Baby Guestbook! Fully mobile responsive and deployed live right now on Vercel at giggles-candyland-creator.vercel.app!"
)

for ($i = 0; $i -lt $scenes.Count; $i++) {
    $idx = $i + 1
    $outPath = "D:\pips-dream-studio\scene_${idx}_60s.wav"
    $synth.SetOutputToWaveFile($outPath)
    $synth.Speak($scenes[$i])
    $synth.SetOutputToNull()
    
    $file = [System.IO.File]::OpenRead($outPath)
    $reader = New-Object System.IO.BinaryReader($file)
    $reader.BaseStream.Seek(28, [System.IO.SeekOrigin]::Begin) | Out-Null
    $byteRate = $reader.ReadInt32()
    $reader.BaseStream.Seek(40, [System.IO.SeekOrigin]::Begin) | Out-Null
    $dataLen = $reader.ReadInt32()
    $duration = $dataLen / $byteRate
    $reader.Close()
    $file.Close()
    
    Write-Host ("Scene " + $idx + ": " + [math]::Round($duration, 2) + " seconds")
}
