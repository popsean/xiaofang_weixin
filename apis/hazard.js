import { get, post, del } from './request.js'

module.exports = {

  getHazards: function (params) {
    console.log('getHazards:'+ JSON.stringify(params))
    return get('hazards/get', params)
  },
}
