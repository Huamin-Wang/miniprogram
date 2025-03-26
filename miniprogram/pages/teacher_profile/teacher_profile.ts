// miniprogram/pages/teacher_profile/teacher_profile.js
Page({
  data: {
    selectedMenu: 'pending',
    isLoading: true
  },

  onLoad: function() {
    // Simulate loading
    setTimeout(() => {
      this.setData({
        isLoading: false
      });
    }, 1000);
  },

  // Handle tab selection
  selectMenu: function(e) {
    const menu = e.currentTarget.dataset.menu;
    this.setData({
      selectedMenu: menu
    });
  },

  // Copy website URL to clipboard
  copyUrl: function() {
    wx.setClipboardData({
      data: 'https://www.001ai.top',
      success: function() {
        wx.showToast({
          title: '网址已复制',
          icon: 'success',
          duration: 2000
        });
      }
    });
  },


// Return to home page
goBack: function() {
  wx.showModal({
    title: '提示',
    content: '返回体验学生端界面？',
    success: (res) => {
      if (res.confirm) {
        wx.navigateTo({
      url: '/pages/student_profile/student_profile'
    });
      }
    }
  });
}
});