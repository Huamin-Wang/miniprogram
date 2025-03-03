Page({
  // 页面的初始数据
  data: {
    identifier: '', // 存储学号/教工号
    password: ''  // 存储密码
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

  // 处理登录按钮点击事件
  onLogin() {
    const { identifier, password } = this.data;
    // 在这里可以对获取到的数据进行验证
    if (!identifier || !password) {
      wx.showToast({
        title: '学号/教工号和密码不能为空',
        icon: 'none'
      });
      return;
    }

    // 示例：将数据发送到后端进行验证
    wx.request({
      url: 'http://192.168.8.173/minilogin', 
      method: 'POST',
      header: {
        'Content-Type': 'application/json'
      },
      data: {
        identifier: identifier,
        password: password
      },
      success: (res) => {
        if (res.data.success) {
          wx.showToast({
            title: '登录成功',
            icon: 'success'
          });
            // 存储用户数据
        wx.setStorageSync('userInfo', {
          user_id: res.data.user_id,
          user_name: res.data.user_name,
          user_role: res.data.user_role


        });
          // 登录成功后可以进行页面跳转等操作
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