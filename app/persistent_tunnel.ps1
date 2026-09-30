$ErrorActionPreference = "Continue"
Write-Output "Starting persistent tunnel loop..."

while ($true) {
    try {
        $p = Start-Process -FilePath "ssh" -ArgumentList "-o StrictHostKeyChecking=no -o ServerAliveInterval=15 -R 80:localhost:8081 nokey@localhost.run" -NoNewWindow -PassThru -RedirectStandardOutput "tunnel_out.log" -RedirectStandardError "tunnel_err.log"
        Start-Sleep -Seconds 5
        if (Test-Path "tunnel_out.log") {
            $content = Get-Content "tunnel_out.log" -Raw
            if ($content -match "https://[a-zA-Z0-9.-]+\.lhr\.life") {
                $url = $matches[0]
                Set-Content -Path "tunnel_url.txt" -Value $url
                Write-Output "Current Tunnel URL: $url"
            }
        }
        $p.WaitForExit()
    } catch {
        Write-Output "Tunnel error: $($_.Exception.Message)"
    }
    Start-Sleep -Seconds 2
}
