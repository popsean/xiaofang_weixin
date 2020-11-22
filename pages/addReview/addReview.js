// pages/review/review.js
import { formatDate } from '../../utils/utils'
import Promisify from '../../utils/promisify'
import { INSPTECTION_NORMAL, INSPTECTION_EXCPTION_UNRESOLVE } from '../../utils/constant'
import { DOMAIN_NAME } from '../../apis/request'
import { uploadImg } from '../../apis/uploader'
import { addReview } from '../../apis/review'

var app = getApp()
var today = new Date();
const MAX_IMGS = 9;
const MOCK_BID = '5c04f64b00c4056ce4a3cc2b';
const MOCK_BNAME = '思源楼';
var userName = 'zstest'
var uid = '5f7e9b46098188e8052911c1'

console.log(formatDate(today))
console.log(today)
Page({

  /**
   * 页面的初始数据
   */
  data: {
    formatDate: formatDate(today),

    buildingName: MOCK_BNAME,
    buildingID: MOCK_BID,
    reviewStateIndex: 0,
    reviewHideAdd: 0,
    reviewAttachImgs: [],
    
    reviewInfo: {
      hazardID: '',
      reviewDate: '',
      buildingID: MOCK_BID,
      buildingName: MOCK_BNAME,
      createUserName: userName,
      userID: uid,
      area: '',
      state: '已解决',
      description: '',
      attachImgs: [],
      nextReviewDate: '',
      customState: ''
    },
    newHazIndex: 1,
    reviewStateList: [
      // HAZARD_RESOLVED, // '已解决',
      // HAZARD_RECTIFICATION_ASAP, // 
      '已解决',
      '立即整改',
      // HAZARD_RECTIFICATION_PENDING, // 
      '限期整改',
      // HAZARD_CUSTOM // 
      '自定义'
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('onLoad optins:' + JSON.stringify(options))
    this.data.reviewInfo.createUserName = userName
    this.data.reviewInfo.hazardID = options.hazID

    this.data.buildingID = options.bID
    this.data.buildingName = options.bName
    this.setData({
      buildingID:options.bID,
      buildingName:options.bName
    })
    console.log('onLoad data:' + JSON.stringify(this.data))
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  onInput: function (e) {
    var params = {}
    let label = e.currentTarget.dataset.label
    params['reviewInfo.' + label] = e.detail.value
    this.setData(params)
    console.log('onInput: params=' + JSON.stringify(params))
    console.log('reviewInfo: ' + JSON.stringify(this.data.reviewInfo))
  },



  onReviewSelect: function (e) {
    var params = {}
    let label = e.currentTarget.dataset.label
    params.reviewStateIndex = e.detail.value
    params['reviewInfo.' + 'state'] = this.data.reviewStateList[params.reviewStateIndex]
    this.setData(params)
    console.log('onReviewSelect: params=' + JSON.stringify(params))
  },
  
  onNextReviewDate: function (e) {
    var params = {}
    let { type, index } = e.currentTarget.dataset
    params['reviewInfo.' + type] = e.detail.value
    this.setData(params)
    console.log('onNextReviewDate: params=' + JSON.stringify(params))
  },

  onChooseImage: function (e) {
    // var prop = 'userInfo.id_card_img.' + e.currentTarget.dataset.type
    Promisify(wx.chooseImage)({
      count: MAX_IMGS,
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'] // 可以指定来源是相册还是相机，默认二者都有
    }).then(res => {
      // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
      if (res.tempFilePaths.length > 0) {
        if (res.tempFilePaths.length == MAX_IMGS) {
          this.setData({
            reviewHideAdd: 1
          })
        } else {
          this.setData({
            reviewHideAdd: 0
          })
        }

        let imgs = this.data.reviewAttachImgs;
        console.log('onChooseImage: tempFilePaths=' + JSON.stringify(res.tempFilePaths))
        console.log('onChooseImage: imgs=' + JSON.stringify(imgs))
        for (let i = 0; i < res.tempFilePaths.length; i++) {
          imgs.push(res.tempFilePaths[i])
        }
        console.log('onChooseImage: imgs=' + JSON.stringify(imgs))
        this.setData({
          reviewAttachImgs: imgs
        })
      }

    })
  },

  onPreviewImage: function (e) {
    let index = e.currentTarget.dataset.index
    console.log('onPreviewImage: lable=' + JSON.stringify(e.currentTarget.dataset))
    wx.previewImage({
      // 当前显示图片的http链接
      current: this.data.reviewAttachImgs[index],
      // l需要预览的图片http链接列表，filter过滤空ur
      urls: this.data.reviewAttachImgs
    })
  },

  onDeleteImage: function (e) {
    let index = e.currentTarget.dataset.index
    console.log('onDeleteImage: index=' + JSON.stringify(e.currentTarget.dataset.index))
    let imgs = this.data.reviewAttachImgs;
    imgs.splice(index, 1); //数组中删除index元素
    this.setData({
      reviewAttachImgs: imgs
    })
  },

  onSubmit: function () {
    console.log('onSumbit: ' + JSON.stringify(this.data))

    // 先上传身照片，获取图片url，再上传回查信息
    this._uploadAttachedImgs().then(this._updateReviewInfo).then(res => {
      console.log('onSubmit: res=' + JSON.stringify(res))
      if (res.data.code == 0) {
        wx.showToast({ title: '创建回查成功', mask: true })
        NB_TIMER = setTimeout(() => {
          app.globalData.needRefresh = true
          wx.navigateBack()
        }, 1000)
      } else {
        wx.showToast({ title: '失败: ' + res.data.message.message, mask: true, icon: 'none' })
      }

    }).
      catch(() => wx.hideLoading());
  },

  /**
 * 上传附件图片，返回图片url数组
 * 
 * 先上传回查的所有图片、所有隐患的所有图片，拿到服务端图片地址后，再进行后面的回查完整信息上传
 */
  _uploadAttachedImgs: function () {
    let imgsToUpload = this.data.reviewAttachImgs;

    // 如果是刚刚选择的本地照片，需要上传
    // 如果是服务器url，那么直接返回
    var uploadForReview = function (imgPath) {
      return new Promise((resolve, reject) => {
        console.log('uploadForReview: imgPath=' + imgPath)

        if (imgPath.indexOf(DOMAIN_NAME) === -1) {
          wx.showLoading({ title: '上传图片中', mask: true })
          uploadImg(imgPath)
            .then(res => {
              let files = { url: JSON.parse(res).optImgSrc, status: 'finished' }
              resolve(files)
              console.log('uploadForReview-uploadImg: sucess=' + JSON.stringify(files))
            })
            .catch(err => reject(err))
        } else {
          resolve(imgPath)
        }
      })
    }

    //由于隐患的附件属于二级维度, 需要一个idx标记是第几个隐患
    var uploadForHaz = function (idx, imgPath) {
      return new Promise((resolve, reject) => {
        console.log('uploadForHaz: imgPath=' + imgPath)

        if (imgPath.indexOf(DOMAIN_NAME) === -1) {
          wx.showLoading({ title: '上传图片中', mask: true })
          uploadImg(imgPath)
            .then(res => {
              let files = { url: JSON.parse(res).optImgSrc, status: 'finished' }
              resolve([idx, files])
              console.log('uploadForHaz-uploadImg: sucess=' + JSON.stringify(files))
            })
            .catch(err => reject(err))
        } else {
          resolve([idx, imgPath])
        }
      })
    }

    let reviewImgPromises = []
    const self = this;
    imgsToUpload.forEach(url => {
      reviewImgPromises.push(
        //uploadForReview方法需要再用一个promise包装一下，在promiseAll的时候才能按顺序执行
        new Promise((resolve, reject) => {
          uploadForReview(url)
            .then(oneImg => {
              console.log('upload [review] finish  : imgPath=' + oneImg)
              console.log('upload [review] finish : self.data.reviewInfo=' + JSON.stringify(self.data.reviewInfo))
              if (!self.data.reviewInfo.attachImgs) {
                self.data.reviewInfo.attachImgs = []
              }
              self.data.reviewInfo.attachImgs.push(oneImg)
              resolve(oneImg);
            })
        }))
    })

    console.log('_uploadAttachedImgs promiseS : ' + reviewImgPromises.length)
    return Promise.all(reviewImgPromises).then(serverPaths => {
      console.log('_uploadAttachedImgs upload : serverPaths=' + JSON.stringify(serverPaths))
    })
  },

  /**
   * 将服务器返回的图片路径加入到参数中，上传回查信息
   */
  _updateReviewInfo: function () {
    wx.showLoading({ title: '上传回查中', mask: true })
    this.data.reviewInfo.reviewDate = new Date().toString();

    console.log('_updateReviewInfo: ' + JSON.stringify(this.data.reviewInfo))
    console.log('_updateReviewInfoDate: ' + this.data.reviewInfo.reviewDate)
    return addReview(this.data.reviewInfo).then(res => {
      console.log('_updateReviewInfo result: ' + JSON.stringify(res))
      return res;
    })
  },

})