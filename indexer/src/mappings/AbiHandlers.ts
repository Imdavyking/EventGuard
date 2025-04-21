import assert from "assert";
import {
  FlightCreatedLog,
  FlightTicketPurchasedLog,
  FlightTicketWithdrawnLog,
} from "../types/abi-interfaces/FlightTicket";

import {
  FlightCreated,
  FlightTicketPurchased,
  FlightTicketWithdrawn,
} from "../types";

export async function handleFlightCreatedLog(log: FlightCreatedLog) {
  logger.info(`New VoteCast transaction log at block ${log.blockNumber}`);
  assert(log.args, "No log.args");

  const flightCreated = FlightCreated.create({
    id: log.transactionHash,
    flightId: log.args.id.toBigInt(),
    route: log.args.route,
    date: log.args.date.toBigInt(),
    amountPaid: log.args.amountPaid.toBigInt(),
    payer: log.args.payer,
  });

  await flightCreated.save();
}

export async function handleFlightTicketPurchasedLog(
  log: FlightTicketPurchasedLog
) {
  logger.info(`New VoteCast transaction log at block ${log.blockNumber}`);
  assert(log.args, "No log.args");

  const flightTicketPurchased = FlightTicketPurchased.create({
    id: log.transactionHash,
    route: log.args.route,
    date: log.args.date.toBigInt(),
    refundStatus: log.args.refundStatus,
    weatherCondition: log.args.weatherCondition,
    ticketId: log.args.ticketId.toBigInt(),
    amountPaid: log.args.amountPaid.toBigInt(),
    payer: log.args.payer,
  });

  await flightTicketPurchased.save();
}

export async function handleFlightTicketWithdrawnLog(
  log: FlightTicketWithdrawnLog
) {
  logger.info(`New VoteCast transaction log at block ${log.blockNumber}`);
  assert(log.args, "No log.args");

  const flightTicketWithdrawn = FlightTicketWithdrawn.create({
    id: log.transactionHash,
    route: log.args.route,
    date: log.args.date.toBigInt(),
    refundStatus: log.args.refundStatus,
    weatherCondition: log.args.weatherCondition,
    ticketId: log.args.ticketId.toBigInt(),
    amountPaid: log.args.amountPaid.toBigInt(),
    recipient: log.args.recipient,
    flightId: log.args.flightId.toBigInt(),
  });

  await flightTicketWithdrawn.save();
}
