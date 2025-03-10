const config = require('../../utils/config')
Page({
  // 页面的初始数据
  data: {
      identifier: '', // 存储学号/教工号
      password: '', // 存储密码
      openid: '' // 存储openid
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

  // 在页面加载时尝试从本地存储的 userInfo 中获取 openid
  onLoad() {
      const userInfo = wx.getStorageSync('userInfo');
      console.log("openid1111",userInfo.openid)
      if (userInfo && userInfo.openid) {
          this.setData({
              openid: userInfo.openid
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
              openid
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
                      user_role: res.data.user_role
                  });
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