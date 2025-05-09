export default [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "FlightTicket__CanOnlyRefundPayer",
    type: "error",
  },
  {
    inputs: [],
    name: "FlightTicket__DateisLessThanCurrentTime",
    type: "error",
  },
  {
    inputs: [],
    name: "FlightTicket__FlightAlreadyExists",
    type: "error",
  },
  {
    inputs: [],
    name: "FlightTicket__FlightNotFound",
    type: "error",
  },
  {
    inputs: [],
    name: "FlightTicket__FlightWentSuccessfully",
    type: "error",
  },
  {
    inputs: [],
    name: "FlightTicket__IncorrectETHAmount",
    type: "error",
  },
  {
    inputs: [],
    name: "FlightTicket__InvalidJsonProof",
    type: "error",
  },
  {
    inputs: [],
    name: "FlightTicket__PriceNotAvailable",
    type: "error",
  },
  {
    inputs: [],
    name: "FlightTicket__RandomNumberNotSecure",
    type: "error",
  },
  {
    inputs: [],
    name: "FlightTicket__SendingFailed",
    type: "error",
  },
  {
    inputs: [],
    name: "FlightTicket__TicketAlreadyRefunded",
    type: "error",
  },
  {
    inputs: [],
    name: "FlightTicket__TicketNotExpired",
    type: "error",
  },
  {
    inputs: [],
    name: "FlightTicket__TicketNotSameAsData",
    type: "error",
  },
  {
    inputs: [],
    name: "FlightTicket__TokenNotSupported",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "route",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "date",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amountPaid",
        type: "uint256",
      },
    ],
    name: "FlightCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "ticketId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "flightId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "route",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "date",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "weatherCondition",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "refundStatus",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amountPaid",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "payer",
        type: "address",
      },
    ],
    name: "FlightTicketPurchased",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "ticketId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "flightId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "route",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "date",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "weatherCondition",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "refundStatus",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amountPaid",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "recipient",
        type: "address",
      },
    ],
    name: "FlightTicketWithdrawn",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    inputs: [],
    name: "FIAT_priceDecimals",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "NATIVE_TOKEN",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "SLIPPAGE_TOLERANCE_BPS",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "flightId",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "status",
            type: "string",
          },
          {
            internalType: "string",
            name: "reasonType",
            type: "string",
          },
          {
            internalType: "string",
            name: "description",
            type: "string",
          },
        ],
        internalType: "struct FlightTicket.DataTransportObject",
        name: "dto",
        type: "tuple",
      },
    ],
    name: "abiSignatureHack",
    outputs: [],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_route",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "_date",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_amountInUsd",
        type: "uint256",
      },
    ],
    name: "createFlight",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "flights",
    outputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "route",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "date",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amountInUsd",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_flightId",
        type: "uint256",
      },
    ],
    name: "getFlightDetails",
    outputs: [
      {
        internalType: "uint256",
        name: "flightId",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "route",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "date",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amountPaid",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amountInUsd",
        type: "uint256",
      },
    ],
    name: "getUsdToTokenPrice",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "flightId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
    ],
    name: "payForFlight",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "ticketId",
        type: "uint256",
      },
      {
        components: [
          {
            internalType: "bytes32[]",
            name: "merkleProof",
            type: "bytes32[]",
          },
          {
            components: [
              {
                internalType: "bytes32",
                name: "attestationType",
                type: "bytes32",
              },
              {
                internalType: "bytes32",
                name: "sourceId",
                type: "bytes32",
              },
              {
                internalType: "uint64",
                name: "votingRound",
                type: "uint64",
              },
              {
                internalType: "uint64",
                name: "lowestUsedTimestamp",
                type: "uint64",
              },
              {
                components: [
                  {
                    internalType: "string",
                    name: "url",
                    type: "string",
                  },
                  {
                    internalType: "string",
                    name: "postprocessJq",
                    type: "string",
                  },
                  {
                    internalType: "string",
                    name: "abi_signature",
                    type: "string",
                  },
                ],
                internalType: "struct IJsonApi.RequestBody",
                name: "requestBody",
                type: "tuple",
              },
              {
                components: [
                  {
                    internalType: "bytes",
                    name: "abi_encoded_data",
                    type: "bytes",
                  },
                ],
                internalType: "struct IJsonApi.ResponseBody",
                name: "responseBody",
                type: "tuple",
              },
            ],
            internalType: "struct IJsonApi.Response",
            name: "data",
            type: "tuple",
          },
        ],
        internalType: "struct IJsonApi.Proof",
        name: "_proof",
        type: "tuple",
      },
    ],
    name: "refundTicket",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "tickets",
    outputs: [
      {
        internalType: "uint256",
        name: "ticketId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "flightId",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "route",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "date",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "weatherCondition",
        type: "string",
      },
      {
        internalType: "string",
        name: "refundStatus",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "amountInUsd",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "payer",
        type: "address",
      },
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "bool",
        name: "isWithdrawn",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "tokenToFeedId",
    outputs: [
      {
        internalType: "bytes21",
        name: "",
        type: "bytes21",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_ticketId",
        type: "uint256",
      },
    ],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];
