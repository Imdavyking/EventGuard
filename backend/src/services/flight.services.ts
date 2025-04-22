import mongoose from "mongoose";
import { FlightStatusModel } from "../models/flight.status.model";

export async function getFlightStatus(flightId: string) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const flightStatusModel = await FlightStatusModel.findOne({
      flight_id: flightId,
    }).session(session);
    let flightStatus;

    if (flightStatusModel) {
      return flightStatusModel;
    }

    if (!flightStatusModel) {
      flightStatus = generateFlightStatus(flightId);
      const newFlightStatus = new FlightStatusModel(flightStatus);
      await newFlightStatus.save({ session });
      await session.commitTransaction();
      return flightStatus;
    }
  } catch (error) {
    await session.abortTransaction();
  } finally {
    session.endSession();
  }
}

const generateFlightStatus = (flightId: string) => {
  const statuses = ["On Time", "Delayed", "Canceled"];
  const reasons = {
    Weather: "Severe thunderstorm warning at departure airport.",
    Technical: "Aircraft maintenance required before departure.",
    Crew: "Flight crew not available due to earlier delays.",
  };

  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const reasonType =
    status !== "On Time"
      ? Object.keys(reasons)[
          Math.floor(Math.random() * Object.keys(reasons).length)
        ]
      : null;

  return {
    flight_id: flightId,
    status,
    reason_for_delay: reasonType
      ? {
          type: reasonType,
          description: reasons[reasonType as keyof typeof reasons],
        }
      : null,
  };
};
