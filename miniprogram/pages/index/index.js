// pages/index/index.ts

const config = require('../../utils/config')
Page({
  data: {
    user_id: null,
    user_name: '',
    user_role: '',
    openid: "",
    user_identifier:"",
    gender:"",
    email:"",
    features: [
      { title: '智能答疑', description: '基于大模型的实时问答系统，为学生提供24小时学习支持，快速解答各类学习疑问。' },
      { title: '个性化学习', description: '根据学生的学习进度和掌握情况，提供定制化的学习建议和资源推荐。' },
      { title: '课程管理', description: '教师可以轻松创建和管理课程内容，学生可以便捷地访问学习资料。' },
      { title: '学习分析', description: '通过数据分析，了解学习效果，帮助教师优化教学策略，提升教学质量。' },
      { title: '互动讨论', description: '支持师生在线交流，营造良好的学习氛围，促进知识的共享与创新。' },
      { title: '作业批改', description: '智能辅助批改作业，提供详细的反馈，帮助学生更好地理解和改进。' }
    ],
    isCollected: false // 用于标记当前页面是否已收藏
  },
goToshare(){
    wx.navigateTo({
        url: '/pages/share/tools',
    });
},




  onLoad() {
    // 检查是否有缓存的用户信息
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo&& (userInfo.user_id !== -1)) {
      this.setData({
        user_id: userInfo.user_id,
        user_name: userInfo.user_name,
        user_role: userInfo.user_role,
        openid: userInfo.openid,
        user_identifier:userInfo.user_identifier,
        gender:userInfo.gender,
        email:userInfo.email,
      })

    }
  },
  unbindOpenId(){
    console.log("index.js解绑方法获取的openid:",wx.getStorageSync('openid'))
    //解绑用户的openid
    wx.request({
      url: `${config.baseUrl}/unbindOpenId`,  // 使用 config.baseUrl
      method: 'POST',
      header: {
        'Content-Type': 'application/json' // 设置请求头为 JSON 格式
      },
      data: {
        openid: wx.getStorageSync('openid'),
      },
      success: (result) => {
        if (result.data.success) {
          console.log("解绑成功");
        } else {
          console.log("解绑失败");
        }
      },
      fail: () => {
        wx.showToast({
          title: '网络错误或者服务器异常',
          icon: 'none'
        })
      }
    })
    
     },
//切换页面时
    onShow() {
        // 检查是否有缓存的用户信息
        const userInfo = wx.getStorageSync('userInfo')
        console.log("切换页面后userInfo：",userInfo);
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
              url: `${config.baseUrl}/getOpenId`,  // 使用 config.baseUrl
           
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
                    user_role: result.data.user_role || 'student',// 默认为学生角色
                    openid: result.data.openid,
                    user_identifier:result.data.user_identifier,
                    gender: result.data.gender,
                    email: result.data.email,

                  }
                  // 输出 userData 到控制台
                  console.log('用户数据:', userData);
                  // 更新状态
                  this.setData(userData);

                  // 保存到本地存储
                  wx.setStorageSync('userInfo', userData);
                  console.log("本地存储的信息", userData);
                  // 判断 user_id 是否为 -1
                  if (userData.user_id === -1) {
                     //将返回的openid存储到本地
                    wx.setStorageSync('openid', result.data.openid);
                    console.log("openid已经保存到本地", result.data.openid);
                    // 跳转到登录页面，这里假设登录页面路径为 /pages/login/login
                    wx.navigateTo({
                      url: '/pages/login/login'
                    });
                    return;
                  }

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
                  title: '网络错误或者服务器异常',
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
    //保存openid到本地存储先
     // 保存到本地存储
     wx.setStorageSync('openid', this.data.openid);
    // 清除用户信息
    this.setData({
      user_id: null,
    user_name: '',
    user_role: '',
    openid: "",
    user_identifier:"",
    gender:"",
    email:"",

    })
    // 清除存储
    wx.removeStorageSync('userInfo')
    wx.showToast({
      title: '已退出登录'
    })

  },


 goToForum: function() {
  wx.navigateTo({
    url: '/pages/forum/forum', // 替换为你的论坛页面路径
  });
},
  goToStudentProfile() {
    wx.navigateTo({
      url: '/pages/student_profile/student_profile'
    })
  },

  goToTeacherProfile() {
    console.log("Before navigation attempt");
wx.navigateTo({
  url: '/pages/teacher_profile/teacher_profile'
});
console.log("After navigation attempt");
  },

  // 分享给好友
  onShareAppMessage() {
    return {
      title: 'AI教学助手',
      path: `/pages/index/index`, // 替换为实际的页面路径
      desc: '这里有智能答疑、个性化学习等多种学习功能哦！'
    };
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: 'AI教学助手',
      path: `/pages/index/index`  // 替换为实际的页面路径
    };
  },
  previewQrCode: function () {
    wx.previewImage({
      current: 'qrcode.png', // 当前显示图片的路径
      urls: ['qrcode.png'] // 需要预览的图片路径列表
    });
  },
  // 处理收藏操作
  handleCollect() {
    const { isCollected } = this.data;
    const currentPagePath = this.route;
    let collectedPages = wx.getStorageSync('collectedPages') || [];

    if (isCollected) {
      // 取消收藏
      const index = collectedPages.indexOf(currentPagePath);
      if (index > -1) {
        collectedPages.splice(index, 1);
        wx.showToast({
          title: '已取消收藏',
          icon: 'success'
        });
      }
    } else {
      // 收藏
      collectedPages.push(currentPagePath);
      wx.showToast({
        title: '收藏成功',
        icon: 'success'
      });
    }

    // 更新本地存储
    wx.setStorageSync('collectedPages', collectedPages);
    // 更新页面状态
    this.setData({
      isCollected: !isCollected
    });
  }
})