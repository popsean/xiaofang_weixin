import { post } from './request.js'

module.exports = {
  login: function (params) {
    return post('login', params)
  },
}
