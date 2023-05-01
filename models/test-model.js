import mongoose, { model } from 'mongoose';
const { Schema } = mongoose;

const testSchema = new Schema(
  {
    name: { type: String, required: true },
    questions: [
      {
        title: { type: String, required: true },
        answers: [
          {
            text: { type: String, required: true },
            value: { type: Boolean, require: true, default: false },
          },
        ],
      },
    ],
  },
  { versionKey: false }
);

export default model('Test', testSchema);
