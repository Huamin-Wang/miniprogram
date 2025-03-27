// pages/Stu_info_edit/Stu_info_edit.ts
const config = require('../../utils/config')

Page({
    data: {
        roles: ["学生", "教师"],
        roleValues: ["student", "teacher"],
        role: "",
        genders: ["男", "女"],
        genderValues: ["男", "女"],
        gender: "",
        confirmPassword: "",
        isConfirmPasswordValid: true,
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

    onLoad() {
        const userInfo = wx.getStorageSync('userInfo');
        if (userInfo) {
            this.setData({
                role: userInfo.user_role || '',
                gender: userInfo.gender || '',
                current_userInfo: {
                    user_identifier: userInfo.user_identifier || '',
                    user_role: userInfo.user_role || '',
                    user_name: userInfo.user_name || '',
                    gender: userInfo.gender || '',
                    email: userInfo.email || '',
                    password: userInfo.password || '',
                    openid: userInfo.openid || ''
                }
            });
        }
    },

    onReady() {
    },
    onShow() {
    },
    onHide() {
    },
    onUnload() {
    },
    onPullDownRefresh() {
    },
    onReachBottom() {
    },
    onShareAppMessage() {
    },

    onRoleChange(e) {
        this.setData({
            role: this.data.roles[e.detail.value],
            'current_userInfo.user_role': this.data.roleValues[e.detail.value]
        });
    },

    onGenderChange(e) {
        this.setData({
            gender: this.data.genders[e.detail.value],
            'current_userInfo.gender': this.data.genderValues[e.detail.value]
        });
    },

    onIdentifierInput(e) {
        this.setData({
            'current_userInfo.user_identifier': e.detail.value
        });

    },

    onPasswordInput(e) {
        this.setData({
            'current_userInfo.password': e.detail.value
        });
    },
    onConfirmPasswordInput(e) {
        this.setData({
            confirmPassword: e.detail.value
        });
    },

    ConfirmPasswordValid() {
        if (this.data.current_userInfo.password !== this.data.confirmPassword) {
            wx.showToast({
                title: '两次输入的密码不一致',
                icon: 'none',
                duration: 3000
            });
            this.data.isConfirmPasswordValid = false;
            return;
        }
        this.data.isConfirmPasswordValid = true;
    },

    onNameInput(e) {
        this.setData({
            'current_userInfo.user_name': e.detail.value
        });

    },

    onEmailInput(e) {
        this.setData({
            'current_userInfo.email': e.detail.value
        });
    },

    onEdit() {
        //验证两次输入的密码是否一致，不一致则不提交
        this.ConfirmPasswordValid()
        if (!this.data.isConfirmPasswordValid) {
            return;
        }

        const {user_identifier, user_role, user_name, gender, email, password, openid} = this.data.current_userInfo;
        //验证学号/教工号、密码、姓名、角色、性别和邮箱是否为空
        if (!user_identifier || !password || !user_name || !user_role || !gender || !email) {
            wx.showToast({
                title: '所有字段均不能为空',
                icon: 'none'
            });
            return;
        }
        if (!openid) {
            wx.showToast({
                title: '未获取到 openid，请重新进入页面',
                icon: 'none'
            });
            return;
        }
        wx.showToast({
            title: '正在修改个人资料',
            icon: 'loading',
            duration: 2000
        })
        wx.request({
            url: `${config.baseUrl}/miniEdit`,
            method: 'POST',
            header: {
                'Content-Type': 'application/json'
            },
            data: {
                user_identifier,
                password,
                openid,
                user_name,
                user_role,
                gender,
                email
            },
            success: (res) => {
                if (res.data.success) {
                    wx.showToast({
                        title: '修改成功',
                        icon: 'success'
                    });

                    wx.setStorageSync('userInfo', {
                        ...wx.getStorageSync('userInfo'),
                        user_name: res.data.user_name,
                        user_role: res.data.user_role,
                        user_identifier: res.data.user_identifier,
                        gender: res.data.gender,
                        email: res.data.email
                    });

                    wx.navigateTo({
                        url: '/pages/index/index'
                    });
                } else {
                    wx.showToast({
                        title: '修改失败，请检查信息或联系管理员',
                        icon: 'none'
                    });
                }
            },
            fail: () => {
                wx.showToast({
                    title: '网络错误或者服务器未启动',
                    icon: 'none'
                });
            }
        });
    }
})