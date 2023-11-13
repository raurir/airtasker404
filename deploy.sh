yarn build --base=https://www.esquemedia.com/games/airtasker-404
aws s3 sync ./dist s3://www.esquemedia.com/games/airtasker-404/