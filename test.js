import path from 'path'
import test from 'ava'
import execa from 'execa'
import rimraf from 'rimraf-promise'
import fs from 'mz/fs'

test.before('cleanup target path', async () => {
	await rimraf('./dist')
	await fs.mkdir('./dist')
	await fs.writeFile('./dist/index.html', await fs.readFile('./fixtures/template/index.html'))
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

test('overwrite props', async t => {
	const result = await run(
		'./fixtures/template/index.html',
		'./dist/overwrite-props',
		['--config=./fixtures/config.json', '--', '--user=jimmymoon'],
		'hello jimmymoon!\n'
	)
	t.true(result)
})

test('overwrite file', async t => {
	const result = await run(
		'./dist/index.html',
		'',
		['--overwrite', '--', '--user=jimmymoon-overwrited'],
		'hello jimmymoon-overwrited!\n'
	)
	t.true(result)
})

test('inside path', async t => {
	let _err

	try {
		await run(
			'./dist/index.html',
			'./',
			['--', '--user=jimmymoon-overwrited'],
			'hello jimmymoon-overwrited!\n'
		)
	} catch (err) {
		_err = err
	}

	t.true(_err !== undefined)
})
