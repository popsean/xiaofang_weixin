import { getInspections } from '../../apis/inspection'
import {turntoDate} from  '../../utils/turnTime'



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

    buildingId:'5c04f64b00c4056ce4a3cc2b',
    dataList: [], // 默认状态下的的楼宇列表，未输入关键字时展示
    loadMoreStatus: 'hidding', // 加载更多组件：loading, nomore，hidding
    isNoData: false, // 是否暂无数据,
    mockList: [{
      _id: 1,
      img: '../../images/test_icon.jpg',
      desc: 'hhhhhhhhh',
      area: 'aaa',
      status: 'bbb',
      subCount: '3',
      date: '2020-10-23',
      user: 'me'

    }, {
      _id: 2,
      img: '../../images/test_icon.jpg',
      desc: 'hhhhhhhhh',
      area: 'aaa',
      status: 'bbb',
      subCount: '3',
      date: '2020-10-23',
      user: 'me'
    }, 
    {
      _id: 2,
      img: '../../images/test_icon.jpg',
      desc: 'hhhhhhhhh',
      area: 'aaa',
      status: 'bbb',
      subCount: '3',
      date: '2020-10-23',
      user: 'me'
    },{
      _id: 2,
      img: '../../images/test_icon.jpg',
      desc: 'hhhhhhhhh',
      area: 'aaa',
      status: 'bbb',
      subCount: '3',
      date: '2020-10-23',
      user: 'me'
    },{
      _id: 2,
      img: '../../images/test_icon.jpg',
      desc: 'hhhhhhhhh',
      area: 'aaa',
      status: 'bbb',
      subCount: '3',
      date: '2020-10-23',
      user: 'me'
    },{
      _id: 2,
      img: '../../images/test_icon.jpg',
      desc: 'hhhhhhhhh',
      area: 'aaa',
      status: 'bbb',
      subCount: '3',
      date: '2020-10-23',
      user: 'me'
    },{
      _id: 2,
      img: '../../images/test_icon.jpg',
      desc: 'hhhhhhhhh',
      area: 'aaa',
      status: 'bbb',
      subCount: '3',
      date: '2020-10-23',
      user: 'me'
    },
    {
      _id: 3,
      img: '../../images/test_icon.jpg',
      desc: 'hhhhhhhhh',
      area: 'aaa',
      status: 'bbb',
      subCount: '3',
      date: '2020-10-23',
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
    //   isNoData:false
    // })
    pageNo = 1;
    wx.showLoading({ title: '加载中', mask: true })
    this._fetchData(this.data.buildingId).then(res => {
      this.setData({
        dataList: res,
        isNoData:res.length === 0
      })
    }).catch(() => {
      this.setData({ isNoData: true })
    }).finally(() => wx.hideLoading())
  },

  onReachBottom: function () {

    // 加载中或没有数据时返回
    let { loadMoreStatus, isNoData } = this.data
    if (loadMoreStatus !== 'hidding' || isNoData) return

    // 加载数据并设置loading组件状态
    let params = {} // eg: {'default.loadMoreStatus': xxx}
    params.loadMoreStatus = 'loading'
    this.setData(params)
    this._fetchData(this.data.buildingId).then(res => {
      let { dataList } = this.data;

      params.dataList = dataList.concat(res)
      params.loadMoreStatus = res.length ? 'hidding' : 'nomore'
      this.setData(params)
    }).catch(() => {
      params.loadMoreStatus = 'hidding'
      this.setData(params)
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
  return getInspections({ buildingID:id, pageNo: pageNo, size: PAGE_SIZE }).then(res => {
    pageNo ++;
    console.log('inspection result:' + res.data.result.length)
    return bizProcessData(res.data.result);
  })
}

function bizProcessData(insS) {
  let list = []
  console.log('bizProcessData:' + insS.length)
  insS.forEach(ins => {
    // if (building.latestSecurityState == '隐患挂账') {
    //   building.secure = 0
    // } else {
    //   building.secure = 1
    // }
    console.log('inspection:' + ins.description)
    // console.log('inspection2 ')
    list.push(mapModel(ins))
    
  })
  console.log('list:' + list.length)
  return list;
}
function mapModel(ins){
  let model ={}
  model._id= ins._id
  model.img= ins.attachImgs.length > 0 ? ins.attachImgs[0].url : ''
  model.desc= ins.description
  model.area= ins.area
  model.status= ins.state
  model.subCount= ins.hazardsCount
  model.date= turntoDate(
    new Date(ins.createDate).getTime()
    );
  model.user= ins.createUserName

  console.log('mapModel : ' + JSON.stringify(model))
  return model;
}