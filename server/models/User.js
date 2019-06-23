import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const UserSchema = new Schema({
	name: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	gender: {
		type: String,
		enum: ['m', 'f', 'o'],
		required: true
	},
	avatar: {
		type: Schema.Types.ObjectId,
		ref: 'avatarimages',
		required: false
	}
});

export default mongoose.model('users', UserSchema);
