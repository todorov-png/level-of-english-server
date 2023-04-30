import { Schema, model } from 'mongoose';

const PermissionSchema = new Schema({
  name: { type: String, required: true },
});

export default model('Permission', PermissionSchema);
