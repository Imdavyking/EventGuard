import mongoose from "mongoose";

const FlightStatus = new mongoose.Schema({
  flight_id: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["On Time", "Delayed", "Canceled"],
    required: true,
  },
  reason_for_delay: {
    type: Object,
    required: false,
  },
});

export const FlightStatusModel = mongoose.model("Flight", FlightStatus);
