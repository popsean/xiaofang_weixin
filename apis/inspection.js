import { get, post, del } from './request.js'

module.exports = {
  addInspection: function (params) {
    return post('inspections/add', params)
  }
}
