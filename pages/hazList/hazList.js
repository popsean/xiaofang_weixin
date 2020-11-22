import { getHazards } from '../../apis/hazard'
import { turntoDate } from '../../utils/turnTime'



/**
 * searching属性初始值
 * 每次输入框focu、clear、input时都要重置searching为初始状态
 */
const PAGE_SIZE = 10;
var pageNo = 1;

Page({

  /**
   * 页面的初始数据
   */
  data: {

    scrollTop: 0,
    eventInfo: {},
    buildingName: '',
    insId: '5fb8db1855838970e3aacc01',
    unresolved: 0,
    totalNum: 0,
    dataList: [], // 默认状态下的的楼宇列表，未输入关键字时展示
    loadMoreStatus: 'hidding', // 加载更多组件：loading, nomore，hidding
    isNoData: false, // 是否暂无数据,
    mockList: [{
      _id: 1,
      img: '../../images/test_icon.jpg',
      desc: 'hhhhhhhhh',
      area: 'aaa',
      status: 'bbb',
      reviewCount: '3',
      reviewDate: '2020-10-23',
      createDate: '2020-10-23',
      user: 'me'

    }, {
      _id: 2,
      img: '../../images/test_icon.jpg',
      desc: 'hhhhhhhhh',
      area: 'aaa',
      status: 'bbb',
      reviewCount: '3',
      createDate: '2020-10-23',
      reviewDate: '2020-10-23',
      user: 'me'
    },
    {
      _id: 2,
      img: '../../images/test_icon.jpg',
      desc: 'hhhhhhhhh',
      area: 'aaa',
      status: 'bbb',
      reviewCount: '3',
      createDate: '2020-10-23',
      reviewDate: '2020-10-23',
      user: 'me'
    }, {
      _id: 2,
      img: '../../images/test_icon.jpg',
      desc: 'hhhhhhhhh',
      area: 'aaa',
      status: 'bbb',
      reviewCount: '3',
      createDate: '2020-10-23',
      reviewDate: '2020-10-23',
      user: 'me'
    }, {
      _id: 2,
      img: '../../images/test_icon.jpg',
      desc: 'hhhhhhhhh',
      area: 'aaa',
      status: 'bbb',
      reviewCount: '3',
      createDate: '2020-10-23',
      reviewDate: '2020-10-23',
      user: 'me'
    }, {
      _id: 2,
      img: '../../images/test_icon.jpg',
      desc: 'hhhhhhhhh',
      area: 'aaa',
      status: 'bbb',
      reviewCount: '3',
      createDate: '2020-10-23',
      reviewDate: '2020-10-23',
      user: 'me'
    }, {
      _id: 2,
      img: '../../images/test_icon.jpg',
      desc: 'hhhhhhhhh',
      area: 'aaa',
      status: 'bbb',
      reviewCount: '3',
      createDate: '2020-10-23',
      reviewDate: '2020-10-23',
      user: 'me'
    },
    {
      _id: 3,
      img: '../../images/test_icon.jpg',
      desc: 'hhhhhhhhh',
      area: 'aaa',
      status: 'bbb',
      reviewCount: '3',
      createDate: '2020-10-23',
      reviewDate: '2020-10-23',
      user: 'me'
    }
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // this.setData({
    //   dataList:this.data.mockList,
    //   isNoData:false,
    //   buildingName: '哈哈楼',
    //   totalNum:2
    // })
    // wx.hideLoading();
    console.log('hazardlist onLoad options:' + JSON.stringify(options))
    pageNo = 1;
    wx.showLoading({ title: '加载中', mask: true })
    this._fetchData(this.data.insId).then(res => {
      this.setData({
        insId: options.id,
        dataList: res.list,
        buildingName: res.list[0].buildingName,
        totalNum: res.totalNum,
        unresolved: res.unresolved,
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
    this._fetchData(this.data.insId).then(res => {
      let { dataList } = this.data;

      let list = res.list;
      params.dataList = dataList.concat(list)
      params.loadMoreStatus = list.length ? 'hidding' : 'nomore'
      params.totalNUm = res.totalNum
      params.unresolved = res.unresolved
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
  console.log('hazard: fetchData')
  return getHazards({ ins_id: id, pageNo: pageNo, size: PAGE_SIZE }).then(res => {
    pageNo++;
    console.log('hazard result:' + res.data.result.length)
    return bizProcessData(res.data);
  })
}

function bizProcessData(data) {
  let result = {}
  let list = []
  console.log('bizProcessData:' + data.result.length)
  // console.log(' data.unresolvedHazs:' + JSON.stringify(data))
  // console.log(' data.unresolvedHazs:' + data.totalUnresolveNum)
  var unresolveCount = 0;
  data.result.forEach((haz, index) => {

    console.log('hazard:' + haz.description)
    // console.log('hazard2 ')
    if (haz.state !== '已解决') {
      unresolveCount++;
    }
    list.push(mapModel(haz, index))

  })
  console.log('list:' + list.length + ",unresolveCount=" + unresolveCount)
  result.list = list;
  result.totalNum = data.totalNum
  result.unresolved = unresolveCount
  return result;
}

function mapModel(haz, idx) {
  let model = {}
  model.idx = idx;
  model._id = haz._id
  model.img = haz.attachImgs.length > 0 ? haz.attachImgs[0].url : ''
  model.attachImgs = haz.attachImgs
  model.img_count = haz.attachImgs.length
  model.desc = haz.description
  model.detail = haz.detail
  model.buildingName = haz.buildingName
  model.area = haz.area
  model.status = haz.state
  if(model.status == '自定义'){
    model.status = haz.customState
  }
  model.reviewCount = haz.reviewCount
  model.createDate = turntoDate(
    new Date(haz.createDate).getTime()
  );
  if (haz.reviewDate) {
    model.reviewDate = turntoDate(
      new Date(haz.reviewDate).getTime()
    );
  }
  model.user = haz.createUserName

  console.log('mapModel : ' + JSON.stringify(model))
  return model;
}
