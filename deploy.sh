echo "=============Kill all the running PM2 actions============="
sudo pm2 kill

echo "=============Jump to app folder==========================="
cd /srv/car-rental-api
pwd

echo "=============Update app from Git=========================="
git pull

echo "=============node version================================="
node -v

echo "=============Install nodemon=============================="
npm install nodemon -g

echo "=============Install app dependencies====================="
npm ci

echo "=============Run Prisma database migrations==============="
npx prisma migrate deploy

echo "=============Jump to parent folder========================"
cd ..
pwd

echo "=============Run new PM2 action==========================="
pm2 start car-rental-api


