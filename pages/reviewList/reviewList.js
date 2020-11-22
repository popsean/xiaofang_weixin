import { getReviews } from '../../apis/review'
import { turntoDate } from '../../utils/turnTime'



/**
 * searching属性初始值
 * 每次输入框focu、clear、input时都要重置searching为初始状态
 */
const PAGE_SIZE = 10;
var pageNo = 1;
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {

    scrollTop: 0,
    eventInfo: {},
    buildingName: '',
    hazId: '',
    showAddBt: false,
    totalNum: 0,
    dataList: [], // 
    loadMoreStatus: 'hidding', // 加载更多组件：loading, nomore，hidding
    isNoData: false, // 是否暂无数据,
  },


  onShow: function (options){
    console.log('app.globalData.needRefresh = ' + app.globalData.needRefresh )
    if (app.globalData.needRefresh){
      app.globalData.needRefresh = false;
      this.refresh()
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('reviewlist onLoad optins:' + JSON.stringify(options))
    this.setData({
      hazId: options.hazID,
      buildingName: options.bName,
    })
    pageNo = 1;
    wx.showLoading({ title: '加载中', mask: true })
    this.refresh()
  },

  refresh: function(){
    pageNo = 1;
    this.dataList = []
    this._fetchData(this.data.hazId).then(res => {
      console.log('refresh res= ' + JSON.stringify(res))
      this.setData({
        dataList: res.list,
        totalNum: res.totalNum,
        showAddBt: res.showAddBt ,
        isNoData: res.list.length === 0
      })
    }).catch(() => {
      this.setData({ isNoData: true })
    }).finally(() => wx.hideLoading())
  },

  onPageScroll: function (e) {
    this.setData({ scrollTop: e.scrollTop })
  },

  onSticky: function (e) {
    this.setData({ eventInfo: e.detail })
  },

  onReachBottom: function () {

    // 加载中或没有数据时返回
    let { loadMoreStatus, isNoData } = this.data
    if (loadMoreStatus !== 'hidding' || isNoData) return

    // 加载数据并设置loading组件状态
    let params = {} // eg: {'default.loadMoreStatus': xxx}
    params.loadMoreStatus = 'loading'
    this.setData(params)
    this._fetchData(this.data.hazId).then(res => {
      let { dataList } = this.data;
      console.log('onReachBottom res=' + JSON.stringify(res))
      let list = res.list;
      params.dataList = dataList.concat(list)
      params.loadMoreStatus = list.length ? 'hidding' : 'nomore'
      params.totalNUm = res.totalNum
      params.showAddBt = res.showAddBt
      this.setData(params)
    }).catch(() => {
      params.loadMoreStatus = 'hidding'
      this.setData(params)
    })
  },
  onPreviewImage: function (e) {
    console.log('onPreviewImage: dataset=' + JSON.stringify(e.currentTarget.dataset))
    let index = parseInt(e.currentTarget.dataset.index)
    console.log('onPreviewImage: lable=' + index)
    let imgsList = []
    this.data.dataList[index].attachImgs.forEach(img => {
      imgsList.push(img.url)

    })
    wx.previewImage({
      // 当前显示图片的http链接
      current: imgsList[0],
      // l需要预览的图片http链接列表，filter过滤空ur
      urls: imgsList
    })
  },


  /**
   * 获取数据，返回馆藏列表
   */
  _fetchData: fetchData
})
/**
 * 获取数据，返回馆藏列表
 * @param type {string} enum:[default, searching]
 * @return array
 */
function fetchData(id) {
  console.log('review: fetchData')
  return getReviews({ haz_id: id, pageNo: pageNo, size: PAGE_SIZE }).then(res => {
    pageNo++;
    console.log('review result:' + res.data.result.length)
    return bizProcessData(res.data);
  })
}

function bizProcessData(inData) {
  let result = {}
  let list = []
  console.log('bizProcessData:' + inData.result.length)
  inData.result.forEach((review, index) => {
    console.log('review:' + review.description)
    list.push(mapModel(review, index))
  })
  console.log('list:' + list.length)
  result.list = list;
  result.totalNum = inData.totalNum
  result.showAddBt =  true
  if (inData.result.length > 0) {
    result.showAddBt = inData.result.some(review => {
      return review.state !== '已解决';
    });
  }
  console.log('result :' + JSON.stringify(result))
  
  return result;
}

function mapModel(review, idx) {
  let model = {}
  model.idx = idx;
  model._id = review._id
  model.img = review.attachImgs.length > 0 ? review.attachImgs[0].url : ''
  model.attachImgs = review.attachImgs
  model.img_count = review.attachImgs.length
  model.desc = review.description
  // model.buildingName = review.buildingName
  model.area = review.area
  model.status = review.state

  if (review.reviewDate) {
    model.reviewDate = turntoDate(
      new Date(review.reviewDate).getTime()
    );
  }

  if (review.nextReviewDate) {
    model.nextReviewDate = turntoDate(
      new Date(review.nextReviewDate).getTime()
    );
  }
  model.user = review.createUserName
  model.detail = review.detail

  console.log('mapModel : ' + JSON.stringify(model))
  return model;
}
