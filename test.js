import path from 'path'
import test from 'ava'
import execa from 'execa'
import rimraf from 'rimraf'
import fs from 'mz/fs'

test.before('cleanup target path', () => {
	rimraf.sync('./dist')
})

const run = async (src, target, options, content) => {
	await execa('./cli.js', [src, target].concat(options))
	const data = await fs.readFile(`${path.join(target, src)}`)
	return data.toString() === content
}

test('props', async t => {
	const result = await run(
		'./fixtures/template/index.html',
		'./dist/props',
		['--', '--user=jimmy'],
		'hello jimmy!\n'
	)
	t.true(result)
})

test('config', async t => {
	const result = await run(
		'./fixtures/template/index.html',
		'./dist/config',
		['--config=./fixtures/config.json'],
		'hello moon!\n'
	)
	t.true(result)
})

test('overwrite', async t => {
	const result = await run(
		'./fixtures/template/index.html',
		'./dist/overwrite',
		['--config=./fixtures/config.json', '--', '--user=jimmymoon'],
		'hello jimmymoon!\n'
	)
	t.true(result)
})
