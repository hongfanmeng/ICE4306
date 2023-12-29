export const chooseMedia = (options: WechatMiniprogram.ChooseMediaOption) => {
  return new Promise<WechatMiniprogram.ChooseMediaSuccessCallbackResult>(
    (resolve, reject) => {
      wx.chooseMedia({
        ...options,
        success: (res) => resolve(res),
        fail: (res) => reject(res),
      });
    }
  );
};
export const uploadFile = (options: WechatMiniprogram.UploadFileOption) => {
  return new Promise<WechatMiniprogram.UploadFileSuccessCallbackResult>(
    (resolve, reject) => {
      wx.uploadFile({
        ...options,
        success: (res) => resolve(res),
        fail: (res) => reject(res),
      });
    }
  );
};

export const request = (options: WechatMiniprogram.RequestOption) => {
  return new Promise<WechatMiniprogram.RequestSuccessCallbackResult>(
    (resolve, reject) => {
      wx.request({
        ...options,
        success: (res) => resolve(res),
        fail: (res) => reject(res),
      });
    }
  );
};
