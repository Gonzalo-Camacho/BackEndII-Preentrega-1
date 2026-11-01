import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "El usuario es obligatorio"]
    },

    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "El evento es obligatorio"]
    },

    status: {
      type: String,
      enum: ["confirmed", "pending", "cancelled"],
      default: "confirmed",
      required: true
    },

    quantity: {
      type: Number,
      required: [true, "La cantidad es obligatoria"],
      min: [1, "La cantidad debe ser mayor a 0"],
      validate: {
        validator: Number.isInteger,
        message: "La cantidad debe ser un número entero"
      }
    },

    reservationCode: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    cancelledAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

ticketSchema.index(
  { user: 1, event: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ["confirmed", "pending"] }
    },
    name: "unique_active_ticket_per_user_event"
  }
);

const Ticket = mongoose.model("Ticket", ticketSchema);

export default Ticket;
