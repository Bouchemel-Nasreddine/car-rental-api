echo "Kill all the running PM2 actions"
sudo pm2 kill

echo "Jump to app folder"
cd /srv/car-rental-api

echo "Update app from Git"
git pull

echo "Install app dependencies"
sudo npm ci

echo "Build your app"
sudo npm run build

echo "Run new PM2 action"
sudo pm2 start car-rental-api