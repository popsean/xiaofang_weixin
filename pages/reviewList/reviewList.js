import { getReviews } from '../../apis/review'
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
    hazId: '5fb8db1855838970e3aacc01',
    unresolved: 1,
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
    console.log('reviewlist onLoad optins:' + JSON.stringify(options))
    this.data.hazId = options.id 
    this.data.buildingName = options.bName 
    pageNo = 1;
    wx.showLoading({ title: '加载中', mask: true })
    this._fetchData(this.data.hazId).then(res => {
      this.setData({
        hazId: options.id,
        dataList: res.list,
        buildingName: options.bName ,
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
    this._fetchData(this.data.hazId).then(res => {
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
  console.log('review: fetchData')
  return getReviews({ haz_id: id, pageNo: pageNo, size: PAGE_SIZE }).then(res => {
    pageNo++;
    console.log('review result:' + res.data.result.length)
    return bizProcessData(res.data);
  })
}

function bizProcessData(data) {
  let result = {}
  let list = []
  console.log('bizProcessData:' + data.result.length)
  // console.log(' data.unresolvedreviews:' + JSON.stringify(data))
  // console.log(' data.unresolvedreviews:' + data.totalUnresolveNum)
  var unresolveCount = 0;
  data.result.forEach((review, index) => {

    console.log('review:' + review.description)
    // console.log('review2 ')
    if (review.state !== '已解决') {
      unresolveCount++;
    }
    list.push(mapModel(review, index))

  })
  console.log('list:' + list.length + ",unresolveCount=" + unresolveCount)
  result.list = list;
  result.totalNum = data.totalNum
  result.unresolved = unresolveCount
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
  model.reviewCount = review.reviewCount
  model.createDate = turntoDate(
    new Date(review.createDate).getTime()
  );
  if (review.reviewDate) {
    model.reviewDate = turntoDate(
      new Date(review.reviewDate).getTime()
    );
  }
  model.user = review.createUserName
  model.detail = review.detail

  console.log('mapModel : ' + JSON.stringify(model))
  return model;
}
