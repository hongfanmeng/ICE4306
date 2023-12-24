// @ts-ignore
import Toast from "tdesign-miniprogram/toast/index";
import { uploadFile } from "~/utils/index";

const app = getApp();

Page({
  data: {
    text: "",
    files: [],
    sending: false,
  },

  onShow() {
    this.getTabBar().setData({ currentTab: "sender" });
  },

  onTextChanged(e) {
    this.setData({ text: e.detail.value });
  },

  onUploadSuccess(e) {
    this.setData({ files: e.detail.files });
  },

  showToast(theme: string, message: string) {
    Toast({
      context: this,
      selector: "#t-toast",
      message: message,
      theme: theme,
      direction: "column",
    });
  },

  async onSubmit(e) {
    const apiBase = app.globalData.apiBase;
    if (this.data.text.length == 0) {
      this.showToast("warning", "文字不能为空");
      return;
    }
    if (this.data.files.length == 0) {
      this.showToast("warning", "必须选择图片");
      return;
    }
    this.setData({ sending: true });
    try {
      await uploadFile({
        url: `${apiBase}/posts/create`,
        filePath: this.data.files[0].url,
        name: "file",
        formData: {
          text: this.data.text,
        },
      });

      this.setData({ text: "", files: [], sending: false });
      this.showToast("success", "发送成功");
    } catch {
      this.setData({ sending: false });
      this.showToast("error", "发送失败");
    }
  },
});
