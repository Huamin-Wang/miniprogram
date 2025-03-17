// pages/forum/forum.js
const api = require('../../utils/api/api.js');

Page({
  data: {
    posts: [],
    isFormVisible: false,
    tempImageUrl: '',
    tempFilePath: '',
    isLoading: false
  },

  onLoad: function() {
    this.loadPosts();
  },

  onPullDownRefresh: function() {
    this.loadPosts();
    wx.stopPullDownRefresh();
  },

  loadPosts: async function() {
    this.setData({ isLoading: true });
    try {
      const { content } = await api.getFileContent();
      const sortedPosts = this.sortPostsByLatestReply(content);
      const posts = this.formatPosts(sortedPosts);
      this.setData({ posts, isLoading: false });
    } catch (error) {
      console.error('Error loading posts:', error);
      this.setData({ isLoading: false });
      wx.showToast({ title: '加载失败', icon: 'error' });
    }
  },

  sortPostsByLatestReply: function(posts) {
    return posts.sort((a, b) => {
      const latestReplyA = a.replies.length ? new Date(a.replies[a.replies.length - 1].timestamp) : new Date(a.timestamp);
      const latestReplyB = b.replies.length ? new Date(b.replies[b.replies.length - 1].timestamp) : new Date(b.timestamp);
      return latestReplyB - latestReplyA;
    });
  },

  formatPosts: function(posts) {
    return posts.map(post => ({
      id: post.id,
      title: post.title,
      formattedTime: this.formatTime(post.timestamp),
      hasImage: !!post.uniqueFilename,
      imageThumbnail: post.uniqueFilename ? `${api.imageBaseUrl}${post.uniqueFilename}` : ''
    }));
  },
  // 分享给好友
  onShareAppMessage() {
    return {
      title: '学习吐槽，尽在AI教学助手',
      path: `/pages/forum/forum`, // 替换为实际的页面路径
      desc: '想要和小伙伴们一起讨论学习问题吗？快来这里吧！'
    };
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
     title: '学习吐槽，尽在AI教学助手',
      path: `/pages/forum/forum`, // 替换为实际的页面路径
    };
  },
  navigateToPost: function(e) {
    const postId = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/post/post?id=${postId}` });
  },

  showPostForm: function() {
    this.setData({ isFormVisible: true, tempImageUrl: '', tempFilePath: '' });
  },

  chooseImage: function() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        this.setData({ tempImageUrl: tempFilePath, tempFilePath: tempFilePath });
      }
    });
  },

  submitPost: async function(e) {
    const { title, content } = e.detail.value;
    if (!title.trim() || !content.trim()) {
      wx.showToast({ title: '标题和内容不能为空', icon: 'none' });
      return;
    }

    this.setData({ isLoading: true });
    wx.showLoading({ title: '发布中...' });

    try {
      const newPost = this.createNewPost(title, content);
      if (this.data.tempFilePath) {
        newPost.uniqueFilename = await this.uploadImage(this.data.tempFilePath);
      }

      const { sha, content: fileContent } = await api.getFileContent();
      fileContent.push(newPost);
      await api.updateFileContent(fileContent, sha);

      this.resetForm();
      wx.hideLoading();
      wx.showToast({ title: '发布成功', icon: 'success' });
      this.loadPosts();
    } catch (error) {
      console.error('Error submitting post:', error);
      wx.hideLoading();
      wx.showToast({ title: '发布失败: ' + error.message, icon: 'none', duration: 3000 });
      this.setData({ isLoading: false });
    }
  },

  createNewPost: function(title, content) {
    return {
      id: this.generateUniqueId(),
      title,
      content,
      timestamp: new Date().toISOString(),
      replies: []
    };
  },

  uploadImage: async function(filePath) {
    const fileExtension = filePath.split('.').pop();
    const uniqueFilename = `image_${Date.now()}_${Math.floor(Math.random() * 10000)}.${fileExtension}`;
    const fileContent = wx.getFileSystemManager().readFileSync(filePath, 'base64');
    await api.uploadImage(fileContent, uniqueFilename);
    return uniqueFilename;
  },

  generateUniqueId: function() {
    return '_' + Math.random().toString(36).substr(2, 9);
  },

  formatTime: function(timestamp) {
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${this.padZero(date.getMonth() + 1)}-${this.padZero(date.getDate())} ${this.padZero(date.getHours())}:${this.padZero(date.getMinutes())}`;
  },

  padZero: function(num) {
    return num < 10 ? '0' + num : num;
  },

  resetForm: function() {
    this.setData({ isFormVisible: false, tempImageUrl: '', tempFilePath: '', isLoading: false });
  },

  hidePostForm: function() {
    this.resetForm();
  }
});