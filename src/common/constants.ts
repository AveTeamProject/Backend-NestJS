export const ROUTES = {
  AUTH: {
    BASE: 'auth',
    SIGNUP: 'signup',
    LOGIN: 'login',
    REFRESH_TOKEN: 'refresh-token',
    PROFILE: 'profile'
  },
  ATTACHMENT: {
    BASE: 'attachment',
    UPLOAD: 'upload',
    UPLOADS: 'uploads',
    DELETE: 'delete'
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
