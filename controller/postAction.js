const {
    UserSchema,
    PostSchema,
    DailySchema,
    GoalSchema,
  } = require("../model/mongooseModel");
const joi = require('joi')


const postSchema= joi.object({
  name: joi.string().required(),
  duration: joi.number(),
  distance: joi.number(),
  reps: joi.number(),
  date:joi.date().raw().required(),
}).xor('duration','reps')

  exports.addPost = async (req, res) => {
    const { name, duration, distance, reps, date } = req.body;
    const userid=req._id;

   const postFields={name,userid}
    try {
      const { error } = await postSchema.validateAsync(req.body);

if(error){  return res.status(400).end(error.details[0].message)}

      if (duration) {
        postFields.duration=duration;
      }
      if (distance) {
        postFields.distance=distance;
      }
      if (reps) {
        postFields.reps=reps;
      }
      if (date) {
        postFields.date=date;
      }
      const newPost = new PostSchema(postFields);
  
      const post = await newPost.save();
      return res.json(post);
    
    } catch (error) {
      
      res.status(500).send(error);
    }
    
  };



exports.updatePost= async (req, res) => {
    const { name, duration, distance, reps } = req.body;
 
    const postFields = {};
    if(name){ postFields.name = name;}
    if (duration) postFields.duration = duration;
    if (distance) postFields.distance = distance;
    if (reps) postFields.reps = reps;
  
    try {
      let post = await PostSchema.findById(req.params.id);
      console.log(post);
      if (!post) return res.status(404).json({ msg: 'Contact not found' });
      // make sur user owns the posts
      if (post.userid.toString() !== req._id) {
        return res.status(401).json({ msg: 'Not authorized' });
      }
      post = await PostSchema.findByIdAndUpdate(
        req.params.id,
        { $set: postFields },
        { new: true }
      );
      res.json(post);
    } catch (error) {
     
      res.status(500).send(error);
    }
  };



  exports.deletePost= async (req, res) => {
    try {
      let post = await PostSchema.findById(req.params.id);
      if (!post) return res.status(404).json({ msg: 'Contact not found' });
      // make sur user owns the posts
      if (post.userid.toString() !== req._id) {
        return res.status(401).json({ msg: 'Not authorized' });
      }
  
      await PostSchema.findByIdAndRemove(req.params.id);
  
      res.json({ msg: 'Post deleted' });
    } catch (error) {
     
      res.status(500).send(error);
    }
}



const goalSchema= joi.array().items(joi.object({ name: joi.string().valid('cycling','running',
'pushup','pullup','squat','plank').required(),
  target: joi.number().required(),_id:joi.any() },
  ))


exports.postGoal= async (req, res) => {
  const goals = req.body.goals;
  console.log(goals);
  try {

    const { error } = await goalSchema.validateAsync(req.body.goals);


    const goal = await GoalSchema.findOne({"userid":req._id});

   
     if(goal){
      const id = goal._id.toString()
     const goalsUpdate=await GoalSchema.findOneAndUpdate({"_id":id},{$set:{'goals':[...goals]}},{returnDocument:"after"});
      return res.status(200).send(goalsUpdate)
    }
    else{
    const newGoal = new GoalSchema({'userid': req._id,'goals':goals });
    const updatedGoal = await newGoal.save();
    return res.status(200).send(updatedGoal);}

  
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
}






const dailySchema=joi.object({ activity: joi.string().required(),
  date: joi.date().raw().required()})


exports.postDaily= async (req, res) => {

  console.log(req.body);
  



  try {
    const { error } = await dailySchema.validateAsync(req.body);


    const daily = await DailySchema.findOne({'userid': req._id,"date":req.body.date});
console.log(daily);
    if(daily) {return res.status(400).end("you have some activity on same time")}
 else{
      await new DailySchema({'userid': req._id,'activity':req.body.activity, "date":req.body.date}).save();
    
 const daily = await DailySchema.find({'userid': req._id});
    return res.send(daily);
  }

  } catch (error) {
    res.status(500).send(error);
  }
}


const dailyUpdateSchema= joi.object({ activity: joi.string().required(),
  date: joi.date().raw().required(),_id:joi.any(),userid:joi.any(),__v:joi.any()

})


exports.updateDaily= async (req, res) => {
  const dailyDetails  = req.body;
          console.log(dailyDetails);
  try {
    const { error } = await dailyUpdateSchema.validateAsync(req.body);

    let daily = await DailySchema.findById(req.params.id);
    if (!daily) {
      return res.status(404).json({ msg: 'activity not found' });
    }
   
    if (daily.userid.toString() !== req._id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    //make sure user own the details
  dailyUpdate = await DailySchema.findByIdAndUpdate(
    req.params.id,
    { $set: {activity:dailyDetails.activity,date:dailyDetails.date} },
    { returnDocument:'after' }
    );
    return res.send(dailyUpdate);
  } catch (error) {
    res.status(500).send(error);
  }
}


exports.deleteDaily= async (req, res) => {
 
  try {
    let daily = await DailySchema.findOne({"_id":req.params.id});
    if (!daily) {
      return res.status(404).json({ msg: 'activity not found' });
    }
    //make sure user own the details
    if (daily.userid.toString() !== req._id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    dailyUpdate = await DailySchema.findByIdAndRemove( req.params.id);
    newDaily = await DailySchema.find({"userid":req._id})
    res.send(newDaily);
  } catch (error) {
    res.status(500).send(error);
  }
}







