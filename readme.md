# File Modifier

## Example usage

The below code would add a `'use strict'` statement to all JS files that are missing it.

```js
const fileModifier = require('file-modifier')

fileModifier({
  directory: 'path/to/project',
  opts: {
    whitelistedExt: ['.js'],
    blacklistedFolders: ['node_modules'],
  },
  modifyFn: contents => {
    if (contents.indexOf('use strict') > -1) {
      // do nothing to contents
      return contents
    }
    
    // otherwise add 'use strict'
    return `'use strict'\n${contents}`
  },
})
```

## Arguments

**directory**

The directory to recursively search for files under

**opts**

| Param | Description |
| ----- | ----------- |
| whitelistedExt | If any entries provided, they will be the only file types to be processed |
| whitelistedFolders | If any entries provided, they will be the only folders searched |
| blacklistedExt | If any entries provided, these file types will be ignored for processing |
| blacklistedFolders | If any entries provided, these file types will be ignored for searching |

**modifyFn**

A function whose argument is the contents of the file to modify.

If the file **should not** be changed, return the original contents.
If the file **should** be changed, return a string with the new file contents.
