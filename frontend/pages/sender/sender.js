Page({
  data: {
    autosize: {
      minHeight: 80, maxHeight: 300
    },
    text: ""
  },

  onShow() {
    this.getTabBar().setData({ currentTab: "sender" })
  },

  onTextChanged(e) {
    this.setData({ text: e.detail.value })
  }
})