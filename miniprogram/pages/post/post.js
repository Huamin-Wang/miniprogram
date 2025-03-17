// pages/post/post.js
const api = require('../../utils/api/api.js');

Page({
  data: {
    postId: '',
    postTitle: '',
    postContent: '',
    postTimestamp: '',
    postImageUrl: '',
    replies: [],
    replyContent: ''
  },

  onLoad: function(options) {
    if (options.id) {
      this.setData({
        postId: options.id
      });
      this.loadPostDetail(options.id);
    }
  },

  loadPostDetail: async function(postId) {
    try {
      const { content } = await api.getFileContent();
      const post = content.find(p => p.id === postId);
      
      if (!post) {
        wx.showToast({
          title: '帖子不存在',
          icon: 'none'
        });
        return;
      }

      // Format the post timestamp
      const formattedTime = this.formatTime(post.timestamp);

      // Format reply timestamps and prepare reaction data
      const formattedReplies = post.replies.map(reply => ({
        ...reply,
        formattedTime: this.formatTime(reply.timestamp),
        likes: reply.likes || 0,
        dislikes: reply.dislikes || 0
      }));

      this.setData({
        postTitle: post.title,
        postContent: post.content,
        postTimestamp: formattedTime,
        replies: formattedReplies
      });

      // Load image if available
      if (post.uniqueFilename) {
        this.loadPostImage(post.uniqueFilename);
      }
    } catch (error) {
      console.error('Error loading post details:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  },

loadPostImage: async function(uniqueFilename) {
  try {
    const imageUrl = `${api.imageBaseUrl}${uniqueFilename}`;
    this.setData({
      postImageUrl: imageUrl
    });
  } catch (error) {
    console.error('Error loading image:', error);
  }
},

  onReplyInput: function(e) {
    this.setData({
      replyContent: e.detail.value
    });
  },

  submitReply: async function(e) {
    const content = this.data.replyContent;
    if (!content.trim()) {
      wx.showToast({
        title: '请输入评论内容',
        icon: 'none'
      });
      return;
    }

    try {
      // Show loading toast
      wx.showLoading({
        title: '发送中...',
      });

      // Create new reply
      const newReply = {
        content: content.trim(),
        timestamp: new Date().toISOString(),
        likes: 0,
        dislikes: 0
      };

      // Get current data
      let { sha, content: fileContent } = await api.getFileContent();
      const postIndex = fileContent.findIndex(p => p.id === this.data.postId);
      
      if (postIndex === -1) {
        wx.hideLoading();
        wx.showToast({
          title: '帖子不存在',
          icon: 'none'
        });
        return;
      }

      // Add reply to post
      fileContent[postIndex].replies.push(newReply);
      
      // Update file content
      await api.updateFileContent(fileContent, sha);
      
      // Hide loading
      wx.hideLoading();
      
      // Show success message
      wx.showToast({
        title: '评论成功',
        icon: 'success'
      });
      
      // Clear input and refresh post
      this.setData({
        replyContent: ''
      });
      
      this.loadPostDetail(this.data.postId);
    } catch (error) {
      wx.hideLoading();
      console.error('Error submitting reply:', error);
      wx.showToast({
        title: '评论失败',
        icon: 'none'
      });
    }
  },

  handleLike: async function(e) {
    const index = e.currentTarget.dataset.index;
    await this.handleReaction(index, 'like');
  },

  handleDislike: async function(e) {
    const index = e.currentTarget.dataset.index;
    await this.handleReaction(index, 'dislike');
  },

  handleReaction: async function(index, type) {
    try {
      wx.showLoading({
        title: '处理中...',
      });

      let { sha, content: fileContent } = await api.getFileContent();
      const postIndex = fileContent.findIndex(p => p.id === this.data.postId);
      
      if (postIndex === -1) {
        wx.hideLoading();
        wx.showToast({
          title: '帖子不存在',
          icon: 'none'
        });
        return;
      }

      const reply = fileContent[postIndex].replies[index];
      
      // Handle like/dislike logic
      if (type === 'like') {
        reply.likes = (reply.likes || 0) + 1;
      } else {
        reply.dislikes = (reply.dislikes || 0) + 1;
      }

      // Update file content
      await api.updateFileContent(fileContent, sha);
      
      wx.hideLoading();
      
      // Refresh data
      this.loadPostDetail(this.data.postId);
      
    } catch (error) {
      wx.hideLoading();
      console.error(`Error handling ${type}:`, error);
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      });
    }
  },

  formatTime: function(timestamp) {
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${this.padZero(date.getMonth() + 1)}-${this.padZero(date.getDate())} ${this.padZero(date.getHours())}:${this.padZero(date.getMinutes())}`;
  },

  padZero: function(num) {
    return num < 10 ? '0' + num : num;
  },

  onPullDownRefresh: function() {
    this.loadPostDetail(this.data.postId);
    wx.stopPullDownRefresh();
  }
})