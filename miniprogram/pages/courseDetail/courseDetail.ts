// pages/courseDetail/courseDetail.js
Page({
  data: {
    course_id: null,
    courseInfo: {},
    score:-1,
    openid:""
  },
  onLoad: function (options) {
    // 从 options 对象中获取传递过来的 course_id 参数
    const course_id = options.course_id;
    if (course_id) {
      // 将获取到的 course_id 存储到页面的 data 中
      this.setData({
        course_id: course_id
      });
          // 从本地存储中获取 openid
          const userInfo = wx.getStorageSync('userInfo');
          if (userInfo && userInfo.openid) {
            this.setData({
              openid: userInfo.openid
            });
          }
      // 可以根据 course_id 调用接口获取课程详情信息
      console.log("详情页接收到的课程id",course_id)
      this.getCourseDetail(course_id);
    } else {
      console.error('未接收到课程 ID');
    }
  },
  getCourseDetail: function (course_id) {
    const { openid } = this.data;
    wx.request({
      url: `http://192.168.8.173/getCourseById/${course_id}?openid=${openid}`, 
      method: 'GET',
      success: (res) => {
        if (res.data.success) {
          this.setData({
            courseInfo: res.data.courseInfo,
            score:res.data.score
          });
          console.log("课程详情：",res.data.courseInfo);
          console.log("分数：",res.data.score)
        } else {
          console.error('获取课程详情失败:', res.data.message);
        }
      },
      fail: (err) => {
        console.error('请求失败:', err);
      }
    });
  }
});