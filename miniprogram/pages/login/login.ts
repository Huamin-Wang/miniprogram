const config = require('../../utils/config')
Page({
  // 页面的初始数据
  data: {
      identifier: '', // 存储学号/教工号
      password: '', // 存储密码
      openid: '' ,// 存储openid
      gender: '',
      email: '',
      role: '',
      user_name: '',
  },

  // 处理学号/教工号输入事件
  onUsernameInput(e) {
      this.setData({
          identifier: e.detail.value
      });
  },

  // 处理密码输入事件
  onPasswordInput(e) {
      this.setData({
          password: e.detail.value
      });
  },
copyUrl() {
    wx.setClipboardData({
        data: 'https://www.001ai.top',
        success() {
            wx.showToast({
                title: '网址已复制',
                icon: 'success'
            });
        }
    });
},
  // 在页面加载时尝试从本地存储的 userInfo 中获取 openid
  onLoad() {
      const openid = wx.getStorageSync('openid');
      console.log("账号绑定页面onload获取的openid：",openid)
      if (openid) {
          this.setData({
              openid: wx.getStorageSync('openid')
          });
      }
  },

  // 处理登录按钮点击事件
  onLogin() {
      const { identifier, password, openid } = this.data;
      // 验证学号/教工号和密码是否为空
      if (!identifier || !password) {
          wx.showToast({
              title: '学号/教工号和密码不能为空',
              icon: 'none'
          });
          return;
      }

      // 验证 openid 是否存在
      if (!openid) {
          wx.showToast({
              title: '未获取到 openid，请重新进入页面',
              icon: 'none'
          });
          return;
      }

      // 发送数据到后端进行验证
      wx.request({
          url: `${config.baseUrl}/minilogin`,  // 使用 config.baseUrl
          method: 'POST',
          header: {
              'Content-Type': 'application/json'
          },
          data: {
              identifier,
              password,
              openid,
          },
          success: (res) => {
              if (res.data.success) {
                  wx.showToast({
                      title: '登录成功',
                      icon: 'success'
                  });
                  // 更新本地存储的用户信息
                  wx.setStorageSync('userInfo', {
                      ...wx.getStorageSync('userInfo'),
                      user_id: res.data.user_id,
                      user_name: res.data.user_name,
                      user_role: res.data.user_role,
                      user_identifier:res.data.user_identifier,
                      gender:res.data.gender,
                      email: res.data.email,
                      openid: wx.getStorageSync('openid')
                  });
                  console.log('本地用户信息:', wx.getStorageSync('userInfo'));
                  // 登录成功后进行页面跳转
                  wx.navigateTo({
                      url: `/pages/index/index`
                  });
              } else {
                  wx.showToast({
                      title: '登录失败，请检查信息',
                      icon: 'none'
                  });
              }
          },
          fail: () => {
              wx.showToast({
                  title: '网络错误',
                  icon: 'none'
              });
          }
      });
  }
});