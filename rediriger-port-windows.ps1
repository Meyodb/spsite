# Redirige le port 40000 de Windows vers WSL (à exécuter en PowerShell en tant qu'administrateur)
# Permet à http://88.160.27.73:40000/ de fonctionner quand le serveur tourne dans WSL

$port = 40000

# Récupérer l'IP de WSL
$wslIp = (wsl hostname -I 2>$null).Trim().Split()[0]
if (-not $wslIp) {
    Write-Host "Erreur: impossible d'obtenir l'IP de WSL. Lancez WSL puis réessayez." -ForegroundColor Red
    exit 1
}

Write-Host "IP WSL: $wslIp" -ForegroundColor Cyan
Write-Host "Configuration du transfert de port $port vers WSL..." -ForegroundColor Yellow

# Supprimer une ancienne règle si elle existe
netsh interface portproxy delete v4tov4 listenport=$port listenaddress=0.0.0.0 2>$null

# Ajouter la redirection Windows -> WSL
netsh interface portproxy add v4tov4 listenport=$port listenaddress=0.0.0.0 connectport=$port connectaddress=$wslIp

# Autoriser le port dans le pare-feu Windows
$ruleName = "Soup Juice port $port"
netsh advfirewall firewall delete rule name="$ruleName" 2>$null
netsh advfirewall firewall add rule name="$ruleName" dir=in action=allow protocol=TCP localport=$port

Write-Host ""
Write-Host "OK. Le trafic vers $($env:COMPUTERNAME):$port est redirige vers WSL ($wslIp:$port)." -ForegroundColor Green
Write-Host "Assurez-vous que le serveur tourne dans WSL (./mettre-en-ligne.sh ou PORT=40000 node server.js)." -ForegroundColor Gray
Write-Host "Site: http://88.160.27.73:$port/" -ForegroundColor Gray
