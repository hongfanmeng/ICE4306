import { request } from "~/utils/index";

interface Post {
  id: number;
  text: string | undefined;
  encoded_text: string;
  text_display: string | undefined;
  file: {
    id: number;
    url: string;
  };
}

const app = getApp();
Page({
  data: {
    posts: [] as Post[],
    isLoading: true,
  },

  onShow() {
    this.getTabBar().setData({ currentTab: "receiver" });
    this.fetchPosts();
  },

  cut(str: string, length: number) {
    return str.length > length ? str.substr(0, length) + "..." : str;
  },

  async fetchPosts() {
    this.setData({ isLoading: true });
    const res = await request({ url: `${app.globalData.apiBase}/posts` });
    const posts = (res.data as Post[]).map((post) => ({
      ...post,
      text_display: this.cut(post.encoded_text, 110),
    })) as Post[];
    this.setData({
      posts: posts,
      isLoading: false,
    });
  },

  async handleTextTap(e) {
    const postId = e.target.dataset.postId as number;
    const postIdx = this.data.posts.findIndex(
      (post: Post) => post.id == postId
    );
    const post = this.data.posts[postIdx] as Post;
    if (post.text) {
      this.setData({ [`posts[${postIdx}]`]: { ...post, text: "" } });
    } else {
      const decodedPost = await this.decodePost(post);
      this.setData({ [`posts[${postIdx}]`]: decodedPost });
    }
  },

  async decodePost(post: Post) {
    const encoded_text = post.encoded_text;
    const encoded_text_bytes = new Uint8Array(encoded_text.length / 2);
    for (let i = 0; i < encoded_text.length; i += 2) {
      let byte = parseInt(encoded_text.substr(i, 2), 16);
      encoded_text_bytes[i / 2] = byte;
    }

    const res = await request({
      url: `${app.globalData.apiBase}/files/${post.file.id}`,
      responseType: "arraybuffer",
    });

    const data = new Uint8Array(res.data as ArrayBuffer);
    const dataSliced = data.slice(0xf0, 0xf0 + encoded_text_bytes.length);
    const xorResults = new Uint8Array(dataSliced.length);
    for (let i = 0; i < dataSliced.length; i++) {
      xorResults[i] = dataSliced[i] ^ encoded_text_bytes[i];
    }
    const text = decodeURIComponent(escape(String.fromCharCode(...xorResults)));
    return { ...post, text };
  },
});
