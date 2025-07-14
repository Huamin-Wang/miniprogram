const config = require('../../utils/config');

// 定义 UserInfo 类型
interface UserInfo {
  user_id: string;
  user_name: string;
  user_role: string;
  openid: string;
  user_identifier: string;
  gender: string;
}

// 定义 Course 类型
interface Course {
  course_id: string;
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

// 日期格式化函数
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

Page<{
  user_id: string;
  user_name: string;
  user_role: string;
  openid: string;
  gender: string;
  courses: Course[];
  assignments_to_do: Assignment[];
  assignments: Assignment[];
  isLoading: boolean;
  selectedMenu: string;
  user_identifier: string;
}>({
  data: {
    user_id: '',
    user_identifier: '',
    user_name: '',
    user_role: '',
    openid: '',
    gender:"",
    courses: [],
    assignments_to_do: [],
    assignments: [],
    isLoading: true,
    selectedMenu: 'pending' // 默认显示待完成作业
  },


  onLoad(): void {
    const userData = wx.getStorageSync<UserInfo>('userInfo');
    if (userData) {
      const { user_id, user_name, user_role, openid, user_identifier,gender } = userData;
      console.log('接收到的用户ID:', user_id);
      console.log('接收到的用户名:', user_name);
      console.log('接收到的用户角色:', user_role);
      console.log('接收到的用户openid:', openid);
      this.setData({
        user_id,
        user_name,
        user_role,
        openid,
        user_identifier,
        gender
      });
      if (user_role === 'student') {
        // 并行请求课程和作业数据
        Promise.all([
          new Promise((resolve) => {
            this.getStudentCourses(resolve);
          }),
          new Promise((resolve) => {
            this.getStudentAssignmentsData(resolve);
          })
        ]).then(() => {
          this.setData({ isLoading: false });
        });
      } else {
        // 教师端逻辑，根据需求可添加其他数据加载逻辑
        this.setData({ isLoading: false });
      }
    } else {
      console.log('未获取到用户数据');
      this.setData({ isLoading: false });
    }
  },
    goToEditProfile: function() {
    wx.navigateTo({
      url: '/pages/Stu_info_edit/Stu_info_edit'
    });
  },
  getStudentCourses(callback?: Function): void {
    const { openid } = this.data;
    wx.request<ResponseData>({
      url: `${config.baseUrl}/getStudentCourses?openid=${openid}`,
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
      },
      complete: () => {
        callback && callback();
      }
    });
  },
 goToAssignmentDetail(e: WechatMiniprogram.TouchEvent): void {
   const assignment_id = e.currentTarget.dataset.assignment_id as string;
   if (assignment_id) {
     const encodedAssignmentId = encodeURIComponent(assignment_id);
     console.log("作业id", encodedAssignmentId);
     wx.navigateTo({
       url: `/pages/assignmentDetail/assignmentDetail?assignment_id=${encodedAssignmentId}`
     });
   } else {
     console.error('作业 ID 为空，无法跳转');
   }
 },
  getStudentAssignmentsData(callback?: Function): void {
    const { openid } = this.data;
    wx.request<ResponseData>({
      url: `${config.baseUrl}/getStudentAssignments?openid=${openid}`,
      method: 'GET',
      success: (res) => {
        if (res.data) {
          const formattedAssignmentsToDo = res.data.assignments_to_do.map((assignment) => {
            return {
              ...assignment,
              deadline: formatDate(assignment.deadline)
            };
          });
          const formattedAssignments = res.data.assignments.map((assignment) => {
            return {
              ...assignment,
              deadline: formatDate(assignment.deadline)
            };
          });
          this.setData({
            assignments_to_do: formattedAssignmentsToDo,
            assignments: formattedAssignments
          });
        } else {
          console.log('获取数据失败:', res.data);
        }
      },
      fail: (err) => {
        console.log('请求失败:', err);
      },
      complete: () => {
        callback && callback();
      }
    });
  },
  // 判断截止日期是否临近（3天内）
  isDeadlineSoon(deadlineStr: string): boolean {
    const deadline = new Date(deadlineStr);
    const now = new Date();
    const diffInDays = Math.floor((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffInDays <= 3 && diffInDays >= 0;
  },
  // 菜单切换
 selectMenu(e: WechatMiniprogram.TouchEvent): void {
   const menu = e.currentTarget.dataset.menu as string;
   this.setData({
     selectedMenu: menu
   });

   // Ensure the layout remains consistent when switching tabs
   wx.pageScrollTo({
     scrollTop: 0,
     duration: 300 // Slightly smoother transition
   });
 },
  copyUrl(): void {
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
      const encodedCourseId = encodeURIComponent(course_id);
      console.log("课程id", encodedCourseId);
      wx.navigateTo({
        url: `/pages/courseDetail/courseDetail?course_id=${encodedCourseId}`
      });
    } else {
      console.error('课程 ID 为空，无法跳转');
    }
  },
  // goToAssignmentDetail(e: WechatMiniprogram.TouchEvent): void {
  //   const assignment_id = e.currentTarget.dataset.assignment_id as string;
  //   if (assignment_id) {
  //     const encodedAssignmentId = encodeURIComponent(assignment_id);
  //     console.log("作业id", encodedAssignmentId);
  //     wx.navigateTo({
  //       url: `/pages/assignmentDetail/assignmentDetail?assignment_id=${encodedAssignmentId}`
  //     });
  //   } else {
  //     console.error('作业 ID 为空，无法跳转');
  //   }
  // }

});
