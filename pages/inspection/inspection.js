// pages/inspection/inspection.js
import { formatDate } from '../../utils/utils'
import Promisify from '../../utils/promisify'
import {INSPTECTION_NORMAL,INSPTECTION_EXCPTION_UNRESOLVE} from '../../utils/constant'
import { DOMAIN_NAME } from '../../apis/request'
import { uploadImg} from '../../apis/uploader'
import { addInspection} from '../../apis/inspection'

var app = getApp()
var today = new Date();
const MAX_IMGS = 9;
const MOCK_BID ='5c04f64b00c4056ce4a3cc2b';
const MOCK_BNAME ='思源楼';
var userName = 'zstest'
var uid = '5f7e9b46098188e8052911c1'
const NORMAL_DESC = '日常巡检并对现场人员进行消防安全提示'
console.log(formatDate(today))
console.log(today)
Page({

  /**
   * 页面的初始数据
   */
  data: {
    formatDate:formatDate(today),
    userID: '',
    createUserName: '',
    buildingName: MOCK_BNAME,
    buildingID: MOCK_BID,
    insStateIndex:0,
    insHideAdd: 0,
    insAttachImgs: [],
    insStateList: [
      INSPTECTION_NORMAL,
      INSPTECTION_EXCPTION_UNRESOLVE
      // inspectionState.INSPTECTION_EXCPTION_RESOLVED
    ],
    inspectionInfo: {
      createDate: null,
      buildingID: MOCK_BID,
      buildingName: MOCK_BNAME,
      createUserName: userName,
      userID: uid,
      area: '',
      state: INSPTECTION_NORMAL,
      description: NORMAL_DESC,
      attachImgs:[],
      hazards:[],
      hazardsCount:0
    },
    newHazIndex: 1,
    hazards:[],
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
      buildingID: MOCK_BID,
      buildingName: MOCK_BNAME,
      createUserName: userName,
      userID: uid,
      area: '',
      description: '',
      detail: '',
      hazardState: '',
      customState: '',
      reviewDate: '',
      index: 0,
      status: 0,
      uploadList: [],
    }
  },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
      this.data.inspectionInfo.createUserName = userName
      console.log('onLoad userName:' +userName)
      console.log('onLoad bName:' +options.bName)
      console.log('onLoad bID:' +options.bID)
      // this.data.buildingID = options.bID
      // this.data.buildingName = options.bName
      // this.setData({
      //   buildingID:options.bID,
      //   buildingName:options.bName
      // })
      // this.setData({
      //   buildingID: MOCK_BID,
      //   buildingName: MOCK_BNAME
      // })
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
      console.log('insInfo: '+JSON.stringify(this.data.inspectionInfo))
    },

    onHazInput: function (e) {
      var params = {}
      let label = e.currentTarget.dataset.label
      let index = e.currentTarget.dataset.index
      // params['inspectionInfo.' + label] = e.detail.value
      params['hazards[' +index + '].'  + label] = e.detail.value
      this.setData(params)
      console.log('onHazInput: params=' + JSON.stringify(params))
      console.log('hazinfo: '+JSON.stringify(this.data.hazards))
    },

    onAddHaz: function(e){
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
    onDelHaz: function(e){
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
      params.insStateIndex= e.detail.value
      params['inspectionInfo.' + 'state'] = this.data.insStateList[params.insStateIndex]
      if (params['inspectionInfo.' + 'state'] == INSPTECTION_NORMAL){
        params['inspectionInfo.' + 'description'] = NORMAL_DESC
      } else{
        params['inspectionInfo.' + 'description'] = ''
      }
      this.setData(params)
      console.log('onInsSelect: params=' + JSON.stringify(params))
    },
    onHazSelect: function (e) {
      var params = {}
      let index = e.currentTarget.dataset.index
      // params.insStateIndex= e.detail.value
      let selectIndex = e.detail.value
      params['hazards[' +index + '].'  + 'status'] = this.data.hazStateList[selectIndex]
      // params['inspectionInfo.' + 'state'] = this.data.insStateList[params.insStateIndex]
      // if (params['inspectionInfo.' + 'state'] == INSPTECTION_NORMAL){
      //   params['inspectionInfo.' + 'description'] = NORMAL_DESC
      // } else{
      //   params['inspectionInfo.' + 'description'] = ''
      // }
      this.setData(params)
      console.log('onHazSelect: params=' + JSON.stringify(params))
    },

    onChooseImage: function (e) {
      // var prop = 'userInfo.id_card_img.' + e.currentTarget.dataset.type
      Promisify(wx.chooseImage)({
        count: MAX_IMGS,
        sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album', 'camera'] // 可以指定来源是相册还是相机，默认二者都有
      }).then(res => {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        if (res.tempFilePaths.length>0){
          if (res.tempFilePaths.length == MAX_IMGS){
            this.setData({
              insHideAdd:1
            })
          }else{
            this.setData({
              insHideAdd:0
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
      // 先上传身份证照片，获取图片url，再上传用户信息
      this._uploadAttachedImgs().then(this._updateInsInfo).then(res=>{
        console.log('onSubmit: res='+ JSON.stringify(res))
        if (res.data.code == 0){
         wx.showToast({title: '创建巡检成功', mask: true})
         NB_TIMER = setTimeout(() => wx.navigateBack(), 1000)
        }else{
          wx.showToast({title: res.data.message, mask: true, icon:'none'})
        }
        
      }).
      catch(() => wx.hideLoading());
    },

    /**
   * 上传附件图片，返回图片url数组
   */
  _uploadAttachedImgs: function () {
  let imgsToUpload = this.data.insAttachImgs;

    // 如果是刚刚选择的本地照片，需要上传
    // 如果是服务器url，那么直接返回
    var upload = function (imgPath) {
      return new Promise((resolve, reject) => {
        console.log('_uploadAttachedImgs: imgPath='+imgPath)
      
        if (imgPath.indexOf(DOMAIN_NAME) === -1) {
          wx.showLoading({title: '上传图片中', mask: true})
          uploadImg(imgPath)
            .then(res => {
            let files = {url: JSON.parse(res).optImgSrc, status:'finished'}
            resolve(files)
            console.log('_uploadAttachedImgs: sucess='+ JSON.stringify(files))
            })
            .catch(err => reject(err))
        } else {
          resolve(imgPath)
        }
      })
    }

    let promises = []
    imgsToUpload.forEach(url =>{
      promises.push(upload(url));
    })

    console.log('_uploadAttachedImgs promiseS : ' + promises.length)
    return Promise.all(promises).then(serverPaths =>{
      console.log('_uploadAttachedImgs upload : serverPaths='+ JSON.stringify(serverPaths))
      return serverPaths;
    })
  },

  /**
   * 将服务器返回的图片路径加入到参数中，上传巡检信息
   */
  _updateInsInfo: function (imgPaths) {
    wx.showLoading({title: '上传巡检中', mask: true})
    this.data.inspectionInfo.createDate = new Date().toString();
    this.data.inspectionInfo.attachImgs = imgPaths
    console.log('_updateInsInfo: '+JSON.stringify(this.data.inspectionInfo))
    console.log('_updateInsInfoDate: '+ this.data.inspectionInfo.createDate)
    return addInspection(this.data.inspectionInfo).then(res => {
      console.log('_updateInsInfo result: '+JSON.stringify(res))
      return res;
    })
  },

  _initHazrd() {
    return {
      // createDate: '',
      // buildingName: this.modal.buildingName,
      area: '',
      description: '',
      detail: '',
      createDate: '',
      hazardState: '',
      customState: '',
      reviewDate: '',
      index: 0,
      status: '',
      statusIndex: 0,
      attachImgs: [],
      userID: uid,
      createUserName: userName
    };
  },

  })