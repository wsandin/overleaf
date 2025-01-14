const { callbackify } = require('util')
const Path = require('path')
const ProjectEntityHandler = require('./ProjectEntityHandler')
const ProjectEntityUpdateHandler = require('./ProjectEntityUpdateHandler')

// generate a new name based on the original, with an optional label.
// e.g. origname-20210101-122345.tex          (default)
//      origname-restored-20210101-122345.tex (label="restored")
function generateRestoredName(docName, label) {
  const formattedTimestamp = new Date()
    .toISOString()
    .replace('T', '-')
    .replace(/[^0-9-]/g, '')
  const extension = Path.extname(docName)
  const basename =
    Path.basename(docName, extension) + (label ? `-${label}` : '')
  return `${basename}-${formattedTimestamp}${extension}`
}

async function restoreDeletedDoc(projectId, docId, docName, userId) {
  const deletedDoc = await ProjectEntityHandler.promises.getDoc(
    projectId,
    docId,
    { include_deleted: true }
  )
  const deletedDocName = generateRestoredName(docName)
  return await ProjectEntityUpdateHandler.promises.addDocWithRanges(
    projectId,
    null,
    `${deletedDocName}`,
    deletedDoc.lines,
    deletedDoc.ranges,
    userId
  )
}

module.exports = {
  restoreDeletedDoc: callbackify(restoreDeletedDoc),
  generateRestoredName,
  promises: {
    restoreDeletedDoc,
  },
}
