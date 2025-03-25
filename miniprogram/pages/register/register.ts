// pages/register/register.ts
// pages/Stu_info_edit/Stu_info_edit.ts
const config = require('../../utils/config')
Page({
  data: {
      roles: ["学生", "教师"],
      roleValues: ["student", "teacher"],
      role: "",
      genders: ["男", "女"],
      genderValues: ["男","女"],
      gender: "",
      current_userInfo: {
          user_identifier: "",
          user_role: "",
          user_name: "",
          gender: "",
          email: "",
          password: "",
          openid: "",
      }
    },
  
  onReady() {
        this.setData({
            showPrivacyNotice: false
        });
    },
  togglePrivacyNotice() {
        this.setData({
            showPrivacyNotice: !this.data.showPrivacyNotice
        });
    },
    onPrivacyChange(e) {
    this.setData({
        privacyAgreed: e.detail.value.length > 0
    });
},
    /**
     * 生命周期函数--监听页面加载
     */
  // 在页面加载时尝试从本地存储的 userInfo 中获取 openid
  onLoad() {
      const userInfo = wx.getStorageSync('userInfo');
        this.data.current_userInfo.openid = userInfo.openid;
      if (userInfo && userInfo.openid) {
          this.setData({
              openid: userInfo.openid
          });
      }
  },
  
    /**
     * 生命周期函数--监听页面初次渲染完成
     */

  
    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
  
    },
  
    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {
  
    },
  
    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {
  
    },
  
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {
  
    },
  
    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {
  
    },
   onRoleChange: function(e) {
      this.setData({
        role: this.data.roles[e.detail.value],
        'current_userInfo.user_role': this.data.roleValues[e.detail.value],
      });
    },

    onGenderChange: function(e) {
  this.setData({
    gender: this.data.genders[e.detail.value],
    'current_userInfo.gender': this.data.genderValues[e.detail.value]
  });
},
    // 处理学号/教工号输入事件
    onIdentifierInput(e) {
        this.setData({
            'current_userInfo.user_identifier': e.detail.value
        });
    },
    // 处理密码输入事件
    onPasswordInput(e) {
        this.setData({
            'current_userInfo.password': e.detail.value
        });
    },
    //处理确认密码输入事件
    onConfirmPasswordInput(e) {
        this.setData({
            'current_userInfo.confirm_password': e.detail.value
        });
    // 检查密码是否一致
        if (this.data.current_userInfo.password !== e.detail.value) {
            wx.showToast({
                title: '两次输入的密码不一致',
                icon: 'none'
            });
            return;
        }
    },
    // 处理姓名输入事件
    onNameInput(e) {
        this.setData({
            'current_userInfo.user_name': e.detail.value
        });
    },
    // 处理邮箱输入事件
    onEmailInput(e) {
        this.setData({
            'current_userInfo.email': e.detail.value
        });
    },
    // 处理角色选择事件输入时间
    onRoleInput(e) {
        this.setData({
            'current_userInfo.user_role': e.detail.value
        });
    },
    // 处理性别选择事件输入时间
    onGenderInput(e) {
        this.setData({
            "current_userInfo.gender": e.detail.value
        });
    },



onRegister: function() {
    const { user_identifier, user_role, user_name, gender, email, password } = this.data.current_userInfo;
   //从本地获取openid
     const openid = wx.getStorageSync('openid');
     this.data.openid = openid;

    //验证学号/教工号、密码、姓名、角色、性别和邮箱是否为空
    if (!user_identifier || !password || !user_name || !user_role || !gender || !email) {
        wx.showToast({
            title: '所有字段均不能为空',
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
            console.log(this.data.current_userInfo);

    // 发送数据到后端进行注册
    wx.request({
        url: `${config.baseUrl}/miniRegister`,  // 使用 config.baseUrl
        method: 'POST',
        header: {
            'Content-Type': 'application/json'
        },
      data: {
          user_identifier: this.data.current_userInfo.user_identifier,
          password: this.data.current_userInfo.password,
          openid: this.data.current_userInfo.openid,
          user_name: this.data.current_userInfo.user_name,
          user_role: this.data.current_userInfo.user_role,
          gender: this.data.current_userInfo.gender,
          email: this.data.current_userInfo.email
      },

        success: (res) => {
            if (res.data.success) {
                wx.showToast({
                    title: '注册成功',
                    icon: 'success'
                });
                // 更新本地存储的用户信息
                wx.setStorageSync('userInfo', {
                    ...wx.getStorageSync('userInfo'),
                    user_id: res.data.user_id,
                    user_name: res.data.user_name,
                    user_role: res.data.user_role,
                    user_identifier: res.data.user_identifier,
                    gender: res.data.gender,
                    email: res.data.email,
                    openid: res.data.openid
                });
    console.log("userInfo",wx.getStorageSync('userInfo'))
                // 登录成功后进行页面跳转
                wx.navigateTo({
                    url: `/pages/index/index`
                });
            } else {
                wx.showToast({
                    title: '注册失败或者用户已存在，请检查信息或联系管理员',
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
},
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {
  
    }
  })