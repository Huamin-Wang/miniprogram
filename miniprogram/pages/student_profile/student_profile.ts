const config = require('../../utils/config')

// 定义 UserInfo 类型
interface UserInfo {
  user_id: string;
  user_name: string;
  user_role: string;
  openid: string;
}

// 定义 Course 类型
interface Course {
  course_id: string;
  // 可以根据实际情况添加更多课程相关的属性
  course_name?: string;
  description?: string;
  teacher?: string;
}

// 定义作业类型
interface Assignment {
  assignment_id: string;
  course_id: string;
  title: string;
  description: string;
  deadline: string;
}

// 定义 ResponseData 类型
interface ResponseData {
  success: boolean;
  courses: Course[];
  assignments: Assignment[];
  assignments_to_do: Assignment[];
}

Page<{
  user_id: string;
  user_name: string;
  user_role: string;
  openid: string;
  courses: Course[];
  assignments_to_do: Assignment[];
  assignments: Assignment[];
}>({
  data: {
    user_id: '',
    user_name: '',
    user_role: '',
    openid: '',
    courses: [],
    assignments_to_do: [],
    assignments: []
  },
  onLoad(): void {
    const userData = wx.getStorageSync<UserInfo>('userInfo');
    if (userData) {
      const { user_id, user_name, user_role, openid } = userData;
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
        this.getStudentAssignmentsData();
      }
    } else {
      console.log('未获取到用户数据');
    }
  },
  getStudentCourses(): void {
    const { openid } = this.data;
    wx.request<ResponseData>({
      url: `${config.baseUrl}/getStudentCourses?openid=${openid}`,// 替换为实际的后端接口地址
      method: 'GET',
      success: (res) => {
        if (res.data.success) {
          this.setData({
            courses: res.data.courses
          });
        } else {
          console.log('获取课程信息失败:', res.data);
          wx.navigateTo({
            url: '/pages/login/login'
          });
        }
      },
      fail: (err) => {
        console.log('请求失败:', err);
      }
    });
  },
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
  },
  getStudentAssignmentsData() {
    const { openid } = this.data;
    wx.request<ResponseData>({
      url: `${config.baseUrl}/getStudentAssignments?openid=${openid}`, // 替换为实际的后端接口地址
      method: 'GET',
      success: (res) => {
        if (res.data) {
          this.setData({
            assignments_to_do: res.data.assignments_to_do,
            assignments: res.data.assignments
          });
        } else {
          console.log('获取数据失败:', res.data);
        }
      },
      fail: (err) => {
        console.log('请求失败:', err);
      }
    });
  }
});    