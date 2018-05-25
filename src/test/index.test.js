const fs = require('fs')

const fileModifier = require('..')

const modifyThenRestore = (modifyParams) => {
	const changedFilepaths = []

	fileModifier({
		...modifyParams,
		modifyFn: (contents, { filepath }) => {
			changedFilepaths.push(filepath)

			return modifyParams.modifyFn(...arguments)
		},
	})

	// save the current state of the fixtures
	const changeDatas = changedFilepaths.map(filepath => {
		return {
			filepath,
			contents: fs.readFileSync(filepath, 'utf8')
		}
	})

	// now revert the changes to the fixtures
	changeDatas.forEach(({ contents, filepath }) => {
		fs.writeFileSync(filepath, contents, 'utf8')
	})

	return changeDatas
}

it('can recursively change all files in a directory', async () => {
	const changes = modifyThenRestore({
		directory: __dirname + '/fixtures',
		modifyFn: () => 'boring change',
	})

	expect(changes.length).toBe(5)

	changes.forEach(({ contents }) => {
		expect(contents).toBe('boring change')
	})
})

it('can make changes to all files with specific ext in a directory', async () => {
	const changes = modifyThenRestore({
		directory: __dirname + '/fixtures',
		opts: {
			whitelistedExt: ['.js'],
		},
		modifyFn: () => 'boring change',
	})

	expect(changes.length).toBe(2)

	changes.forEach(({ contents, filepath }) => {
		expect(filepath.indexOf('.js')).toBeGreaterThan(0)
		expect(contents).toBe('boring change')
	})
})

it('can make changes to all files without specific exts in a directory', async () => {
	const changes = modifyThenRestore({
		directory: __dirname + '/fixtures',
		opts: {
			blacklistedExt: ['.js', '.txt'],
		},
		modifyFn: () => 'boring change',
	})

	expect(changes.length).toBe(1)

	changes.forEach(({ contents, filepath }) => {
		expect(/\.js$/.test(filepath)).toBeFalsy()
		expect(/\.txt$/.test(filepath)).toBeFalsy()
		expect(contents).toBe('boring change')
	})
})

it('can whitelist specific subdirectories', async () => {
	const changes = modifyThenRestore({
		directory: __dirname + '/fixtures',
		opts: {
			whitelistedFolders: ['nested'],
		},
		modifyFn: (contents) => 'boring change',
	})

	expect(changes.length).toBe(2)

	changes.forEach(({ contents, filepath }) => {
		expect(filepath.indexOf('nested')).toBeGreaterThan(-1)
		expect(contents).toBe('boring change')
	})
})

it('can blacklist specific subdirectories', async () => {
	const changes = modifyThenRestore({
		directory: __dirname + '/fixtures',
		opts: {
			blacklistedFolders: ['nested'],
		},
		modifyFn: (contents) => 'boring change',
	})

	expect(changes.length).toBe(3)

	changes.forEach(({ contents, filepath }) => {
		expect(filepath.indexOf('nested')).toBe(-1)
		expect(contents).toBe('boring change')
	})
})
