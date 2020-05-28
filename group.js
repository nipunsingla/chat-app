const mongoose=require('mongoose');
const Schema=mongoose.Schema;
const Group=new Schema({
    ID:{
        type:String
    },
    name:{
      type:String  
    },
    text:[
        {
            Sender:{
                type:String
            },
            Time:{
                type:Date
            },
            Message:{
                type:String
            }
        }
    ]
})
module.exports=mongoose.model('Group',Group);