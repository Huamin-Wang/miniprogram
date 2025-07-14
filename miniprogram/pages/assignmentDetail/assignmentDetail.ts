const config = require('../../utils/config');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        assignmentDetail: {}, // 改为对象
        submission: {}
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad() {
        const assignmentId = this.options?.assignment_id;
        if (!assignmentId) {
            wx.showToast({
                title: '作业ID缺失',
                icon: 'none'
            });
            return;
        }
        const userData = wx.getStorageSync<UserInfo>('userInfo');
        if (!userData?.openid) {
            wx.showToast({
                title: '用户信息缺失',
                icon: 'none'
            });
            return;
        }
        wx.request({
            url: `${config.baseUrl}/getAssignmentById/${assignmentId}?openid=${userData.openid}`,
            method: 'GET',
            success: (res) => {
                const {success, assignmentInfo, submission} = res.data;
                if (success) {
                    this.setData({
                        assignmentDetail: assignmentInfo,
                        submission: submission || {}
                    });
                } else {
                    wx.showToast({
                        title: '获取作业详情失败',
                        icon: 'none'
                    });
                }
            },
            fail: () => {
                wx.showToast({
                    title: '网络错误，请稍后再试',
                    icon: 'none'
                });
            }
        });
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

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

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})