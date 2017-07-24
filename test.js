import test from 'ava'
import execa from 'execa'
import rimraf from 'rimraf'
import fs from 'mz/fs'

test.beforeEach('cleanup target path', () => {
	rimraf.sync('./dist')
})

test(async t => {
	let result

	await execa('./cli.js', ['./fixtures/**', './dist', '--user=jimmy'])
	result = await fs.readFile('./dist/fixtures/index.html')

	t.true(result.toString() === 'hello jimmy!\n')

	await execa('./cli.js', ['./fixtures/**', './dist', './fixtures/data.json'])
	result = await fs.readFile('./dist/fixtures/index.html')

	t.true(result.toString() === 'hello moon!\n')

	await execa('./cli.js', ['./fixtures/**', './dist', './fixtures/data.json', '--user=jimmymoon'])
	result = await fs.readFile('./dist/fixtures/index.html')

	t.true(result.toString() === 'hello jimmymoon!\n')
})
