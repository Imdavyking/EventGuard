// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {ContractRegistry} from "@flarenetwork/flare-periphery-contracts/coston2/ContractRegistry.sol";
import {RandomNumberV2Interface} from "@flarenetwork/flare-periphery-contracts/coston2/RandomNumberV2Interface.sol";
import {TestFtsoV2Interface} from "@flarenetwork/flare-periphery-contracts/coston2/TestFtsoV2Interface.sol";
import {IFdcVerification} from "@flarenetwork/flare-periphery-contracts/coston2/IFdcVerification.sol";
import {IJsonApi} from "@flarenetwork/flare-periphery-contracts/coston2/IJsonApi.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract FlightTicket is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    RandomNumberV2Interface internal randomV2;
    TestFtsoV2Interface internal ftsoV2;

    bytes21 FLRUSD = bytes21(0x01464c522f55534400000000000000000000000000); // FLR/USD

    error FlightTicket__IncorrectETHAmount();
    error FlightTicket__SendingFailed();
    error FlightTicket__TokenNotSupported();
    error FlightTicket__PriceNotAvailable();
    error FlightTicket__RandomNumberNotSecure();
    error FlightTicket__FlightAlreadyExists();
    error FlightTicket__FlightNotFound();
    error FlightTicket__TicketAlreadyRefunded();
    error FlightTicket__TicketNotExpired();
    error FlightTicket__CanOnlyRefundPayer();
    error FlightTicket__InvalidJsonProof();
    error FlightTicket__DateisLessThanCurrentTime();
    error FlightTicket__FlightWentSuccessfully();
    error FlightTicket__TicketNotSameAsData();

    uint256 public constant FIAT_priceDecimals = 10 ** 2;
    uint256 public constant SLIPPAGE_TOLERANCE_BPS = 200;
    address public constant NATIVE_TOKEN =
        address(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE);

    mapping(address => bytes21) public tokenToFeedId;
    mapping(uint256 => Ticket) public tickets;
    mapping(uint256 => Flight) public flights;

    // Struct to store flight details
    struct Flight {
        uint256 id;
        string route;
        uint256 date;
        uint256 amountInUsd;
    }

    // Struct to store user ticket details
    struct Ticket {
        uint256 ticketId;
        uint256 flightId;
        string route;
        uint256 date;
        string weatherCondition;
        string refundStatus;
        uint256 amountInUsd;
        address payer;
        address token;
        bool isWithdrawn;
    }

    struct DataTransportObject {
        uint256 flightId;
        string status;
        string reasonType;
        string description;
    }

    // Event to emit flight creation
    event FlightCreated(
        uint256 id,
        string route,
        uint256 date,
        uint256 amountPaid
    );

    // Event to emit flight ticket purchase
    event FlightTicketPurchased(
        uint256 ticketId,
        uint256 flightId,
        string route,
        uint256 date,
        string weatherCondition,
        string refundStatus,
        uint256 amountPaid,
        address payer
    );

    // Event to emit flight ticket withdrawal
    event FlightTicketWithdrawn(
        uint256 ticketId,
        uint256 flightId,
        string route,
        uint256 date,
        string weatherCondition,
        string refundStatus,
        uint256 amountPaid,
        address recipient
    );

    constructor() {
        randomV2 = ContractRegistry.getRandomNumberV2();
        ftsoV2 = ContractRegistry.getTestFtsoV2();
        tokenToFeedId[NATIVE_TOKEN] = FLRUSD;
    }

    function isJsonApiProofValid(
        IJsonApi.Proof calldata _proof
    ) private view returns (bool) {
        return
            ContractRegistry.auxiliaryGetIJsonApiVerification().verifyJsonApi(
                _proof
            );
    }

    function refundTicket(
        uint256 ticketId,
        IJsonApi.Proof calldata _proof
    ) external nonReentrant {
        if (!isJsonApiProofValid(_proof)) {
            revert FlightTicket__InvalidJsonProof();
        }

        Ticket memory ticket = tickets[ticketId];

        if (ticket.date < block.timestamp) {
            revert FlightTicket__TicketNotExpired();
        }

        if (ticket.payer != msg.sender) {
            revert FlightTicket__CanOnlyRefundPayer();
        }

        DataTransportObject memory dto = abi.decode(
            _proof.data.responseBody.abi_encoded_data,
            (DataTransportObject)
        );

        if (dto.flightId != ticket.flightId) {
            revert FlightTicket__TicketNotSameAsData();
        }

        if (keccak256(bytes(dto.status)) == keccak256(bytes("On Time"))) {
            revert FlightTicket__FlightWentSuccessfully();
        }

        // Check if the ticket has already been refunded
        if (ticket.isWithdrawn) {
            revert FlightTicket__TicketAlreadyRefunded();
        }

        // Mark the ticket as refunded
        tickets[ticketId].isWithdrawn = true;

        // Refund the ticket amount
        if (ticket.token == NATIVE_TOKEN) {
            (bool success, ) = msg.sender.call{value: ticket.amountInUsd}("");
            if (!success) {
                revert FlightTicket__SendingFailed();
            }
        } else {
            IERC20(ticket.token).safeTransfer(msg.sender, ticket.amountInUsd);
        }

        // Emit an event for the refund (you need to define this event)
        emit FlightTicketWithdrawn(
            ticketId,
            ticket.flightId,
            ticket.route,
            ticket.date,
            dto.description,
            "Refunded",
            ticket.amountInUsd,
            msg.sender
        );
    }

    /**
     * Fetch the latest secure random number and generate a flight ID.
     * The random number is used to ensure the uniqueness of the flight ID.
     */
    function generateUniqueId() internal view returns (uint256) {
        (uint256 randomNumber, bool isSecure, ) = randomV2.getRandomNumber();
        if (!isSecure) {
            revert FlightTicket__RandomNumberNotSecure();
        }
        return randomNumber;
    }

    function payForFlight(
        uint256 flightId,
        address token
    ) public payable nonReentrant {
        Flight memory flight = flights[flightId];
        if (flight.id == 0) {
            revert FlightTicket__FlightNotFound();
        }
        uint256 amountToSend = getUsdToTokenPrice(token, flight.amountInUsd);
        uint256 minTokenAmount = (amountToSend *
            (10000 - SLIPPAGE_TOLERANCE_BPS)) / 10000;
        uint256 maxTokenAmount = (amountToSend *
            (10000 + SLIPPAGE_TOLERANCE_BPS)) / 10000;
        if (token == NATIVE_TOKEN) {
            if (msg.value < minTokenAmount || msg.value > maxTokenAmount) {
                revert FlightTicket__IncorrectETHAmount();
            }
        } else {
            IERC20(token).safeTransferFrom(
                msg.sender,
                address(this),
                amountToSend
            );
        }

        // create a flight ticket
        uint256 ticketId = generateUniqueId();
        Ticket memory newTicket = Ticket({
            ticketId: ticketId,
            flightId: flightId,
            route: flights[flightId].route,
            date: flights[flightId].date,
            weatherCondition: "",
            refundStatus: "",
            amountInUsd: flight.amountInUsd,
            token: token,
            payer: msg.sender,
            isWithdrawn: false
        });

        // Store the ticket in the mapping
        tickets[ticketId] = newTicket;

        // Emit the FlightTicketPurchased event (you need to define this event)
        emit FlightTicketPurchased(
            ticketId,
            flightId,
            flights[flightId].route,
            flights[flightId].date,
            "",
            "",
            flight.amountInUsd,
            msg.sender
        );
    }

    function withdraw(uint256 _ticketId) external onlyOwner nonReentrant {
        Ticket memory ticket = tickets[_ticketId];

        // check if the ticket have been refunded
        if (ticket.isWithdrawn) {
            revert FlightTicket__TicketAlreadyRefunded();
        }

        // check if the ticket have been used
        if (ticket.date < block.timestamp) {
            revert FlightTicket__TicketNotExpired();
        }

        // Mark the ticket as withdrawn
        tickets[_ticketId].isWithdrawn = true;

        if (ticket.token == NATIVE_TOKEN) {
            (bool success, ) = msg.sender.call{value: ticket.amountInUsd}("");
            if (!success) {
                revert FlightTicket__SendingFailed();
            }
        } else {
            IERC20(ticket.token).safeTransfer(msg.sender, ticket.amountInUsd);
        }

        // Emit an event for the withdrawal (you need to define this event)
        emit FlightTicketWithdrawn(
            _ticketId,
            ticket.flightId,
            ticket.route,
            ticket.date,
            ticket.weatherCondition,
            ticket.refundStatus,
            ticket.amountInUsd,
            msg.sender
        );
    }

    /**
     * @dev Get token decimals
     * @param token The address of the token.
     */
    function getTokenDecimals(address token) internal view returns (uint8) {
        if (token == NATIVE_TOKEN) {
            return 18;
        }

        (bool success, bytes memory data) = token.staticcall(
            abi.encodeWithSignature("decimals()")
        );
        return success ? abi.decode(data, (uint8)) : 18;
    }

    function getUsdToTokenPrice(
        address token,
        uint256 amountInUsd
    ) public view returns (uint256) {
        bytes21 priceId = tokenToFeedId[token];
        if (priceId == bytes21(0)) {
            revert FlightTicket__TokenNotSupported();
        }
        (uint256 priceOfTokenInUsd, int8 _priceDecimals, ) = ftsoV2.getFeedById(
            priceId
        );
        if (priceOfTokenInUsd == 0) {
            revert FlightTicket__PriceNotAvailable();
        }
        uint8 priceDecimals = uint8(
            _priceDecimals < 0 ? -_priceDecimals : _priceDecimals
        );
        uint8 tokenDecimals = getTokenDecimals(token);

        uint256 amountToSendNumerator = amountInUsd *
            (10 ** tokenDecimals) *
            (10 ** priceDecimals);
        uint256 amountToSendDenominator = priceOfTokenInUsd;

        uint256 amountToSend = amountToSendNumerator / amountToSendDenominator;

        return amountToSend / FIAT_priceDecimals;
    }

    /**
     * Function to create a flight ticket.
     * Accepts payment in ETH, USDT, BTC (ERC20 tokens can be added for these currencies).
     */
    function createFlight(
        string memory _route,
        uint256 _date,
        uint256 _amountInUsd
    ) external onlyOwner {
        uint256 flightId = generateUniqueId();

        if (_date < block.timestamp) {
            revert FlightTicket__DateisLessThanCurrentTime();
        }

        Flight memory newFlight = Flight({
            id: flightId,
            route: _route,
            date: _date,
            amountInUsd: _amountInUsd
        });

        // Store the flight in the mapping
        flights[flightId] = newFlight;

        // Emit event
        emit FlightCreated(flightId, _route, _date, _amountInUsd);
    }

    /**
     * Function to get flight details by ID.
     */
    function getFlightDetails(
        uint256 _flightId
    )
        external
        view
        returns (
            uint256 flightId,
            string memory route,
            uint256 date,
            uint256 amountPaid
        )
    {
        Flight memory flight = flights[_flightId];
        return (flight.id, flight.route, flight.date, flight.amountInUsd);
    }

    function abiSignatureHack(DataTransportObject calldata dto) public pure {}
}
