import { BASE_URL} from './request'
import Promisify from '../utils/promisify'

module.exports = {
  uploadImg: function (filepath) {
    return Promisify(wx.uploadFile)({
      url: `${BASE_URL}uploadFiles`,
      filePath: filepath,
      name: 'file'
    }).then(res => {
      if (res.statusCode != 200) {
        try {
          res.data = JSON.parse(res.data)
        } catch (e) {

        }
        wx.showModal({
          title: '上传图片失败',
          content: (res.data && res.data.message) ? res.data.message : '发生未知错误',
          showCancel: false
        })
        return Promise.reject(new Error('上传图片失败'))
      } else {
        return res.data
      }
    })
  },
}
