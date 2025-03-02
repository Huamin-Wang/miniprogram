Page({
  data: {
    user_id: null,
    user_name: '',
    user_role: '',
    features: [
      { title: '智能答疑', description: '基于大模型的实时问答系统，为学生提供24小时学习支持，快速解答各类学习疑问。' },
      { title: '个性化学习', description: '根据学生的学习进度和掌握情况，提供定制化的学习建议和资源推荐。' },
      { title: '课程管理', description: '教师可以轻松创建和管理课程内容，学生可以便捷地访问学习资料。' },
      { title: '学习分析', description: '通过数据分析，了解学习效果，帮助教师优化教学策略，提升教学质量。' },
      { title: '互动讨论', description: '支持师生在线交流，营造良好的学习氛围，促进知识的共享与创新。' },
      { title: '作业批改', description: '智能辅助批改作业，提供详细的反馈，帮助学生更好地理解和改进。' }
    ]
  },
  onLoad() {
    // 模拟获取用户信息
    this.setData({
      user_id: 1,
      user_name: '张三',
      user_role: 'student'
    });
  },
  logout() {
    // 模拟登出
    this.setData({
      user_id: null,
      user_name: '',
      user_role: ''
    });
  },
  goToStudentProfile() {
    wx.navigateTo({
      url: '/pages/student_profile/student_profile'
    });
  },
  goToTeacherProfile() {
    wx.navigateTo({
      url: '/pages/teacher_profile/teacher_profile'
    });
  }
});