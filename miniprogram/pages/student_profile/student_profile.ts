// 定义 UserInfo 类型
interface UserInfo {
  user_id: string;
  user_name: string;
  user_role: string;
  openid:string
}

// 定义 Course 类型
interface Course {
  course_id: string;
  // 可以根据实际情况添加更多课程相关的属性
  course_name?: string;
  description?: string;
  teacher?: string;
}

// 定义 ResponseData 类型
interface ResponseData {
  success: boolean;
  courses: Course[];
}

Page<{
  user_id: string;
  user_name: string;
  user_role: string;
  openid: '', // 这里添加 openid 到 data 初始值
  courses: Course[];
}>({
  data: {
    user_id: '',
    user_name: '',
    user_role: '',
    courses: []
  },
  onLoad(): void {
    const userData = wx.getStorageSync<UserInfo>('userInfo');
    if (userData) {
      const { user_id, user_name, user_role,openid } = userData;
      console.log('接收到的用户ID:', user_id);
      console.log('接收到的用户名:', user_name);
      console.log('接收到的用户角色:', user_role);
      console.log('接收到的用户openid:', openid);
      this.setData({
        user_id,
        user_name,
        user_role,
        openid
      });
      if (user_role ==='student') {
        this.getStudentCourses();
      }
    } else {
      console.log('未获取到用户数据');
    }
  },
  getStudentCourses(): void {
    const { openid } = this.data;
    wx.request<ResponseData>({
      url: `http://192.168.8.173/getStudentCourses?openid=${openid}`, // 替换为实际的后端接口地址
      method: 'GET',
      success: (res) => {
        if (res.data.success) {
          this.setData({
            courses: res.data.courses
          });
        } else {
          console.log('获取课程信息失败:', res.data);
        }
      },
      fail: (err) => {
        console.log('请求失败:', err);
      }
    });
  },
  goToCourseDetail(e: WechatMiniprogram.TouchEvent): void {
    const course_id = e.currentTarget.dataset.course_id as string;
    if (course_id) {
      // 处理可能的特殊字符
      const encodedCourseId = encodeURIComponent(course_id);
      console.log("课程id", encodedCourseId);
      wx.navigateTo({
        url: `/pages/courseDetail/courseDetail?course_id=${encodedCourseId}`
      });
    } else {
      console.error('课程 ID 为空，无法跳转');
    }
  }
});