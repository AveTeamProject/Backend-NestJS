export const ROUTES = {
  AUTH: {
    BASE: 'auth',
    SIGNUP: 'signup',
    LOGIN: 'login',
    REFRESH_TOKEN: 'refresh-token',
    PROFILE: 'profile',
    LOGOUT: 'logout',
    SEND_CODE: 'send-code',
    VERIFY_CODE: 'verify_code',
    RESET_PASSWORD: 'reset_password'
  },
  ATTACHMENT: {
    BASE: 'attachment',
    UPLOAD: 'upload',
    UPLOADS: 'uploads',
    UPLOAD_IMAGE: 'upload-image',
    DELETE: 'delete/:folder/:key',
    UPDATE: 'update/:folder/:key'
  },
  PRODUCT: {
    BASE: 'products',
    FIND: 'find',
    FIND_ONE: ':id',
    UPDATE: ':id',
    DELETE: ':id',
    DELETE_MULTIPLES: 'delete-multiple'
  }
  // Add other routes here...
}
