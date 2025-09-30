# PowerShell script to update KV namespace
$json = @'
[{"id":"cabin-12","name":"Riverside Cabin 12","activities":[{"slug":"archery","label":"Archery"},{"slug":"kayaking","label":"Kayaking"},{"slug":"ziplining","label":"Ziplining"},{"slug":"snorkeling","label":"Snorkeling"},{"slug":"safari-tour","label":"Safari Tour"},{"slug":"boat-tour","label":"Boat Tour"},{"slug":"spelunking","label":"Spelunking"},{"slug":"scuba-diving","label":"Scuba Diving"},{"slug":"paragliding","label":"Paragliding"},{"slug":"bungee-jumping","label":"Bungee Jumping"}]}]
'@

Write-Host "Updating KV namespace with activities data..." -ForegroundColor Green

# For local development
wrangler kv key put --binding=PROPS_KV props $json --local

Write-Host "`nLocal KV updated successfully!" -ForegroundColor Green
Write-Host "`nFor production deployment, run:" -ForegroundColor Yellow
Write-Host "wrangler kv:key put --binding=PROPS_KV props '$json'" -ForegroundColor Cyan