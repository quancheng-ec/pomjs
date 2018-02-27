export const cors = {}

export const session = {
  key: 'pomjs:sess',
  maxAge: 86400000,
  overwrite: true,
  httpOnly: true,
  signed: true,
  rolling: false,
  renew: false
}

export const csrf = {
  invalidSessionSecretMessage: 'Invalid session secret',
  invalidSessionSecretStatusCode: 403,
  invalidTokenMessage: 'Invalid CSRF token',
  invalidTokenStatusCode: 403,
  excludedMethods: ['GET', 'HEAD', 'OPTIONS'],
  disableQuery: false
}

export const bodyParser = {
  jsonLimit: '10mb',
  textLimit: '10mb'
}

export const serve = { maxage: 60 * 60 * 24 * 365 }

export default function loadOptions (options) {
  return mid => (options ? Object.assign({}, options, exports[mid]) : exports[mid])
}
