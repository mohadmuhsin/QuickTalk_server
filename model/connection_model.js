const mongoose =require('mongoose')
const objectId = mongoose.Schema.Types.ObjectId;  
const connectionSchema=new mongoose.Schema({
    connections:{
        user:{
            type:objectId,
            ref:"User",
            required:true
        },
        pair:{
            type:objectId,
             ref:"User",
             required:true
        }
    },
    lastmessage:{
        type:objectId,
        ref:""
    }
},{
    timestamps:true
})



const Connection = mongoose.model('Connection', connectionSchema)
module.exports = Connection