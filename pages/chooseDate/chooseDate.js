const date = new Date()
const years = []
const months = []
const days = []
var pickEnd=true

for (let i = 2020; i <= date.getFullYear(); i++) {
  years.push(i)
}

for (let i = 1; i <= 12; i++) {
  months.push(i)
}

for (let i = 1; i <= 31; i++) {
  days.push(i)
}

Page({
  data: {
    years: years,
    year: date.getFullYear(),
    months: months,
    month: date.getMonth()+1,
    days: days,
    day: date.getDate(),
    value: [9999, date.getMonth(), date.getDate()-1],
  },
  bindChange(e){
    const val = e.detail.value
    this.setData({
      year: this.data.years[val[0]],
      month: this.data.months[val[1]],
      day: this.data.days[val[2]]
    })
  },
  bindpickstart(){
    pickEnd = false  
  },
  bindpickend(){
    pickEnd=true
  },
  formatDate(){
    let { year, month, day } = this.data
    month = (month + '').length === 1 ? '0' + month : month
    day = (day + '').length === 1 ? '0' + day : day
    return year + '.' + month + '.' + day    
  },
  confirm(){ 
    if (pickEnd){
      let date=this.formatDate()
      wx.reLaunch({
        url: `/pages/write/write?type=check&date=${date}`,
      })
    }   
  },
  cancel(){
    wx.navigateBack()
  }
})