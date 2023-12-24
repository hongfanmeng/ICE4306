const app = getApp()
Page({
  data: {
    posts: [],
    isLoading: true,
  },

  onShow() {
    this.getTabBar().setData({ currentTab: "receiver" })
    this.fetchPosts()
  },

  cut(str, length) {
    return str.length > length ? str.substr(0, length) + "..." : str;
  },

  fetchPosts() {
    this.setData({ isLoading: true })
    wx.request({
      url: `${app.globalData.apiBase}/posts`,
      success: (res) => {
        const posts = res.data.map(post => ({
          ...post,
          text_display: this.cut(post.encoded_text, 140)
        }));
        this.setData({
          posts: posts,
          isLoading: false
        })
      }
    })
  },

  async handleTextTap(e) {
    const postId = e.target.dataset.postId
    const postIdx = this.data.posts.findIndex(post => post.id == postId)
    const post = this.data.posts[postIdx]
    const decodedPost = await this.decodePost(post)
    this.setData({
      [`posts[${postIdx}]`]: decodedPost
    })
  },

  async decodePost(post) {
    const encoded_text = post.encoded_text;
    const encoded_text_bytes = new Uint8Array(encoded_text.length / 2)
    for (let i = 0; i < encoded_text.length; i += 2) {
      let byte = parseInt(encoded_text.substr(i, 2), 16)
      encoded_text_bytes[i / 2] = byte;
    }

    return new Promise((resolve, reject) => {
      wx.request({
        url: `${app.globalData.apiBase}/files/${post.file.id}`,
        responseType: "arraybuffer",
        success: (res) => {
          const data = new Uint8Array(res.data);
          const data_sliced = data.slice(0xf0, 0xf0 + encoded_text_bytes.length)
          const xor_results = new Uint8Array(data_sliced.length)
          for (let i = 0; i < data_sliced.length; i++) {
            xor_results[i] = data_sliced[i] ^ encoded_text_bytes[i]
          }
          const decoder = new TextDecoder()
          const text = decoder.decode(xor_results)
          resolve({ ...post, text: text })
        },
        fail: () => reject()
      })
    })

  }
})