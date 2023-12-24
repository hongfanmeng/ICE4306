import { chooseMedia, uploadFile } from "~/utils/index";

const app = getApp();

Page({
  data: {
    image: null as string | null,
    loading: false,
    count: null as number | null,
  },

  onShow() {
    this.getTabBar().setData({ currentTab: "cat" });
  },

  async onButtonTap() {
    this.setData({ loading: true, count: null });
    try {
      const res = await chooseMedia({ mediaType: ["image"], count: 1 });
      this.setData({ image: res.tempFiles[0].tempFilePath });
    } catch {
      this.setData({ loading: false });
    }

    const { data: raw } = await uploadFile({
      url: `${app.globalData.apiBase}/cats/detect?json=1`,
      name: "file",
      filePath: this.data.image,
    });
    const data = JSON.parse(raw);
    const b64data = `data:image/jpeg;base64, ${data.image}`;
    this.setData({ loading: false, image: b64data, count: data.count });
  },
});
