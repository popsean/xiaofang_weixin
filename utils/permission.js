/**
 * 权限控制（登录状态、用户信息）
 * 登录、退出、检测是否登录、检测账号状态(是否被拉黑)等
 */

const { default: ZLog } = require("./ZLog")

/**
 * storage key
 */
const UID_KEY = 'UID'
const TOKEN_KEY = 'TOKEN'
const NICKNAME_KEY = 'NICKNAME'
const PERMISSION_KEY = 'PERMISSION'


/**
 * 用户id，指示当前登录用户
 */
var UID = null

/**
 * 用户token
 */
var TOKEN = null

var NICKNAME = null
var PERMISSION = null

/**
 * 获取用户id
 * @return integer|null
 */
function getUID () {
  return UID
}

/**
 * 设置用户id
 */
function setUID (uid) {
  UID = uid
}

/**
 * 获取用户token
 * @return integer|null
 */
function getToken () {
  return TOKEN
}

/**
 * 设置用户id
 */
function setToken (token) {
  TOKEN = token
}

function getNickName () {
  return NICKNAME
}

/**
 * 设置用户NickName
 */
function setNickName (nickname) {
  NICKNAME = nickname
}

function getPermission () {
  return PERMISSION
}

/**
 * 设置用户 Permission
 */
function setPermission (permission) {
  PERMISSION = permission
}

/**
 * 自动登录
 */
function autoLogin () {
  UID = wx.getStorageSync(UID_KEY)
  TOKEN = wx.getStorageSync(TOKEN_KEY)
  NICKNAME = wx.getStorageSync(NICKNAME_KEY)
  PERMISSION = wx.getStorageSync(PERMISSION_KEY)
  ZLog.log('autologin, uid='+UID + ', TOKEN='+TOKEN + ', NICKNAME=' + NICKNAME + ', PERMISSION=' + PERMISSION)
}

/**
 * 设置登录态，保存用户token与用户信息
 */
function login (token, userInfo) {
  try {
    console.log('login : ' + JSON.stringify(userInfo))
    wx.setStorageSync(TOKEN_KEY, token)
    wx.setStorageSync(UID_KEY, userInfo.id)
    wx.setStorageSync(NICKNAME_KEY, userInfo.nickName)
    wx.setStorageSync(PERMISSION_KEY, userInfo.permission)
    setToken(token)
    setUID(userInfo.id)
    setNickName(userInfo.nickName)
    setPermission(userInfo.permission)
    getApp().setUserInfo(userInfo)
    return true
  } catch (e) {
    console.error('设置storage失败: ' + e)
    return false
  }
}

function setLogin (token, userInfo) {
  try {
    console.log('setLogin : ' + JSON.stringify(userInfo))
    wx.setStorageSync(TOKEN_KEY, token)
    wx.setStorageSync(UID_KEY, userInfo.id)
    wx.setStorageSync(NICKNAME_KEY, userInfo.nickName)
    wx.setStorageSync(PERMISSION_KEY, userInfo.permission)
    setToken(token)
    setUID(userInfo.id)
    setNickName(userInfo.nickName)
    setPermission(userInfo.permission)
    getApp().setUserInfo(userInfo)
    return true
  } catch (e) {
    console.error('设置storage失败: ' + e)
    return false
  }
}

/**
 * 登出
 */
function logout () {
  try {
    wx.clearStorageSync()
    setToken(null)
    setUID(null)
    setNickName(null)
    setPermission(1)
    getApp().setUserInfo(null)
    return true 
  } catch (e) {
    console.error('清空storage失败: ' + e)
    return false
  }
}

/**
 * 检测是否登录，弹出登录对话框（可选）
 * 用于需要登录的操作（如图书详情、书单详情等可分享页面中）
 * @param showModal {Boolean}
 * @return {Boolean}
 */
function isLogin (showModal = false) {
  if (UID) {
    return true
  } else {
    if (showModal) {
      wx.showModal({
        title: '您还未登录',
        content: '登录后才可使用完整功能，是否前去登录？',
        success: res => {
          if (res.confirm) {
            wx.navigateTo({ url: '/pages/register/register?need_return=true' })
          }
        }
      })
    }
    return false
  }
}

module.exports = {
  getUID: getUID,
  getToken: getToken,
  getNickName: getNickName,
  getPermission: getPermission,
  autoLogin: autoLogin,
  login: login,
  setLogin: setLogin,
  logout: logout,
  isLogin: isLogin
}
