import fs from 'node:fs'

const deleteLocalFile = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    // do nothing – temp cleanup should never crash server
  }
}

export {deleteLocalFile}