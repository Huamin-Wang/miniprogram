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

      // Sort posts by timestamp, newest first
      content.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      const posts = content.map(post => ({
        id: post.id,
        title: post.title,
        formattedTime: this.formatTime(post.timestamp),
        hasImage: !!post.uniqueFilename,
        imageThumbnail: post.uniqueFilename ? `${api.imageBaseUrl}${post.uniqueFilename}` : ''
      }));

      this.setData({
        posts,
        isLoading: false
      });
    } catch (error) {
      console.error('Error loading posts:', error);
      this.setData({ isLoading: false });
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      });
    }
  },

  navigateToPost: function(e) {
    const postId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/post/post?id=${postId}`
    });
  },

  showPostForm: function() {
    this.setData({
      isFormVisible: true,
      tempImageUrl: '',
      tempFilePath: ''
    });
  },

  chooseImage: function() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        this.setData({
          tempImageUrl: tempFilePath,
          tempFilePath: tempFilePath
        });
      }
    });
  },

  submitPost: async function(e) {
    const { title, content } = e.detail.value;

    // Form validation
    if (!title.trim() || !content.trim()) {
      wx.showToast({
        title: '标题和内容不能为空',
        icon: 'none'
      });
      return;
    }

    // Show loading
    this.setData({ isLoading: true });
    wx.showLoading({ title: '发布中...' });

    try {
      const newPost = {
        id: this.generateUniqueId(),
        title,
        content,
        timestamp: new Date().toISOString(),
        replies: []
      };

      // Upload image if selected
      if (this.data.tempFilePath) {
        try {
          const uniqueFilename = await this.uploadImage(this.data.tempFilePath);
          newPost.uniqueFilename = uniqueFilename;
        } catch (imageError) {
          console.error('Image upload failed:', imageError);
          wx.showToast({
            title: '图片上传失败，但帖子会继续发布',
            icon: 'none'
          });
        }
      }

      // Get current data
      const { sha, content: fileContent } = await api.getFileContent();

      // Add new post
      fileContent.push(newPost);

      // Update file
      await api.updateFileContent(fileContent, sha);

      // Reset form and hide it
      this.setData({
        isFormVisible: false,
        tempImageUrl: '',
        tempFilePath: '',
        isLoading: false
      });

      // Show success and refresh
      wx.hideLoading();
      wx.showToast({
        title: '发布成功',
        icon: 'success'
      });

      this.loadPosts();
    } catch (error) {
      console.error('Error submitting post:', error);
      wx.hideLoading();
      wx.showToast({
        title: '发布失败: ' + error.message,
        icon: 'none',
        duration: 3000
      });
      this.setData({ isLoading: false });
    }
  },

  uploadImage: async function(filePath) {
    const fileExtension = filePath.split('.').pop();
    const uniqueFilename = `image_${Date.now()}_${Math.floor(Math.random() * 10000)}.${fileExtension}`;

    try {
      // Read file as base64
      const fileContent = wx.getFileSystemManager().readFileSync(filePath, 'base64');

      // Upload via API
      await api.uploadImage(fileContent, uniqueFilename);
      return uniqueFilename;
    } catch (error) {
      console.error('Image upload error:', error);
      throw new Error('图片上传失败');
    }
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
  }
})