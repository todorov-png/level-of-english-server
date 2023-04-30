import { Schema, model } from 'mongoose';

const TeamSchema = new Schema({
  name: { type: String, required: true },
  bearer: { type: String, required: true },
  members: { type: Number, required: true, default: 0 },
  linkTg: { type: String },
});

export default model('Team', TeamSchema);
