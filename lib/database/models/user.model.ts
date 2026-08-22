import { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    image: {
      type: String,
      required: true,
    },

    username: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      default: "user",
    },

    defaultPaymentMethod: {
      type: String,
      default: "",
    },

    address: {
      firstName: {
        type: String,
        default: "",
      },

      lastName: {
        type: String,
        default: "",
      },

      phoneNumber: {
        type: String,
        default: "",
      },

      address1: {
        type: String,
        default: "",
      },

      address2: {
        type: String,
        default: "",
      },

      city: {
        type: String,
        default: "",
      },

      state: {
        type: String,
        default: "",
      },

      zipCode: {
        type: String,
        default: "",
      },

      country: {
        type: String,
        default: "",
      },

      active: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

const User = models.User || model("User", UserSchema);

export default User;