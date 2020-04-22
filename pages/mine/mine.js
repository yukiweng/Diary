const AV = require('../../libs/av-weapp-min.js');
const wxCharts = require('../../libs/wxcharts.js');
var pieChart = null;

Page({
  data: {
    isLogin:false,
    count:[],
    showCount:true,
    diaryList:[],
    feeling:'',
  },
  touchHandler(e){
    let index=pieChart.getCurrentDataIndex(e)   
    let type=''
    switch(index){
      case 0:
      type='smile'
      break;
      case 1:
      type='normal'
      break;
      case 2:
      type='cry'
      break;
    }
    type && this.fetchDiary(type)

  },
  onLoad() {
    let _this = this
    let currentUser = AV.User.current()
    if (currentUser) { 
      _this.setData({ isLogin: true }) 
      Promise.all([
        _this.fetchCount('smile'),
        _this.fetchCount('normal'),
        _this.fetchCount('cry')
      ]).then((res) => {
        _this.setData({ count: res })
        _this.createChart()
      })       
    }
  },
  fetchDiary(type){  
    let _this=this
      let query = new AV.Query('diary')
      query.equalTo('feeling', type)
      query.descending('date')
      query.limit(3)
      query.find().then((res)=> {
        _this.setData({showCount:false,diaryList:res,feeling:type})
      })    
  },  
  fetchOtherDiary(e){
    let type = e.currentTarget.dataset.x
    this.fetchDiary(type)
  },
  fetchCount(type) {
    return new Promise((resolve, reject) => {
      let query = new AV.Query('diary')
      query.equalTo('feeling', type)
      query.count().then((res)=> {   
        resolve(res)
      })
    })
  },
  toShowCount(){
    this.setData({showCount:true})
    this.createChart()
  },
  createChart() {
    let { count } = this.data
    if (count) {
      let width=375
      let res=wx.getSystemInfoSync()
      width = res.windowWidth
      pieChart = new wxCharts({
        animation: false,
        canvasId: 'pieCanvas',
        type: 'ring',
        series: [{
          name: '开心' + ' ' + count[0],
          data: count[0],
        }, {
          name: '一般' + ' ' + count[1],
          data: count[1],
        }, {
          name: '难过' + ' ' + count[2],
          data: count[2],
        }],
        width: width,
        height: 400,
        dataLabel: true,
      });    
    }}
  })



    
