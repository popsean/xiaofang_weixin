import Promise from './utils/es6-promise'
import promisePolyfill from './utils/promise-polyfill' // 添加 promise.finally
import EventEmitter from './utils/event' // 事件总线
import { getUserInfoById } from './apis/user' // 获取用户信息
import { autoLogin, getUID } from './utils/permission'
import {USER_PERMISSION_VISITOR} from './utils/constant'

// fundebug 错误监控
// var fundebug = require('/utils/fundebug.0.5.0.min.js')
// fundebug.apikey = '这里要填写成你的key'
// fundebug.setSystemInfo = true
// fundebug.releaseStage = 'production'

App({
  /**
   * 全局事件总线
   */
  event: new EventEmitter(),


  /**
   *   全局变量
   */
  globalData:{
    //控制返回页面后是否刷新数据
    needRefresh: false,
  },


  onLaunch: function () {
    // wx.clearStorageSync()

    // 自动登录
    autoLogin()

    // 初始化帮助信息
    // initTipSettings()
  },

  /**
   * 获取用户信息
   * @return {Promise}
   */
  // getUserInfo: function () {
  //   console.log('app getUserInfo: ' + JSON.stringify(USER_INFO))
  //   let uid = getUID()
  //   if (!uid) {
  //     return Promise.reject(new Error('未登录'))
  //   }
  //   // 已经有用户信息时直接返回
  //   if (USER_INFO.id) {
  //     return Promise.resolve(USER_INFO)
  //   }
  //   return getUserInfoById(uid).then(res => {
  //     this.setUserInfo(res.data)
  //     return res.data
  //   })
  // },

  // getUserInfoSync: function(){
  //   console.log('app getUserInfoSync: ' + JSON.stringify(USER_INFO))
  //   return USER_INFO;
  // },

  /**
   * 设置用户信息
   * @event <userInfoChanged> 在个人信息页(personal-information)被监听
   */
  setUserInfo: function (userInfo) {
    USER_INFO = Object.assign({}, USER_INFO, userInfo)
    this.event.emit('userInfoChanged', {userInfo: userInfo})
    console.log('app setUserInfo: ' + JSON.stringify(USER_INFO))
  }
})

/**
 * 用户完整信息，只能通过getter和setter访问和修改
 */
var USER_INFO = {
  id: null, // 用户id
  _id: null,
  userName: '', // 登录用户名
  nickName: '', // 昵称
  permission: USER_PERMISSION_VISITOR // 权限
}
