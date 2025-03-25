// pages/Stu_info_edit/Stu_info_edit.ts
Page({
data: {
    roles: ["学生", "教师"],
    roleValues: ["student", "teacher"],
    role: "",
    genders: ["男", "女"],
    genderValues: ["male","female"],
    gender: "",
  },



  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {

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
 onRoleChange: function(e) {
    this.setData({
      role: this.data.roleValues[e.detail.value]
    });
  },
onGenderChange: function(e) {
  this.setData({
    gender: this.data.genderValues[e.detail.value]
  });
},
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})