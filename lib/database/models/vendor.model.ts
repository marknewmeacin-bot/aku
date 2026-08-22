import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const vendorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
  },

  password: {
    type: String,
    required: true,
    select: false,
  },

  description: {
    type: String,
  },

  address: {
    type: String,
    required: true,
  },

  phoneNumber: {
    type: Number,
    required: true,
  },

  role: {
    type: String,
    default: "vendor",
  },

  zipCode: {
    type: Number,
    required: true,
  },

  availableBalance: {
    type: Number,
    default: 0,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  commission: {
    type: Number,
    default: 0,
  },

  verified: {
    type: Boolean,
    default: false,
  },
});

// Generate JWT token
vendorSchema.methods.getJWTToken = function () {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "5d",
    }
  );
};

// Compare vendor password
vendorSchema.methods.comparePassword = async function (
  enteredPassword: string
) {
  return bcrypt.compare(enteredPassword, this.password);
};

const Vendor =
  mongoose.models.Vendor ||
  mongoose.model("Vendor", vendorSchema);

export default Vendor;