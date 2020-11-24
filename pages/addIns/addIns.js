// pages/inspection/inspection.js
import { formatDate } from '../../utils/utils'
import Promisify from '../../utils/promisify'
import { INSPTECTION_NORMAL, INSPTECTION_EXCPTION_UNRESOLVE } from '../../utils/constant'
import { DOMAIN_NAME } from '../../apis/request'
import { uploadImg } from '../../apis/uploader'
import { addInspection } from '../../apis/inspection'
import { getUID, getNickName } from '../../utils/permission'



var today = new Date();
var uid = getUID()
var userName = getNickName()
const app = getApp()

const MAX_IMGS = 9;
// const MOCK_BID = '5c04f64b00c4056ce4a3cc2b';
// const MOCK_BNAME = '思源楼';
// var uid = '5f7e9b46098188e8052911c1'
const NORMAL_DESC = '日常巡检并对现场人员进行消防安全提示'
console.log(formatDate(today))
console.log(today)
Page({

  /**
   * 页面的初始数据
   */
  data: {
    formatDate: formatDate(today),
    userID: uid,
    createUserName: userName,
    buildingName: '',
    buildingID: '',
    insStateIndex: 0,
    insHideAdd: 0,
    insAttachImgs: [],
    insStateList: [
      INSPTECTION_NORMAL,
      INSPTECTION_EXCPTION_UNRESOLVE
      // inspectionState.INSPTECTION_EXCPTION_RESOLVED
    ],
    inspectionInfo: {
      createDate: null,
      buildingID: '',
      buildingName: '',
      createUserName: userName,
      userID: uid,
      area: '',
      state: INSPTECTION_NORMAL,
      description: NORMAL_DESC,
      attachImgs: [],
      hazards: [],
      hazardsCount: 0,
      source: 1
    },
    newHazIndex: 1,
    hazards: [],
    hazStateList: [
      // HAZARD_RESOLVED, // '已解决',
      // HAZARD_RECTIFICATION_ASAP, // 
      '立即整改',
      // HAZARD_RECTIFICATION_PENDING, // 
      '限期整改',
      // HAZARD_CUSTOM // 
      '自定义'
    ],
    hazardInfo: {
      createDate: null,
      buildingID: '',
      buildingName: '',
      createUserName: userName,
      userID: uid,
      area: '',
      description: '',
      detail: '',
      hazardState: '立即整改',
      customState: '',
      reviewDate: '',
      index: 0,
      status: 0,
      uploadList: [],
      source: 1
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('onLoad options:' + JSON.stringify(options))
    console.log('onLoad userInfo:' + userName + ', ' + uid)
    this.data.buildingID = options.bID
    this.data.buildingName = options.bName
    this.setData({
      buildingID:options.bID,
      buildingName:options.bName
    })
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
    params['inspectionInfo.' + label] = e.detail.value
    this.setData(params)
    console.log('onInput: params=' + JSON.stringify(params))
    console.log('insInfo: ' + JSON.stringify(this.data.inspectionInfo))
  },

  onHazInput: function (e) {
    var params = {}
    let label = e.currentTarget.dataset.label
    let index = e.currentTarget.dataset.index
    // params['inspectionInfo.' + label] = e.detail.value
    params['hazards[' + index + '].' + label] = e.detail.value
    this.setData(params)
    console.log('onHazInput: params=' + JSON.stringify(params))
    console.log('hazinfo: ' + JSON.stringify(this.data.hazards))
  },

  onAddHaz: function (e) {
    var newHazard = this._initHazrd();
    // newHazard.index = this.data.newHazIndex;
    // newHazard.index = this.data.hazards.length;
    // newHazard.name = '隐患' + newHazard.index;
    let haz_list = this.data.hazards
    haz_list.push(newHazard)
    this.setData({
      hazards: haz_list,
      // newHazIndex: newHazard.index +1
    })
  },
  onDelHaz: function (e) {
    let index = e.currentTarget.dataset.index
    console.log('onDelHaz: index=' + JSON.stringify(e.currentTarget.dataset.index))
    let haz_list = this.data.hazards
    haz_list.splice(index, 1); //数组中删除index元素
    this.setData({
      hazards: haz_list
    })
  },

  onInsSelect: function (e) {
    var params = {}
    let label = e.currentTarget.dataset.label
    params.insStateIndex = e.detail.value
    params['inspectionInfo.' + 'state'] = this.data.insStateList[params.insStateIndex]
    if (params['inspectionInfo.' + 'state'] == INSPTECTION_NORMAL) {
      params['inspectionInfo.' + 'description'] = NORMAL_DESC
    } else {
      params['inspectionInfo.' + 'description'] = ''
    }
    this.setData(params)
    console.log('onInsSelect: params=' + JSON.stringify(params))
  },
  onHazSelect: function (e) {
    var params = {}
    let index = e.currentTarget.dataset.index
    let selectIndex = e.detail.value
    params['hazards[' + index + '].' + 'hazardState'] = this.data.hazStateList[selectIndex]
    this.setData(params)
    console.log('onHazSelect: params=' + JSON.stringify(params))
  },

  onReviewDate: function (e) {
    var params = {}
    let { type, index } = e.currentTarget.dataset
    params['hazards[' + index + '].' + type] = e.detail.value
    this.setData(params)
    console.log('onReviewDate: params=' + JSON.stringify(params))
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
            insHideAdd: 1
          })
        } else {
          this.setData({
            insHideAdd: 0
          })
        }

        let imgs = this.data.insAttachImgs;
        console.log('onChooseImage: tempFilePaths=' + JSON.stringify(res.tempFilePaths))
        console.log('onChooseImage: imgs=' + JSON.stringify(imgs))
        for (let i = 0; i < res.tempFilePaths.length; i++) {
          imgs.push(res.tempFilePaths[i])
        }
        console.log('onChooseImage: imgs=' + JSON.stringify(imgs))
        this.setData({
          insAttachImgs: imgs
        })
      }

    })
  },

  onHazChooseImage: function (e) {
    const { hazindex } = e.currentTarget.dataset
    console.log('onHazChooseImage: hazIdx=' + hazindex)

    Promisify(wx.chooseImage)({
      count: MAX_IMGS,
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'] // 可以指定来源是相册还是相机，默认二者都有
    }).then(res => {
      // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
      if (res.tempFilePaths.length > 0) {
        if (res.tempFilePaths.length == MAX_IMGS) {
          this.setData({
            insHideAdd: 1
          })
        } else {
          this.setData({
            insHideAdd: 0
          })
        }

        let imgs = this.data.hazards[hazindex].uploadImgs;
        console.log('onHazChooseImage: tempFilePaths=' + JSON.stringify(res.tempFilePaths))
        console.log('onHazChooseImage: imgs=' + JSON.stringify(imgs))
        for (let i = 0; i < res.tempFilePaths.length; i++) {
          imgs.push(res.tempFilePaths[i])
        }
        console.log('onHazChooseImage: imgs=' + JSON.stringify(imgs))
        console.log('onHazChooseImage: 22 hazindex=' + hazindex)
        var params = {}
        params = this.data.hazards
        params[hazindex].uploadImgs = imgs
        this.setData({
          hazards: params
        })

        // params['hazards[' + hazindex + '].' + uploadImgs] = imgs
        // this.setData(params)
        console.log('onHazChooseImage: params=' + JSON.stringify(this.data.hazards[hazindex]))
      }

    })
  },
  onPreviewImage: function (e) {
    let index = e.currentTarget.dataset.index
    console.log('onPreviewImage: lable=' + JSON.stringify(e.currentTarget.dataset))
    wx.previewImage({
      // 当前显示图片的http链接
      current: this.data.insAttachImgs[index],
      // l需要预览的图片http链接列表，filter过滤空ur
      urls: this.data.insAttachImgs
    })
  },

  onHazPreviewImage: function (e) {
    const { hazindex, imgindex } = e.currentTarget.dataset
    console.log('onHazPreviewImage: hazIdx=' + hazindex + ', imgIdx=' + imgindex)
    wx.previewImage({
      // 当前显示图片的http链接
      current: this.data.hazards[hazindex].uploadImgs[imgindex],
      // l需要预览的图片http链接列表，filter过滤空ur
      urls: this.data.hazards[hazindex].uploadImgs
    })
  },


  onHazDeleteImage: function (e) {
    const { hazindex, imgindex } = e.currentTarget.dataset
    console.log('onHazDeleteImage: hazIdx=' + hazindex + ', imgIdx=' + imgindex)

    let imgs = this.data.hazards[hazindex].uploadImgs
    imgs.splice(imgindex, 1); //数组中删除index元素

    var params = {}
    params = this.data.hazards
    params[hazindex].uploadImgs = imgs
    this.setData({
      hazards: params
    })
    console.log('onHazDeleteImage: params=' + JSON.stringify(this.data.hazards[hazindex]))
  },

  onDeleteImage: function (e) {
    let index = e.currentTarget.dataset.index
    console.log('onDeleteImage: index=' + JSON.stringify(e.currentTarget.dataset.index))
    let imgs = this.data.insAttachImgs;
    imgs.splice(index, 1); //数组中删除index元素
    this.setData({
      insAttachImgs: imgs
    })
  },

  onSubmit: function () {
    console.log('onSumbit: ' + JSON.stringify(this.data))


    if (this.data.inspectionInfo.state == INSPTECTION_EXCPTION_UNRESOLVE
      && this.data.hazards.length == 0) {
      wx.showToast({ title: '巡检异常必须添加对应隐患', mask: true, icon: 'none' })
      return;
    }

    // 先上传身照片，获取图片url，再上传巡检信息
    this._uploadAttachedImgs().then(this._updateInsInfo).then(res => {
      console.log('onSubmit: res=' + JSON.stringify(res))
      if (res.data.code == 0) {
        wx.showToast({ title: '创建巡检成功', mask: true })
        NB_TIMER = setTimeout(() => {
          app.globalData.needRefresh = true
          wx.navigateBack()
        }, 1000)
      } else {
        wx.showToast({ title: res.data.message, mask: true, icon: 'none' })
      }

    }).
      catch(() => wx.hideLoading());
  },

  /**
 * 上传附件图片，返回图片url数组
 * 
 * 先上传巡检的所有图片、所有隐患的所有图片，拿到服务端图片地址后，再进行后面的巡检完整信息上传
 */
  _uploadAttachedImgs: function () {
    let imgsToUpload = this.data.insAttachImgs;

    // 如果是刚刚选择的本地照片，需要上传
    // 如果是服务器url，那么直接返回
    var uploadForIns = function (imgPath) {
      return new Promise((resolve, reject) => {
        console.log('uploadForIns: imgPath=' + imgPath)

        if (imgPath.indexOf(DOMAIN_NAME) === -1) {
          wx.showLoading({ title: '上传图片中', mask: true })
          uploadImg(imgPath)
            .then(res => {
              let files = { url: JSON.parse(res).optImgSrc, status: 'finished' }
              resolve(files)
              console.log('uploadForIns-uploadImg: sucess=' + JSON.stringify(files))
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

    let insImgPromises = []
    const self = this;
    imgsToUpload.forEach(url => {
      insImgPromises.push(
        //uploadForIns方法需要再用一个promise包装一下，在promiseAll的时候才能按顺序执行
        new Promise((resolve, reject) => {
          uploadForIns(url)
            .then(oneImg => {
              console.log('upload [ins] finish  : imgPath=' + oneImg)
              console.log('upload [ins] finish : self.data.inspectionInfo=' + JSON.stringify(self.data.inspectionInfo))
              if (!self.data.inspectionInfo.attachImgs) {
                self.data.inspectionInfo.attachImgs = []
              }
              self.data.inspectionInfo.attachImgs.push(oneImg)
              resolve(oneImg);
            })
        }))
    })

    let allHazImgPromises = []
    let l_hazards = this.data.hazards
    l_hazards.forEach((haz, idx) => {
      console.log('_uploadAttachedImgs for haz ,foreach idx=' + idx + ', area=' + haz.area + ', uploadImgs=' + haz.uploadImgs)
      haz.uploadImgs && haz.uploadImgs.forEach(url => {
        allHazImgPromises.push(
          new Promise((resolve, reject) => {
            uploadForHaz(idx, url)
              .then(([idx, oneImg]) => {
                console.log('upload [haz]-' + haz.area + ' finish ,upload: idx=' + idx + ',imgPath=' + oneImg)
                self.data.hazards[idx].attachImgs.push(oneImg)
                resolve(oneImg)
              })
          })
        );
      })
    })


    let promises = allHazImgPromises.concat(insImgPromises)
    console.log('_uploadAttachedImgs promiseS : ' + promises.le)
    return Promise.all(promises).then(serverPaths => {
      console.log('_uploadAttachedImgs upload : serverPaths=' + JSON.stringify(serverPaths))
      // return serverPaths; 这里不用返回也ok了
    })

    // return Promise.all(insImgPromises).then(res => {
    //   console.log('_uploadAttachedImgs all promise finish upload : res=' + JSON.stringify(res))
    //   // this.data.inspectionInfo.attachImgs = serverPaths
    //   // return serverPaths;
    // })
  },

  /**
   * 将服务器返回的图片路径加入到参数中，上传巡检信息
   */
  _updateInsInfo: function () {
    wx.showLoading({ title: '上传巡检中', mask: true })
    this.data.inspectionInfo.createDate = new Date().toString();
    // this.data.inspectionInfo.attachImgs = imgPaths
    this.data.inspectionInfo.buildingName = this.data.buildingName
    this.data.inspectionInfo.buildingID = this.data.buildingID
    
    this.data.inspectionInfo.hazards = this.data.hazards
    this.data.inspectionInfo.hazardsCount = this.data.hazards.length
    console.log('_updateInsInfo: ' + JSON.stringify(this.data.inspectionInfo))
    console.log('_updateInsInfoDate: ' + this.data.inspectionInfo.createDate)
    return addInspection(this.data.inspectionInfo).then(res => {
      console.log('_updateInsInfo result: ' + JSON.stringify(res))
      return res;
    })
  },

  _initHazrd() {
    return {
      // createDate: '',
      buildingID: this.data.buildingID,
      buildingName: this.data.buildingName,
      area: '',
      description: '',
      detail: '',
      createDate: '',
      hazardState: '立即整改',
      customState: '',
      reviewDate: '',
      index: 0,
      status: '',
      statusIndex: 0,
      attachImgs: [],
      userID: uid,
      createUserName: userName,
      uploadImgs: [],
      source: 1
    };
  },

})