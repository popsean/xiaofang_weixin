import { getInspections } from '../../apis/inspection'
import { turntoDate } from '../../utils/turnTime'
import { getPermission} from '../../utils/permission'



/**
 * searching属性初始值
 * 每次输入框focu、clear、input时都要重置searching为初始状态
 */
const PAGE_SIZE = 10;
var pageNo = 1;
const app = getApp()
// var permission = getPermission()

Page({

  /**
   * 页面的初始数据
   */
  data: {

    scrollTop: 0,
    eventInfo: {},

    buildingId: '',
    buildingName: '',
    unresolve: 0,
    dataList: [], 
    loadMoreStatus: 'hidding', // 加载更多组件：loading, nomore，hidding
    isNoData: false, // 是否暂无数据,
    userPerm: 1,
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

    console.log('onLoad options:' + JSON.stringify(options))

    this.data.buildingId = options.bID
    this.data.buildingName = options.bName

    this.setData({
      buildingId: options.bID,
      buildingName: options.bName,
      userPerm: getPermission()
    })
    this.refresh()
  },

  refresh: function(){
    pageNo = 1;
    this.dataList = []
    wx.showLoading({ title: '加载中', mask: true })
    this._fetchData(this.data.buildingId).then(res => {
      console.log('refresh finihs')
      this.setData({
        dataList: res.list,
        // buildingName:options.bName,
        // buildingId:options.bID,
        unresolve:res.unresolve,
        isNoData: res.list.length === 0
      })
    }).catch(() => {
      this.setData({ isNoData: true })
    }).finally(() => wx.hideLoading())
  },

  onPageScroll: function (e) {
    this.setData({scrollTop: e.scrollTop})
  },

  onSticky: function (e) {
    this.setData({eventInfo: e.detail})
  },

  onReachBottom: function () {
    console.log('onReachBottom')
    // 加载中或没有数据时返回
    let { loadMoreStatus, isNoData } = this.data
    if (loadMoreStatus !== 'hidding' || isNoData) return

    // 加载数据并设置loading组件状态
    let params = {} // eg: {'default.loadMoreStatus': xxx}
    params.loadMoreStatus = 'loading'
    this.setData(params)
    this._fetchData(this.data.buildingId).then(res => {
      let { dataList } = this.data;

      let list = res.list;
      params.dataList = dataList.concat(list)
      params.loadMoreStatus = list.length ? 'hidding' : 'nomore'
      params.unresolve = res.unresolve
      this.setData(params)
    }).catch(() => {
      params.loadMoreStatus = 'hidding'
      this.setData(params)
    })
  },
  onPreviewImage: function (e) {
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
  console.log('inspection: fetchData')
  return getInspections({ buildingID: id, pageNo: pageNo, size: PAGE_SIZE }).then(res => {
    pageNo++;
    console.log('inspection result:' + res.data.result.length)
    return bizProcessData(res.data);
  })
}

function bizProcessData(data) {
  let result= {}
  let list = []
  console.log('bizProcessData:' + data.result.length)
  console.log(' data.unresolvedHazs:' + JSON.stringify(data))
  console.log(' data.unresolvedHazs:' + data.totalUnresolveNum)
  data.result.forEach((ins, index) => {

    console.log('inspection:' + ins.description)
    // console.log('inspection2 ')
    list.push(mapModel(ins, index))

  })
  console.log('list:' + list.length)
  result.list = list;
  result.unresolve = data.totalUnresolveNum
  return result;
}

function mapModel(ins, idx) {
  let model = {}
  model.idx = idx;
  model._id = ins._id
  model.img = ins.attachImgs.length > 0 ? ins.attachImgs[0].url : ''
  model.attachImgs = ins.attachImgs
  model.img_count = ins.attachImgs.length
  model.desc = ins.description
  model.buildingName = ins.buildingName
  model.area = ins.area
  model.status = ins.state
  model.subCount = ins.hazardsCount
  model.date = turntoDate(
    new Date(ins.createDate).getTime()
  );
  model.user = ins.createUserName
  model.secure = (ins.state == '异常-未解决' ? 0:1)

  console.log('mapModel : ' + JSON.stringify(model))
  return model;
}
