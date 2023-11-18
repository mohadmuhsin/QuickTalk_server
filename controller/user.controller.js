const User = require('../model/user_model')
const bcrypt  = require ('bcrypt')
const { Validate } = require('../validations/user_validations');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const Connection = require('../model/connection_model');
const Message = require('../model/message_model');
require('dotenv').config();
const requirments = {
  password: Joi.string().min(8).required(),
  email: Joi.string().email().required(),
  name: Joi.string().min(3).max(30).required(),
};

module.exports = {
    async signup(req, res) {
        try {
            const { name, email, password } = req.body;
            const userData = { name: name, email: email, password: password };
            let validating = Validate({
                name: requirments.name, email: requirments.email, password: requirments.password
            }, userData);
            if (!validating)
                return res.status(403).send(validating.response[0].message);

            let existingEmail = await User.findOne({ email: email });
            if (existingEmail)
                return res.status(403).send({message:"This mail is already registered"})
            const hashpassword = await bcrypt.hash(password, 10);

            let user = new User({
                name: name,
                email:email,
                password:hashpassword
            })

            const result = await user.save();
            const { _id } = result.toJSON();
            const token = jwt.sign({ _id: _id }, process.env.SECRET_KEY);
            res.cookie("jwt", token, {
              httpOnly: true,
              maxAge: 24 * 60 * 60 * 1000,
            });
            
            return res.status(201).send({
                token, message: "Registration successfull",
            });
        } catch (error) {
            res.status(500).send({message:"Internal server Error"})
        }
    },

    async login(req, res) {
        try {
            console.log("holo");
            const { email, password } = req.body
            const userData = {
                email: email,
                password: password
            }
            const validating = Validate({ email: requirments.email, password: requirments.password }, userData);
            if (!validating)
                return res.status(403).send(validating.response[0].message);

            const user = await User.findOne({ email: email });
            if (!user)
                return res.status(404).send({ message: "Enter a valid email" });
            const comparePassword = await bcrypt.compare(password, user.password);
            if (!comparePassword)
                return res.status(403).send({ message: "Password Doesn't match" });

            const { _id } = user.toJSON()
            const token = jwt.sign({ _id: _id }, process.env.SECRET_KEY);
            res.cookie("jwt", token, {
              httpOnly: true,
              maxAge: 24 * 60 * 60 * 1000,
            });

            return res.status(201).send({
                token, message: "Login successfull",
            });

        } catch (error) {
            return res.status(500).send({ message: "Internal server Error" });
        }
    },

    async allUser(req, res){
        try {
            const user_id = req.userId
            const connections = await User.find({_id:{$ne:user_id}})
            if (!connections)
                return res.status(404).send({ message: "User Data doesn't exist" })
            res.status(200).send({connections,user_id})
        } catch (error) {
            return res.status(500).send({ message: "Internal server Error" });
        }
    },
    async getFullChat(req, res) {
        try {
            const { id } = req.params
            
            const userId = req.userId
            const connection = await Connection.findOne({
                 $or: [
                        { 'connections.user': userId, 'connections.pair': id },
                        { 'connections.user': id, 'connections.pair': userId }
                    ]
                })
                if (connection) {
                    const allMessages = await Message.find({ connectionid: connection._id }).sort('createdAt')
                
                    return res.status(200).send({result:allMessages,cid:connection._id,userId:userId})

                } else {
                    let result = new Connection({
                        connections: {
                            user: userId,
                            pair: id
                        }
                    })
                    let data = await result.save()
                    res.status(200).json(data)
                }
        } catch (error) {
            return res.status(500).send({ message: "Internal server Error" });
        }
    },
    async sendMessages(req, res) {
        try {
            
            const { connectionid, sender, reciever, message } = req.body
            const data = new Message({
                connectionid: connectionid,
                sender: sender,
                reciever: reciever,
                message: message
            })

            const result = await data.save()
            return res.status(200).send(result) 
        } catch (error) {
            return res.status(500).send({ message: "Internal server Error" }); 
        }
    },

    async getUser(req, res) {
        try {
            const { id } = req.params
            const user = await User.findOne({ _id: id })
            if (!user)
                return res.status(404).send({ message: "User Not Found" });
            res.status(200).send(user);
        } catch (error) {
            return res.status(500).send({ message: "Internal server Error" });  
        }
    },

    async logout(req, res) {
        try {
            const user_id = req.userId
            res.cookie("jwt", "", { maxAge: 0 });
            res.send({ message: "logout success" });
  
        } catch (error) {
            return res.status(500).send({ message: "Internal server Error" }); 
        }
    }
    
}