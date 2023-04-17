const {
  UserSchema,
  TokenSchema,
  PostSchema,
  DailySchema,
  GoalSchema,
} = require("../model/mongooseModel");
const sendEmail = require('../controller/sendmail')
const bcrypt = require("bcryptjs");
const joi = require("joi");
const jwt = require("jsonwebtoken");
const crypto= require('crypto')
const registerSchema = joi.object({
  email: joi.string().min(6).required(),
  firstname: joi.string().min(3).max(16).required(),
  lastname: joi.string().min(3).max(16).required(),
  password: joi
    .string()
    .regex(/^[a-zA-Z0-9]{6,16}$/)
    .min(8)
    .required(),
});

exports.createUser = async (req, res) => {
  const email = req.body.email;
  const firstname = req.body.firstname;
 
  try {
    const { error } = await registerSchema.validateAsync(req.body);

    // Save Tutorial in the database

      const users = await UserSchema.findOne({ email: email });
      if (users) {
        return res.status(400).end("email already exist");
      }
    
      const hashpassword = await bcrypt.hash(req.body.password, 10);
    
      const userAccount = new UserSchema({
        email: req.body.email,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        password: hashpassword,
      });



      await userAccount.save();

      const Token = new TokenSchema({
        userid: userAccount._id,
        token: crypto.randomBytes(32).toString("hex"),
      });
      Token.save();

      const link = `${process.env.URL}/verify/${firstname}?_id=${userAccount._id}&token=${Token.token}`
      
      
await sendEmail(email,'click here to verify your mail',link)

      return res.status(200).send('verification link has been sent to your mail id');
   
  } catch (error) {
    res.status(500).send(error.details[0].message);
  }
};


exports.verifyUser = async (req, res) => {

  
  try {
 
    const token = await TokenSchema.findOne({
      userid:req.query._id,
      token: req.query.token,
  });
   
    if (!token) return res.status(400).send("invalid link or expired");

    const user = await UserSchema.findById(req.query._id);

    if (!user) return res.status(400).send("Invalid link or expired");

    user.isverified = true;
    await user.save();
    await token.delete();
     res.render('verifyuser')
    } catch (error) {
    res.end("An error occured");
    console.log(error);
}


};






const loginSchema = joi.object({
  email: joi.string().email({
    minDomainSegments: 2,
    tlds: { allow: ["com", "net"] },
  }),
  password: joi
    .string()
    .regex(/^[a-zA-Z0-9]{6,16}$/)
    .min(8)
    .required(),
});

exports.loginUser = async (req, res) => {
  const email = req.body.email;

 
  try {
    const {error} = await loginSchema.validateAsync(req.body);

    if (error) {
      return res.status(400).send(error);
    }
  
    const user = await UserSchema.findOne({ email: email });

    if (!user) {
      return res.status(400).end("email id not exist please register");
    }
    else if(!user.isverified){
      return res.status(400).end("your account not verified,please visit the link in your mail");
  }

    const validpassword = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!validpassword) {
      return res.status(400).send("please enter valid password");
    }
    
    else {
      const token = jwt.sign({ _id: user._id }, process.env.SECRET_KEY);


      return res.json({
        token: token,
        user: user,
      });
    }
  } catch (error) {
    res.status(500).send(error);
  }
};


exports.overView=async (req,res)=>{


    const user = await UserSchema.findOne({ "_id": req._id });
    const post = await PostSchema.find({ "userid": user._id });
    const daily = await DailySchema.find({ "userid": user._id });
    const goals = await GoalSchema.findOne({ "userid": user._id });

    return  await res.json({
        post: post?post:[],
        daily: daily?daily:[],
        goals: goals?goals:[],
      });
     
}


exports.requestPassword= async (req, res) => {

    try {
        const schema = joi.object({ email: joi.string().email().required() });
        const { error } = schema.validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const user = await UserSchema.findOne({ email: req.body.email });
        if (!user)
            return res.status(400).send("user with given email doesn't exist");

        let token = await TokenSchema.findOne({ userid: user._id });
        if (!token) {
            token = await new TokenSchema({
                userid: user._id,
                token: crypto.randomBytes(32).toString("hex"),
            }).save();
        }

        const link = `${process.env.URL}/reset-password/${user._id}/${token.token}`;
        await sendEmail(user.email, "Password reset", link);

        res.status(200).send("password reset link sent to your email account");
    } catch (error) {
        res.status(500).send("An error occured");
        console.log(error);
    }
}


exports.enterPassword= async (req, res) => {
  try {
     

      const user = await UserSchema.findById(req.params.id);
      if (!user)
          return res.status(400).send("invalid link");

      let token = await TokenSchema.findOne({ token: req.params.token });
      if (!token) {
        return res.status(400).send("token expired");;
      }

      res.render("resetpassword",{
        id:req.params.id,
        token: req.params.token
      });
  } catch (error) {
      res.send(error);
  }
}

exports.resetPassword=async (req, res) => {
  console.log(req.body);
  // return res.send(req.body)
  try {
      const passwordSchema = joi.object({ password: joi.string().required(),
      confirmpassword:joi.string().required().valid(joi.ref('password')) });
      const { error } = passwordSchema.validate(req.body);
      if (error) return res.status(400).send(error.details[0]);

      const token = await TokenSchema.findOne({
        userid:req.params.id,
        token: req.params.token,
    });
     
      if (!token) return res.status(400).send("invalid link or expired");

      const user = await UserSchema. findById(req.params.id);

      if (!user) return res.status(400).send("Invalid link or expired");
      const hashpassword = await bcrypt.hash(req.body.password, 10);
      user.password =hashpassword;
      await user.save();
      await token.delete();

      res.send("password reset sucessfully.");
  } catch (error) {
      res.send(error);
  }
}




exports.getUser= async(req,res)=>{
  
  try{
    UserSchema.findOne({ "_id": req._id}).then((data) => {
      console.log(data);
      res.send(data);
    })
  }
  catch (error) {
    res.status(501).send(error);
  }
  
  
  }









const UserUbdateSchema = joi.object({
  email: joi.string().min(6),
  firstname: joi.string().min(3).max(16),
  lastname: joi.string().min(3).max(16),
  password: joi
    .string()
    .regex(/^[a-zA-Z0-9]{6,16}$/)
    .min(8)
    ,
});

exports.userUpdate= async(req,res)=>{
try{

  const { error } = await UserUbdateSchema.validateAsync(req.body);

  const user = req.body
if(req.body.password){
  user.password=await bcrypt.hash(req.body.password, 10)
}
  
  UserSchema.findOneAndUpdate(
    { _id: req._id},
    { $set:{...user}},
    { returnDocument: "after" }
  ).then((data) => {
    res.send(data);
  })
}
catch (error) {
  res.status(501).send(error);
}


}


exports.auth = function (req, res, next) {
    // get token from header
   const token = req.headers.token;
    // check if no token
    if (!token) {
      // 401 not outhorised
      return res.status(401).end( 'No token, authorization denied' );
    }
    // verify token
    try {
      jwt.verify(token, process.env.SECRET_KEY, (err,data) => {
        if (err) {
          return res.status(401).send({
            message: "Unauthorized!",
          });
        } else {
        req._id=data._id
          next();
          return;
        }
      });
    } catch (err) {
      res.status(401).json({ msg: 'Token is not valid' });
    }
  };
  