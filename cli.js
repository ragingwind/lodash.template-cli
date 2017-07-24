#!/usr/bin/env node

'use strict'

const path = require('path')
const meow = require('meow')
const template = require('lodash.template')
const globby = require('globby')
const isPathInside = require('is-path-inside')
const PQueue = require('p-queue')
const fs = require('mz/fs')
const makeDir = require('make-dir')
const camelcase = require('camelcase')

const cli = meow(`
	Usage
		$ tpl [src] [dest] <data-json> -- [data-strings]

	src, path, path with glob pattern and glob patterns
		eg) ./src/index.tpl, ./src/**, './src/**'

	dest, path for output
		eg) ./dist

	data-json, 'optional, has data properties, must be before '--'
		--data='path of data.json'

	data-string, must be after '--', individual data property
		--ANY-DATA-STRING-NAME=[value]

	Examples
		$ tpl ./src/index.html ./dist -- --name='My Name' --target='Target'
		$ tpl './src/**' ./dist -- --name='My Name' --target='Target'
		$ tpl ./src/** ./dist -- --name='My Name' --target='Target'
		$ tpl './src/** ./dist --data=prop.json -- --name-overwrite='My Name' --target-overwrite='Target'
`, {
	'--': true
})

const readDataJSON = json => JSON.parse(fs.readFileSync(json))

const job = new PQueue({concurrency: 4})
const dest = cli.input.pop()
const src = cli.input
let data = {}

// Using minimist parse code
// https://github.com/substack/minimist/blob/master/index.js#L97
cli.flags[''].forEach(d => {
	if (/^--.+=/.test(d)) {
		const m = d.match(/^--([^=]+)=([\s\S]*)$/)
		data[m[1]] = camelcase(m[2])
	}
})

// read data json first, then assign by passed data string
data = Object.assign(cli.flags.data ? readDataJSON(cli.flags.data) : {}, data)

// check parameters
if (src.length < 1) {
	throw new TypeError('Invalid source path')
} else if (!dest) {
	throw new TypeError('Invalid destination path')
} else if (Object.keys(data).length <= 0) {
	throw new TypeError('Invalid data properties')
}

globby(src).then(paths => {
	if (isPathInside(paths[0], dest)) {
		throw new TypeError('Invalid destination, it should be out of source path')
	}

	paths.forEach(p => {
		if (!fs.lstatSync(p).isFile()) {
			return
		}
		const output = path.join(dest, p)
		const compile = () => fs.readFile(p).then(t => {
			const compiled = template(t)
			return compiled(data)
		})

		const write = content => makeDir(path.dirname(output)).then(() => {
			return fs.writeFile(output, content)
		})

		job.add(() => compile().then(write))
	})
})
