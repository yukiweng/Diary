const AV = require('../../libs/av-weapp-min.js');
const user = AV.User.current();
var app=getApp()
Page({
  data: { loading: false},
  getuserinfo(e){
    if(!this.data.loading){
      if (e.detail.userInfo) {
        this.setData({ loading: true })     
        AV.User.loginWithWeapp().then(user => {
          app.globalData.user = user;
          wx.reLaunch({
            url: '/pages/home/home?fromLogin=true',
          })
        }).catch(console.error)
      }       
    }   
  }
});