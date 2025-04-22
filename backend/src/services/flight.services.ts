import mongoose from "mongoose";
import { FlightStatusModel } from "../models/flight.status.model";
import { ethers } from "ethers";
import { environment } from "../utils/config";
import flightAbi from "../abis/flight-abi";

export async function getFlightStatus(flightId: string) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const flight = await getFlight(flightId);
    const currentTime = await currentBlockchainTime();
    const flightTime = Number(flight[2]);

    console.log({
      currentTime,
      flightTime,
    });

    if (currentTime! < flightTime) {
      return {
        status: "On Time",
        reason_for_delay: {
          type: "",
          description: "",
        },
        flight_id: flightId,
      };
    }

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
      return { ...flightStatus, currentTime, flightTime };
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

const currentBlockchainTime = async () => {
  const provider = new ethers.JsonRpcProvider(environment.RPC_URL);
  const block = await provider.getBlock("latest");
  return block?.timestamp;
};

const getFlight = async (flightId: string) => {
  const provider = new ethers.JsonRpcProvider(environment.RPC_URL);
  const flightInterface = new ethers.Interface(flightAbi);
  const flightContract = new ethers.Contract(
    environment.FLIGHT_TICKET_CONTRACT_ADDRESS!,
    flightInterface,
    provider
  );

  console.log({ flightId });
  const flight = await flightContract.flights(flightId);
  return flight;
};
