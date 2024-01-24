yarn build --base=https://raurir.com/games/airtasker-404
aws s3 sync ./dist s3://raurir.com/games/airtasker-404/