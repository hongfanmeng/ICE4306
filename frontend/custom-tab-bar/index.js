// custom-tab-bar/index.js

const app = getApp()

Component({
  data: {
    currentTab: "sender",
    tabs: [
      { value: 'sender', label: '发送端', url: "/pages/sender/sender" },
      { value: 'receiver', label: '接收端', url: "/pages/receiver/receiver" },
      { value: 'cat', label: '猫喵识别', url: "/pages/cat/cat" },
    ]
  },

  methods: {
    async switchTab(e) {
      const value = e.detail.value;
      const tab = this.data.tabs.find(tab => tab.value == value)
      await wx.switchTab({ url: tab.url })
    },
  }
})