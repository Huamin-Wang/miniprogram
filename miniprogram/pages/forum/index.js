// pages/forum/forum.js
const api = require('../../utils/api.js');

Page({
  data: {
    isPostFormVisible: false,
    isLoading: false,
    isLoadingPosts: false,
    statusMessage: '',
    posts: [],
    tempImagePath: '',
    currentPage: 1,
    pageSize: 4,
    totalPages: 1,
    uniqueFilename: null
  },

  onLoad: function() {
    this.loadPosts(1);
  },

  onPullDownRefresh: function() {
    this.loadPosts(1);
    wx.stopPullDownRefresh();
  },

  togglePostForm: function() {
    this.setData({
      isPostFormVisible: !this.data.isPostFormVisible
    });
  },

  chooseImage: function() {
    const that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function(res) {
        // Generate unique filename for the image
        const file = res.tempFilePaths[0];
        const fileExtension = file.split('.').pop();
        const uniqueFilename = `image_${Date.now()}_${Math.floor(Math.random() * 10000)}.${fileExtension}`;
        
        that.setData({
          tempImagePath: res.tempFilePaths[0],
          uniqueFilename: uniqueFilename
        });
      }
    });
  },

  submitPost: async function(e) {
    this.setData({ isLoading: true });
    
    try {
      const formValues = e.detail.value;
      const newPost = {
        id: this._generateUniqueId(),
        title: formValues.title,
        content: formValues.content,
        timestamp: new Date().toISOString(),
        uniqueFilename: this.data.uniqueFilename,
        replies: []
      };
      
      // Upload image if selected
      if (this.data.tempImagePath && this.data.uniqueFilename) {
        await this._uploadImage(this.data.tempImagePath, this.data.uniqueFilename);
      }
      
      await this._savePost(newPost);
      
      this.setData({
        isPostFormVisible: false,
        tempImagePath: '',
        uniqueFilename: null,
        statusMessage: '发布成功！'
      });
      
      this.loadPosts(1);
    } catch (error) {
      console.error('Error submitting post:', error);
      this.setData({
        statusMessage: '发布失败: ' + error.message
      });
    } finally {
      this.setData({ isLoading: false });
    }
  },

  async _uploadImage(filePath, uniqueFilename) {
    return new Promise((resolve, reject) => {
      // Read file content
      wx.getFileSystemManager().readFile({
        filePath: filePath,
        encoding: 'base64',
        success: async (res) => {
          const base64Content = res.data;
          
          try {
            // Upload to Gitee
            const apiUrl = `https://gitee.com/api/v5/repos/${api.owner}/${api.imgs_repo}/contents/${api.image_folder}/${uniqueFilename}`;
            
            const payload = {
              access_token: api.token,
              content: base64Content,
              message: `Upload ${uniqueFilename}`
            };
            
            wx.request({
              url: apiUrl,
              method: 'POST',
              data: JSON.stringify(payload),
              header: {
                'Content-Type': 'application/json'
              },
              success: (result) => {
                if (result.statusCode === 201) {
                  resolve();
                } else {
                  reject(new Error(`Upload failed: ${result.statusCode}`));
                }
              },
              fail: (error) => {
                reject(error);
              }
            });
          } catch (error) {
            reject(error);
          }
        },
        fail: (error) => {
          reject(error);
        }
      });
    });
  },

  async _savePost(newPost) {
    let { sha, content: fileContent } = await api.getFileContent();
    fileContent.push(newPost);
    await api.updateFileContent(fileContent, sha);
  },

  _generateUniqueId() {
    return '_' + Math.random().toString(36).substr(2, 9);
  },

  loadPosts: async function(page) {
    this.setData({
      isLoadingPosts: true,
      currentPage: page
    });

    try {
      const { content } = await api.getFileContent();
      
      // Sort posts by latest activity
      content.sort((a, b) => {
        let latestA = new Date(a.timestamp);
        let latestB = new Date(b.timestamp);
        
        if (a.replies && a.replies.length > 0) {
          const latestReplyA = new Date(a.replies[a.replies.length - 1].timestamp);
          if (latestReplyA > latestA) latestA = latestReplyA;
        }
        
        if (b.replies && b.replies.length > 0) {
          const latestReplyB = new Date(b.replies[b.replies.length - 1].timestamp);
          if (latestReplyB > latestB) latestB = latestReplyB;
        }
        
        return latestB - latestA;
      });
      
      const totalPages = Math.ceil(content.length / this.data.pageSize);
      const postsToDisplay = content.slice(
        (page - 1) * this.data.pageSize, 
        page * this.data.pageSize
      );
      
      // Format timestamps and prepare for display
      const formattedPosts = postsToDisplay.map(post => ({
        ...post,
        formattedTime: new Date(post.timestamp).toLocaleString()
      }));
      
      this.setData({
        posts: formattedPosts,
        totalPages: totalPages
      });
      
      // Load images for posts that have them
      this._loadPostImages(formattedPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    } finally {
      this.setData({
        isLoadingPosts: false
      });
    }
  },

  async _loadPostImages(posts) {
    for (let post of posts) {
      if (post.uniqueFilename) {
        try {
          const imagePath = `https://gitee.com/api/v5/repos/${api.owner}/${api.imgs_repo}/contents/${api.image_folder}/${post.uniqueFilename}`;
          const imageUrl = await api.fetchImage(imagePath);
          
          // Find the post in the current data array and update its imageUrl
          const updatedPosts = this.data.posts.map(p => {
            if (p.id === post.id) {
              return { ...p, imageUrl };
            }
            return p;
          });
          
          this.setData({
            posts: updatedPosts
          });
        } catch (error) {
          console.error('Error loading image for post:', post.id, error);
        }
      }
    }
  },

  loadPage: function(e) {
    const page = e.currentTarget.dataset.page;
    this.loadPosts(page);
  },
  
  navigateToPost: function(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/post/post?id=' + id
    });
  }
});