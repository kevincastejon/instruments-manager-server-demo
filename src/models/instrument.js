import mongoose from 'mongoose';

const instrumentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  user: { type: mongoose.Schema.ObjectId, ref: 'User' },
  com: {
    type: String,
  },
});

async function getAll() {
  const instrus = await this.find({ })
    .populate('user', 'username')
    .exec();
  return instrus;
}
instrumentSchema.statics.getAll = getAll;

async function getByUser(userId) {
  const ownedInstruments = await mongoose.models.Instrument.find({ user: userId });
  return ownedInstruments;
}
instrumentSchema.statics.getByUser = getByUser;

const Instrument = mongoose.model('Instrument', instrumentSchema);

export default Instrument;
