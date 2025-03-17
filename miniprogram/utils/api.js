// utils/api/api.js
const owner = "wang_hua_min";
const repo = "we-chat-data";
const imgs_repo = "bbs_images";
const path = "data/forumData.json";
const token = "4918bb3947dbf1402d7331a65bab1b3e";
const image_folder = "images";

const apiUrl = `https://gitee.com/api/v5/repos/${owner}/${repo}/contents/${path}`;

async function fetchFromGitee(url, options = {}) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: url,
      header: options.headers || {
        "Authorization": `token ${token}`,
        "Accept": "application/json"
      },
      method: options.method || 'GET',
      data: options.body,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          console.error('Error response:', res);
          reject(new Error(`Gitee API request failed: ${res.statusCode}`));
        }
      },
      fail: (err) => {
        console.error('Request failed:', err);
        reject(err);
      }
    });
  });
}

// Correctly handle Chinese characters when decoding base64
function base64ToUtf8(base64) {
  const binaryString = wx.base64ToArrayBuffer(base64);
  return decodeURIComponent(escape(String.fromCharCode.apply(null, new Uint8Array(binaryString))));
}

// Correctly handle Chinese characters when encoding to base64
function utf8ToBase64(str) {
  const bytes = new Uint8Array(unescape(encodeURIComponent(str)).split('').map(char => char.charCodeAt(0)));
  return wx.arrayBufferToBase64(bytes);
}

async function getFileContent() {
  try {
    console.log("Fetching file content from:", apiUrl);
    const response = await fetchFromGitee(apiUrl);
    
    if (!response) {
      console.log("File not found, returning empty content");
      return { sha: null, content: [] };
    }

    // Use the improved decoding function
    const content = JSON.parse(base64ToUtf8(response.content));
    return { sha: response.sha, content };
  } catch (error) {
    console.error('Error in getFileContent:', error);
    return { sha: null, content: [] };
  }
}

async function updateFileContent(content, sha) {
  try {
    // Use the improved encoding function
    const updatedData = utf8ToBase64(JSON.stringify(content));
    
    const response = await fetchFromGitee(apiUrl, {
      method: "PUT",
      headers: {
        "Authorization": `token ${token}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: {
        message: "Update forum data",
        content: updatedData,
        sha
      }
    });

    console.log("File content updated successfully");
    return response;
  } catch (error) {
    console.error('Error in updateFileContent:', error);
    throw error;
  }
}

async function fetchImage(imagePath) {
  try {
    const response = await fetchFromGitee(imagePath);
    if (!response || !response.content) {
      throw new Error('Failed to fetch image');
    }
    return `data:image/jpeg;base64,${response.content}`;
  } catch (error) {
    console.error('Error in fetchImage:', error);
    throw error;
  }
}

async function getUserIP() {
  return new Promise((resolve) => {
    wx.getSystemInfo({
      success: (res) => {
        resolve(res.system + '-' + res.model);
      },
      fail: () => {
        resolve('anonymous');
      }
    });
  });
}

module.exports = {
  owner,
  repo,
  imgs_repo,
  image_folder,
  token,
  getFileContent,
  updateFileContent,
  fetchImage,
  getUserIP
};