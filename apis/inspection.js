import { get, post, del } from './request.js'

module.exports = {
  addInspection: function (params) {
    return post('inspections/add', params)
  },
  getInspections: function (params) {
    console.log('getInspections:'+ JSON.stringify(params))
    return get('inspections/get', params)
  },
}
