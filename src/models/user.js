import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  admin: {
    type: Boolean,
    required: true,
  },
});
async function getIDByCreds(login, pwd) {
  const user = await this.findOne({
    username: login,
    password: pwd,
  });
  return user ? user._id : null;
}
userSchema.statics.getIDByCreds = getIDByCreds;

async function findByID(id) {
  const user = await this.findOne({
    _id: id,
  }).select(['username', 'admin']);
  return user;
}
userSchema.statics.findByID = findByID;

const User = mongoose.model('User', userSchema);

export default User;
