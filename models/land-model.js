import mongoose, { model } from 'mongoose';
const { Schema } = mongoose;

const landSchema = new Schema(
  {
    nameTask: { type: String, required: true },
    taskJira: { type: String, required: true },
    type: { type: String, required: true },
    fullName: { type: String, required: true },
    product: { type: String, required: true },
    country: { type: String, required: true },
    status: { type: String, required: true },
    category: { type: String, required: true },
    privacy: { type: Boolean, default: false },
    teamName: { type: String, default: 'INB' },
    numberComebacker: { type: String, default: '0' },
    typeSales: { type: String },
    price: { type: String },
    source: { type: String },
    link: { type: String },
    linkDownloadsTeams: { type: String },
    translation: { type: String },
    tgMessageID: { type: Number },
    tgTeamMessageID: { type: Number },
    tgTranslationMessageID: { type: Number },
    date: { type: Number },
    team: [
      {
        name: { type: String, required: true },
        visits: { type: Number, required: true, default: 0 },
        completedForms: { type: Number, required: true, default: 0 },
      },
    ],
  },
  { versionKey: false }
);

export default model('Land', landSchema);
