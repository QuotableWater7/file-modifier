'use strict'

const fs = require('fs')

const walkSync = (directory, opts) => {
  const files = fs.readdirSync(directory)

  return files.reduce((fileList, file) => {
  	const fullPath = `${directory}/${file}`

    if (fs.statSync(fullPath).isDirectory()) {
      return fileList.concat(walkSync(fullPath, opts))
    }

  	if (opts.blacklistedExt.some(ext => file.indexOf(ext) > -1)) {
  		return fileList
  	}

  	if (!opts.whitelistedExt.find(ext => file.indexOf(ext) > -1)) {
  		return fileList
  	}

    return fileList.concat([fullPath])
  }, [])
}

module.exports = function main({ directory, opts, modifyFn }) {
	const fileList = walkSync(directory, opts)

	fileList.forEach(filepath => {
		const contents = fs.readFileSync(filepath, 'utf8')
		const updatedContents = modifyFn(contents)

		if (contents === updatedContents) {
			return
		}

		fs.writeFileSync(updatedContents, 'utf8')
	})
}
