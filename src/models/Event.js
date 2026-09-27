import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "El título es obligatorio"],
      trim: true,
      minlength: 3,
      maxlength: 100
    },
    description: {
      type: String,
      required: [true, "La descripción es obligatoria"],
      trim: true,
      maxlength: 500
    },
    date: {
      type: Date,
      required: [true, "La fecha es obligatoria"]
    },
    location: {
      type: String,
      required: [true, "La ubicación es obligatoria"],
      trim: true,
      maxlength: 200
    },
    capacity: {
      type: Number,
      required: [true, "La capacidad es obligatoria"],
      min: [1, "La capacidad debe ser mayor a 0"]
    }
  },
  {
    timestamps: true
  }
);

const Event = mongoose.model("Event", eventSchema);

export default Event;
