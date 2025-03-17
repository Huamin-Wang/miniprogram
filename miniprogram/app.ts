interface IAppOption {
  globalData: {
    [key: string]: any;
  };
  onLaunch?(): void;
  onShow?(): void;
  onHide?(): void;
  onError?(): void;
}

App<IAppOption>({
  globalData: {
    owner: "wang_hua_min",
    repo: "we-chat-data",
    imgs_repo: "bbs_images",
    path: "data/forumData.json",
    token: "4918bb3947dbf1402d7331a65bab1b3e",
    image_folder: "images"
  },
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || [];
    logs.unshift(Date.now());
    wx.setStorageSync('logs', logs);

    // 登录
    wx.login({
      success: (res) => {
        console.log(res.code);
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      },
    });

    // 获取用户信息
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success: (res) => {
              this.globalData.userInfo = res.userInfo;
            },
          });
        }
      },
    });
  },
});