// pages/post/post.js
const api = require('../../utils/api/api.js');

Page({
  data: {
    postId: '',
    postTitle: '',
    postContent: '',
    postImageUrl: '',
    postTimestamp: '',
    replies: [],
    isLoading: false
  },

  onLoad: function(options) {
    if (options.id) {
      this.setData({ postId: options.id });
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
          icon: 'none',
          duration: 2000
        });
        setTimeout(() => {
          wx.navigateBack();
        }, 2000);
        return;
      }

      this.setData({
        postTitle: post.title,
        postContent: post.content,
        postTimestamp: this.formatTime(post.timestamp)
      });

      if (post.uniqueFilename) {
        await this.loadPostImage(post.uniqueFilename);
      }

      // Format replies
      const formattedReplies = post.replies ? post.replies.map(reply => ({
        ...reply,
        formattedTime: this.formatTime(reply.timestamp)
      })) : [];

      this.setData({ replies: formattedReplies });
    } catch (error) {
      console.error('Error loading post:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  },

  loadPostImage: async function(uniqueFilename) {
    try {
      const imagePath = `https://gitee.com/api/v5/repos/${api.owner}/${api.imgs_repo}/contents/${api.image_folder}/${uniqueFilename}`;
      const imageUrl = await api.fetchImage(imagePath);
      this.setData({ postImageUrl: imageUrl });
    } catch (error) {
      console.error('Error loading image:', error);
    }
  },

  submitReply: async function(e) {
    const content = e.detail.value.content;
    if (!content.trim()) return;

    this.setData({ isLoading: true });

    try {
      const userIP = await api.getUserIP();
      const newReply = {
        content,
        timestamp: new Date().toISOString(),
        likes: 0,
        dislikes: 0,
        likedIPs: [],
        dislikedIPs: []
      };

      let { sha, content: fileContent } = await api.getFileContent();
      const post = fileContent.find(p => p.id === this.data.postId);

      if (!post.replies) post.replies = [];
      post.replies.push(newReply);
      await api.updateFileContent(fileContent, sha);

      // Refresh post details
      this.loadPostDetail(this.data.postId);
      
      wx.showToast({
        title: '回复成功',
        icon: 'success'
      });
    } catch (error) {
      console.error('Error submitting reply:', error);
      wx.showToast({
        title: '回复失败',
        icon: 'none'
      });
    } finally {
      this.setData({ isLoading: false });
    }
  },

  handleLike: async function(e) {
    const index = e.currentTarget.dataset.index;
    await this.handleReaction(index, 'likes');
  },

  handleDislike: async function(e) {
    const index = e.currentTarget.dataset.index;
    await this.handleReaction(index, 'dislikes');
  },

  handleReaction: async function(index, type) {
    try {
      const userIP = await api.getUserIP();
      let { sha, content: fileContent } = await api.getFileContent();
      const post = fileContent.find(p => p.id === this.data.postId);
      const reply = post.replies[index];
      
      const oppositeType = type === 'likes' ? 'dislikes' : 'likes';
      const ipsKey = type === 'likes' ? 'likedIPs' : 'dislikedIPs';
      const oppositeIpsKey = type === 'likes' ? 'dislikedIPs' : 'likedIPs';

      // Initialize arrays if they don't exist
      if (!reply[ipsKey]) reply[ipsKey] = [];
      if (!reply[oppositeIpsKey]) reply[oppositeIpsKey] = [];

      // Check if already reacted
      if (reply[ipsKey].includes(userIP)) {
        // Toggle off current reaction
        reply[type] = Math.max(0, (reply[type] || 0) - 1);
        reply[ipsKey] = reply[ipsKey].filter(ip => ip !== userIP);
      } else {
        // Add new reaction
        reply[type] = (reply[type] || 0) + 1;
        reply[ipsKey].push(userIP);
        
        // Remove opposite reaction if exists
        if (reply[oppositeIpsKey].includes(userIP)) {
          reply[oppositeType] = Math.max(0, (reply[oppositeType] || 0) - 1);
          reply[oppositeIpsKey] = reply[oppositeIpsKey].filter(ip => ip !== userIP);
        }
      }
      
      await api.updateFileContent(fileContent, sha);
      this.loadPostDetail(this.data.postId);
    } catch (error) {
      console.error('Error handling reaction:', error);
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