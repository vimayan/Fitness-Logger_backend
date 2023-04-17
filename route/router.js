const route = require("express").Router();
const { addPost, updatePost, deletePost, postGoal, postDaily, updateDaily, deleteDaily } = require("../controller/postAction");
const {createUser,loginUser, auth, overView, resetPassword, requestPassword, userUpdate, verifyUser, enterPassword, getUser}=require('../controller/userAction')
route.get("/", (req, res) => {
    res.end("hello there");
  });
  
  
route.post("/register",createUser);
route.post("/login",loginUser);
route.get('/verify/:username',verifyUser)
route.get('/:username/home',auth,overView);

route.post('/request-password',requestPassword);
route.get('/reset-password/:id/:token',enterPassword);
route.post('/reset-password/:id/:token',resetPassword);

route.get('/:username/getuser',auth,getUser);
route.put('/:username/update',auth,userUpdate);

route.post('/:username/addpost',auth,addPost);
route.put('/:username/updatepost/:id',auth,updatePost);
route.delete('/:username/deletepost/:id',auth,deletePost);



route.post('/:username/setgoal',auth,postGoal);

route.post('/:username/setdaily',auth,postDaily);
route.put('/:username/updatedaily/:id',auth,updateDaily);
route.delete('/:username/deletedaily/:id',auth,deleteDaily);


route.use('*',auth,()=>{
  res.status(404).end('Page Not Found')
});
  module.exports = route;