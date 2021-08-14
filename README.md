# instagram-story-robot

## What

This is a little service I wrote to scrape certain profile stories every 24 hours and save it locally. 
It automatically logs in to the configured Instagram profile, downloads the stories, and will run itself every 24 hours.

## Why

Do **NOT** ask me this...

## How

```shell
git clone --depth 1 https://github.com/mmjee/instagram-story-robot.git
yarn install
cp config.example.toml config.toml
$EDITOR config.toml
yarn run start
```

```shell
git clone --depth 1 https://github.com/mmjee/instagram-story-robot.git
cp config.example.toml config.toml
$EDITOR config.toml
$EDITOR docker-compose.yml
docker-compose up -d
```

## TODO

Maybe send me a PR for this:

1. Make a Discord bot to send notifications when the data is scraped.
