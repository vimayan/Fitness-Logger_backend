
const mongoose = require("mongoose");



const userSchema=mongoose.Schema({
    firstname: {
        type: String,
        required: true,
      },
      lastname: {
        type: String,
        required: true,
      },
    email: {
        type: String,
        required: true,
      },

      password: {
        type: String,
        required: true,
      },
      isverified: {
        type: Boolean,
        required: true,
        default: false,
      },

})

const tokenSchema=mongoose.Schema({
    userid:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required:true,
        unique:true
    },

token:{type:String,
required:true},

createdAt:{type:Date,
    default:Date.now(),expires:36000

}
})

const postSchema=mongoose.Schema({
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required:true
      },
      name: {
        type: String,
        required: true,
      },
      duration: {
        type: Number,
      },
      distance: {
        type: Number,
      },
      reps: {
        type: Number,
      },
      date: {
        type: Date,
        required:true,
      },

})

const dailySchema=mongoose.Schema({
  userid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  },
    activity: {
          type: String,
          required: true,
        },
        date: {
          type:Date,
          required:true
        },
      
    })

    const goalSchema=mongoose.Schema({
      userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
      },
      goals:[{
        name: {
        type: String,
        required: true,
      },
      target: {
        type: Number,
        required: true,
      },}]
    });
   

module.exports={
    UserSchema:mongoose.model('user',userSchema),
    TokenSchema:mongoose.model('token',tokenSchema),
    PostSchema:mongoose.model('posts',postSchema),
    DailySchema:mongoose.model('dailys',dailySchema),
    GoalSchema:mongoose.model('goals',goalSchema),
}



