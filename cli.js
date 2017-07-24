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

const cli = meow(`
	Usage
		$ tpl [src] [dest] [data-props.json] <data-options>

	Data Options
		--anyVariableForTemplate

	Examples
		$ tpl ./src ./dist --name='My Name' --target='Target'
		$ tpl ./src ./dist ./variables.json
		$ tpl ./src ./dist ./variables.json --name-overwrite='My Name' --target-overwrite='Target'
`)

if (cli.input.length < 1) {
	throw new TypeError('Invalid source path')
}

const src = Array.isArray(cli.input[0]) ? cli.input[0] : [cli.input[0]]
const dest = cli.input.length > 1 ? cli.input[1] : './'
const dataFile = cli.input.length > 2 && /.json$/.test(cli.input[2]) ?
							cli.input[2] : undefined
const job = new PQueue({concurrency: 4})

job.onEmpty().then(() => {
	console.log('done')
})

if (dataFile) {
	cli.flags = Object.assign(JSON.parse(fs.readFileSync(dataFile)), cli.flags)
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
			return compiled(cli.flags)
		})
		const write = content => makeDir(path.dirname(output)).then(() => {
			return fs.writeFile(output, content)
		})
		job.add(() => compile().then(write))
	})
})
