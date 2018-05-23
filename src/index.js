'use strict'

const fs = require('fs')

const endsWith = ext => string => {
	const pos = string.indexOf(ext)
	return pos > 0 && pos === string.length - ext.length
}

const walkSync = (directory, opts) => {
  const files = fs.readdirSync(directory)

  return files.reduce((fileList, file) => {
  	if (opts.blacklistedFolders.length && opts.blacklistedFolders.some(folder => folder === file)) {
  		return fileList
  	}

  	if (opts.whitelistedFolders.length && !opts.whitelistedFolders.find(folder => folder === file)) {
  		return fileList
  	}

  	const fullPath = `${directory}/${file}`

    if (fs.statSync(fullPath).isDirectory()) {
      return fileList.concat(walkSync(fullPath, opts))
    }

  	if (opts.blacklistedExt.length && opts.blacklistedExt.some(ext => endsWith(ext, file))) {
  		return fileList
  	}

  	if (opts.whitelistedExt.length && !opts.whitelistedExt.find(ext => endsWith(ext, file))) {
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
		const updatedContents = modifyFn(contents)

		if (contents === updatedContents) {
			return
		}

		fs.writeFileSync(filepath, updatedContents, 'utf8')
	})
}
