# lodash.template-cli [![Build Status](https://travis-ci.org/ragingwind/lodash.template-cli.svg?branch=master)](https://travis-ci.org/ragingwind/lodash.template-cli)

> Simple CLI for template using loadsh.template engine


## Install

```
$ npm install -g lodash.template-cli
```

## Usage

```sh
tpl --help
```

## Examples

```sh
# single file templating
$ tpl ./src/index.html ./dist -- --name='My Name' --target='Target'

# glob pattern templating
$ tpl './src/**' ./dist -- --name='My Name' --target='Target'

# shell pattern templating
$ tpl ./src/** ./dist -- --name='My Name' --target='Target'

# using config
$ tpl './src/** ./dist --config=prop.json

# using config and props
$ tpl './src/** ./dist --config=prop.json -- --name-overwrite='My Name' --target-overwrite='Target'

# with no-camelcase
$ tpl ./src/index.html ./dist --no-camelcase -- --name='My Name' --target='Target'

# overwrite sources
$ tpl ./src/** --overwrite -- --name='My Name' --target='Target'
$ tpl ./src/** -- --name='My Name' --target='Target'
```

## License

MIT © [Jimmy Moon](http://ragingwind.me)
