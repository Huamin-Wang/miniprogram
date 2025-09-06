Page({
  data: {},

  // 打开外部链接
  openUrl(e) {
    const url = e.currentTarget.dataset.url
    wx.setClipboardData({
      data: url,
      success() {
        wx.showToast({
          title: '已复制链接，请在浏览器中打开',
          icon: 'none'
        })
      }
    })
  },
    // 分享转发功能（建议使用 onShareAppMessage 作为微信小程序标准方法名）
onShareAppMessage() {
  return {
    title: '实用工具大全',
    path: '/pages/share/tools', // 推荐添加 path 字段
    desc: '丰富实用工具，助力学习与生活'
  };
},
     openMiniProgram(e) {
    const appId = e.currentTarget.dataset.appid  // 目标小程序 appid
    const path = e.currentTarget.dataset.path    // 目标小程序页面路径（可选）

    wx.navigateToMiniProgram({
      appId: appId,
      path: path,
      extraData: {   // 可选，传递数据
        from: "我的工具导航"
      },
      envVersion: 'release', // 打开的版本：develop / trial / release
      success(res) {
        console.log("跳转成功", res)
      },
      fail(err) {
        console.error("跳转失败", err)
      }
    })
  }
})
