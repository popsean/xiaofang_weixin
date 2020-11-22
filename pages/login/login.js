// import Login from '../../service/login'
import ZLog from '../../utils/ZLog';
import SHA1 from '../../utils/sha1'
import { login } from '../../apis/login'
import {setLogin} from '../../utils/permission'

Page({
  data: {
    name: '',
    password: ''
  },

  // 获取输入账号
  nameInput: function (e) {
    this.setData({
      name: e.detail.value
    })
  },

  // 获取输入密码
  passwordInput: function (e) {
    this.setData({
      password: e.detail.value
    })
  },

  // 登录
  onSumbit: function () {
    if (this.data.name.length == 0 || this.data.password.length == 0) {
      wx.showToast({
        title: '用户名和密码空',
        icon: 'loading',
        duration: 2000
      })
    } else {
      let data = { name: this.data.name, password: SHA1.hex_sha1(this.data.password) }
      login(data).then(res =>{
        console.warn('onLogin Result:', res.data)
        
        if (res.data.code != 0){
          console.warn('onLogin code :', res.data.code)
          wx.showToast({
            title: res.data.message,
            icon: 'none',
            duration: 1000
          })
          // return Promise.reject(new Error('登录失败:'+res.data.message))
        } else {
        let userInfo = res.data.data;
        userInfo.id = userInfo._id;
        if (!setLogin(res.data.token, userInfo)) {
          return Promise.reject(new Error('设置登录态失败'))
        }
        wx.redirectTo({ url: '/pages/building/building' })
      }
      }).finally(() => {
        // wx.hideToast()
      });
    }


  }

})