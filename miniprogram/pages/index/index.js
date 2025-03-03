Page({
  data: {
    user_id: null,
    user_name: '',
    user_role: '',
    features: [
      { title: '智能答疑', description: '基于大模型的实时问答系统，为学生提供24小时学习支持，快速解答各类学习疑问。' },
      { title: '个性化学习', description: '根据学生的学习进度和掌握情况，提供定制化的学习建议和资源推荐。' },
      { title: '课程管理', description: '教师可以轻松创建和管理课程内容，学生可以便捷地访问学习资料。' },
      { title: '学习分析', description: '通过数据分析，了解学习效果，帮助教师优化教学策略，提升教学质量。' },
      { title: '互动讨论', description: '支持师生在线交流，营造良好的学习氛围，促进知识的共享与创新。' },
      { title: '作业批改', description: '智能辅助批改作业，提供详细的反馈，帮助学生更好地理解和改进。' }
    ]
  },

  onLoad() {
    // 检查是否有缓存的用户信息
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.setData({
        user_id: userInfo.user_id,
        user_name: userInfo.user_name,
        user_role: userInfo.user_role
      })
    }
  },

  getUserProfile() {
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        const userInfo = res.userInfo
        // 获取登录凭证
        wx.login({
          success: (loginRes) => {
            const code = loginRes.code
            
            wx.request({
              url: 'http://192.168.8.173/getOpenId',
              method: 'POST',
              header: {
                'Content-Type': 'application/json' // 设置请求头为 JSON 格式
              },
              data: {
                code: code,
                userInfo: userInfo
              },
              success: (result) => {
                if (result.data.success) {
                  // 假设后端返回用户角色等信息
                  const userData = {
                    user_id: result.data.user_id,
                    user_name: result.data.user_name,
                    user_role: result.data.user_role || 'student' // 默认为学生角色
                  }
                  // 输出 userData 到控制台
                  console.log('用户数据:', userData);

                  // 判断 user_id 是否为 -1
                  if (userData.user_id === -1) {
                    // 跳转到登录页面，这里假设登录页面路径为 /pages/login/login
                    wx.navigateTo({
                      url: '/pages/login/login'
                    });
                    return;
                  }

                  // 更新状态
                  this.setData(userData)
                  
                  // 保存到本地存储
                  wx.setStorageSync('userInfo', userData)
                  
                  wx.showToast({
                    title: '登录成功'
                  })
                } else {
                  wx.showToast({
                    title: '登录失败',
                    icon: 'none'
                  })
                }
              },
              fail: () => {
                wx.showToast({
                  title: '网络错误',
                  icon: 'none'
                })
              }
            })
          }
        })
      },
      fail: (res) => {
        wx.showToast({
          title: '您拒绝了授权',
          icon: 'none'
        })
      }
    })
  },

  logout() {
    // 清除用户信息
    this.setData({
      user_id: null,
      user_name: '',
      user_role: ''
    })
    // 清除存储
    wx.removeStorageSync('userInfo')
    wx.showToast({
      title: '已退出登录'
    })
  },

  goToStudentProfile() {
    wx.navigateTo({
      url: '/pages/student_profile/student_profile'
    })
  },

  goToTeacherProfile() {
    wx.navigateTo({
      url: '/pages/teacher_profile/teacher_profile'
    })
  }
})