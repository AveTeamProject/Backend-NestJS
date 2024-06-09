// file-upload.config.ts

import { BadRequestException } from '@nestjs/common'

export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
export const MAX_COUNT_FILE = 10 // 5MB

export const imageFileFilter = (req, file, callback) => {
  if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
    return callback(new BadRequestException('Unsupported image file type'), false)
  }
  callback(null, true)
}

export const allFileFilter = (req, file, callback) => {
  // Customize if necessary, here we allow all files
  callback(null, true)
}

export const imageUploadOptions = {
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: imageFileFilter
}

export const allFileUploadOptions = {
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: allFileFilter
}
