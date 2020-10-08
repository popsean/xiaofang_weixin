import { get, post, del } from './request.js'

module.exports = {
  getBuildingsByName: function (name, params = {}) {
    return get('buildings/search', {keyword:name,...params})
  },
  getBuildings: function (params = {}) {
    return get('buildings', params)
  },
}
