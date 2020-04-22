const AV = require('../../libs/av-weapp-min.js');
const { formatTime } = require('../../libs/formatTime.js')
Page({
  data:{
    date:'',
    feeling:'smile',
    content:'',
    type:'write',
    id:'',
    placeholder:'',
    isLogin:false,
    isInput:false,
    finishRequest:false
  },
  onLoad(options){
    let date = formatTime(new Date())
    this.setData({ date: date, type: options.type })
    let currentUser = AV.User.current()
    if (currentUser){
      this.setData({ isLogin: true })  
    }
    if (options.type === 'check') {
      this.setData({ type: 'check', date: options.date })
      this.fetchDiary('', options.date)
    } else if (options.type === 'update') {
      this.setData({ type: 'update', id: options.id })
      this.fetchDiary(options.id)
    }
  },
  fetchDiary(id,date){
    if(this.data.isLogin){
      let _this = this
      var query = new AV.Query('diary')
      if(id && !date){
        query.get(id).then(function (res) {
          let {date,content,feeling}=res.attributes
          _this.setData({ date:date,content: content,feeling:feeling,finishRequest:true })
        })
      }else if(!id && date){
        query.equalTo('date',date);
        query.find().then((res)=>{
          if(res.length===0){
            _this.setData({ placeholder: '这天，什么都没有被记下。', finishRequest: true})
          }
          let { content, feeling } = res[0].attributes
          _this.setData({ content: content, feeling: feeling, id: res[0].id, finishRequest: true })
        })
      }      
    }else{
      let diary=wx.getStorageSync('diary')
      let {date,content,feeling}=diary[id]
      this.setData({ date: date, content: content, feeling: feeling, finishRequest: true})
    }  
  },
  changeFeeling(e){
    this.setData({feeling:e.currentTarget.dataset.x,isInput:true})
  },
  watchValue(e){
    this.setData({content:e.detail.value,isInput:true})
  },
  save(){
    let {content,type,placeholder}=this.data
    if(content){
      type === 'write' || (type === 'check' && placeholder)? this.createDiary() : this.updateDiary()      
      wx.reLaunch({
        url: '/pages/home/home',
      })
    }
  },

  cancel(){
    wx.reLaunch({
      url: '/pages/home/home',
    })
  },
  change(){
    this.setData({disabled:false})
  },
  createDiary(){
    let { date, feeling, content,isLogin,isInput} = this.data
    if(isLogin && isInput){
      let currentUser = AV.User.current();
      let Diary = new AV.Object('diary')
      Diary.set('user', AV.User.current())
      Diary.set('date', date)
      Diary.set('content', content)
      Diary.set('feeling', feeling)
      Diary.save()
    }else if(!isLogin && isInput){
      let diary=wx.getStorageSync('diary')
      let newDiary = { 'date': date, 'content': content, 'feeling': feeling }
      if(diary){
        diary.push(newDiary)
        wx.setStorageSync('diary', diary)
      }else{
        wx.setStorageSync('diary', [newDiary])
      }     
    }   
  },
  updateDiary(){
    let {content,feeling,id,isLogin,isInput}=this.data
    if(isLogin && isInput){
      let Diary = AV.Object.createWithoutData('diary', id);
      Diary.set('content', content)
      Diary.set('feeling', feeling);
      Diary.save()
    } else if(!isLogin && isInput) {
      let diary = wx.getStorageSync('diary')
      diary[id].content=content
      diary[id].feeling = feeling
      wx.setStorageSync('diary', diary)
    }       
  },
  beforeDelete() {
    let _this = this
    wx.showModal({
      title: '提示',
      content: '确定删除这篇小日记吗',
      cancelColor: '#999999',
      confirmColor: '#333333',
      success(res) {
        if (res.confirm) {
          _this.deleteDiary()
        }
      }
    })
  },
  deleteDiary(){
    let {id,isLogin}=this.data
    if (id && isLogin) {
      let Diary = AV.Object.createWithoutData('diary', id);
      Diary.destroy();
    } else if(id && !isLogin){
      let diary = wx.getStorageSync('diary')
      diary.splice(id, 1)
      wx.setStorageSync('diary', diary)
      this.setData({ list: diary })
    }
    wx.reLaunch({
      url: '/pages/home/home',
    })
  }
})