import { get, post, del } from './request.js'

module.exports = {

  getReviews: function (params) {
    console.log('getReviews:'+ JSON.stringify(params))
    return get('reviews/get', params)
  },
  addReview: function (params) {
    return post('reviews/add', params)
  },
}
