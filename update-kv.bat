@echo off
echo Updating KV namespace with activities data...

wrangler kv key put --binding=PROPS_KV props "[{\"id\":\"cabin-12\",\"name\":\"Riverside Cabin 12\",\"activities\":[{\"slug\":\"archery\",\"label\":\"Archery\"},{\"slug\":\"kayaking\",\"label\":\"Kayaking\"},{\"slug\":\"ziplining\",\"label\":\"Ziplining\"},{\"slug\":\"snorkeling\",\"label\":\"Snorkeling\"},{\"slug\":\"safari-tour\",\"label\":\"Safari Tour\"},{\"slug\":\"boat-tour\",\"label\":\"Boat Tour\"},{\"slug\":\"spelunking\",\"label\":\"Spelunking\"},{\"slug\":\"scuba-diving\",\"label\":\"Scuba Diving\"},{\"slug\":\"paragliding\",\"label\":\"Paragliding\"},{\"slug\":\"bungee-jumping\",\"label\":\"Bungee Jumping\"}]}]" --local

echo.
echo For production deployment, run:
echo wrangler kv key put --binding=PROPS_KV props "[{\"id\":\"cabin-12\",\"name\":\"Riverside Cabin 12\",\"activities\":[{\"slug\":\"archery\",\"label\":\"Archery\"},{\"slug\":\"kayaking\",\"label\":\"Kayaking\"},{\"slug\":\"ziplining\",\"label\":\"Ziplining\"},{\"slug\":\"snorkeling\",\"label\":\"Snorkeling\"},{\"slug\":\"safari-tour\",\"label\":\"Safari Tour\"},{\"slug\":\"boat-tour\",\"label\":\"Boat Tour\"},{\"slug\":\"spelunking\",\"label\":\"Spelunking\"},{\"slug\":\"scuba-diving\",\"label\":\"Scuba Diving\"},{\"slug\":\"paragliding\",\"label\":\"Paragliding\"},{\"slug\":\"bungee-jumping\",\"label\":\"Bungee Jumping\"}]}]"