const AV = require('../../libs/av-weapp-min.js');
const { formatTime } = require('../../libs/formatTime.js')
Page({
  data:{
    list:[],
    isLogin:false,
    loading:false   
  },
  onLoad(options){ 
    let currentUser = AV.User.current()
    if (currentUser) {
      this.setData({ isLogin: true })
      if (options.fromLogin === "true") {
        this.fisrtLogin()
      }else{
        this.fetchDiary()
      }     
    }else{
      let diary = wx.getStorageSync('diary')
      this.setData({ list: diary })
      this.markDay()
    }   
  },
  fisrtLogin() {
    let _this=this
    let diary = wx.getStorageSync('diary')
    if(diary){
      let arr=[]
      let Diary
      for(let i=0;i<diary.length;i++){
        Diary= new AV.Object('diary')
        Diary.set('user', AV.User.current())
        Diary.set('date', diary[i].date)
        Diary.set('content', diary[i].content)
        Diary.set('feeling', diary[i].feeling)
        arr.push(Diary)
      }
      AV.Object.saveAll(arr).then((res) => {
        wx.removeStorage({
          key: 'diary'
        })
        _this.fetchDiary()
      })
    }else{
      this.fetchDiary()
    }   
  },
  markDay() {
    let date=''
    let {list}=this.data
    if(list[0]){
      date = list[0].attributes?list[0].attributes.date:list[0].date
    }
    wx.setStorage({
      key: 'day',
      data: date
    })   
  },
  checkDay(){
    let nowDate = formatTime(new Date())
    let date = wx.getStorageSync('day')
    if(nowDate===date){
      wx.showModal({
        title: '提示',
        content: '今天已经写过日记啦',
        showCancel: false,
        confirmColor: '#999999'
      })    
    } 
    return nowDate === date    
  },
  fetchDiary(){
    this.setData({loading:true})
    let _this=this
    let query = new AV.Query('diary')
    query.descending('date')
    query.limit(7)
    query.find().then((res)=> {
      _this.setData({ loading:false,list: res })
      _this.markDay()
    })
  },
  openDiary(e){
    let { x, id } = e.currentTarget.dataset
    let { isLogin, list } = this.data
    if (!isLogin && list.length === 3){
      this.remindToLogin()
    }else{
      let diaryExist = false
      if (x === 'write') {
        diaryExist = this.checkDay()
      }
      if(diaryExist===false){
        wx.redirectTo({
          url: `/pages/write/write?type=${x}&id=${id}`,
        })
      }           
    }   
  }, 
  remindToLogin(){
      wx.showModal({
        title: '提示',
        content: '点击登录解锁更多篇幅和功能吧',
        cancelColor: '#999999',
        confirmColor: '#333333',
        success(res) {
          if (res.confirm) {
            wx.redirectTo({
              url:'/pages/login/login'
            })
          }
        }
      })          
  },
  beforeDelete(e){
    let { id} = e.currentTarget.dataset
    let _this=this
    wx.showModal({
      title: '提示',
      content: '确定删除这篇小日记吗',
      cancelColor:'#999999',
      confirmColor: '#333333',
      success(res) {
        if (res.confirm) {
          _this.deleteDiary(id)
        }      
      }    
    })    
  },
   deleteDiary(id) {  
    if (this.data.isLogin) {
      let Diary = AV.Object.createWithoutData('diary', id);
      let _this=this
      Diary.destroy().then(res=>{
        _this.fetchDiary()
        })
    } else {
      let diary = wx.getStorageSync('diary')
      diary.splice(id, 1)
      wx.setStorageSync('diary', diary)
      this.setData({list:diary})
    }
  },
  onHide(){
    console.log('hide')
  },
  onUnload(){
    console.log('unload')
  }
})