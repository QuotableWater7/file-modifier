'use strict'

const fs = require('fs')

const endsString = string => ext => {
	const pos = string.indexOf(ext)
	return pos > 0 && pos === string.length - ext.length
}

const walkSync = (directory, opts) => {
	const files = fs.readdirSync(directory)

	return files.reduce((fileList, file) => {
		const fullPath = `${directory}/${file}`

		if (fs.statSync(fullPath).isDirectory()) {
			if (opts.blacklistedFolders.some(folder => folder === file)) {
				return fileList
			}

			return fileList.concat(walkSync(fullPath, opts))
		}

		if (opts.blacklistedExt.some(endsString(fullPath))) {
			return fileList
		}

		if (opts.whitelistedExt.length && !opts.whitelistedExt.find(endsString(fullPath))) {
			return fileList
		}

		if (opts.whitelistedFolders.length && !opts.whitelistedFolders.find(folder => fullPath.indexOf(`/${folder}`) > -1)) {
			return fileList
		}

		return fileList.concat([fullPath])
	}, [])
}

module.exports = function main({ directory, opts, modifyFn }) {
	const fileList = walkSync(
		directory,
		{
			whitelistedExt: [],
			blacklistedExt: [],
			whitelistedFolders: [],
			blacklistedFolders: [],
			...opts,
		},
	)

	fileList.forEach(filepath => {
		const contents = fs.readFileSync(filepath, 'utf8')
		const updatedContents = modifyFn(contents, { filepath })

		if (contents === updatedContents || updatedContents === undefined) {
			return
		}

		fs.writeFileSync(filepath, updatedContents, 'utf8')
	})
}
