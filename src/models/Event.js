import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "El título es obligatorio"],
      trim: true,
      minlength: [3, "El título debe tener al menos 3 caracteres"],
      maxlength: [100, "El título no puede superar los 100 caracteres"]
    },

    description: {
      type: String,
      required: [true, "La descripción es obligatoria"],
      trim: true,
      maxlength: [500, "La descripción no puede superar los 500 caracteres"]
    },

    category: {
      type: String,
      required: [true, "La categoría es obligatoria"],
      trim: true
    },

    date: {
      type: Date,
      required: [true, "La fecha es obligatoria"]
    },

    location: {
      type: String,
      required: [true, "La ubicación es obligatoria"],
      trim: true,
      maxlength: [200, "La ubicación no puede superar los 200 caracteres"]
    },

    capacity: {
      type: Number,
      required: [true, "La capacidad es obligatoria"],
      min: [1, "La capacidad debe ser mayor a 0"],
      validate: {
        validator: Number.isInteger,
        message: "La capacidad debe ser un número entero"
      }
    },

    price: {
      type: Number,
      required: [true, "El precio es obligatorio"],
      min: [0, "El precio no puede ser negativo"]
    },

    status: {
      type: String,
      enum: {
        values: ["draft", "published", "cancelled", "finished"],
        message: "El estado del evento no es válido"
      },
      default: "draft",
      required: true
    },

    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "El organizador es obligatorio"]
    }
  },
  {
    timestamps: true
  }
);

const Event = mongoose.model("Event", eventSchema);

export default Event;