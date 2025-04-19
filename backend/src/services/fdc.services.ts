import { BrowserProvider, ethers, ContractTransactionResponse } from "ethers";
import {
  Helpers,
  IFdcRequestFeeConfigurations,
  IFlareSystemsManager,
  IJsonApiVerification__factory,
  IRelay,
} from "../typechain-types";

const {
  JQ_VERIFIER_URL_TESTNET,
  JQ_VERIFIER_API_KEY_TESTNET,
  COSTON2_DA_LAYER_URL,
  OPEN_WEATHER_API_KEY,
} = process.env;

class Base {
  toHex(data: string) {
    var result = "";
    for (var i = 0; i < data.length; i++) {
      result += data.charCodeAt(i).toString(16);
    }

    return result.padEnd(64, "0");
  }

  toUtf8HexString(data: string) {
    return "0x" + this.toHex(data);
  }

  sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async getHelpers() {
    const Helpers = await ethers.getContractFactory("Helpers");
    const helpers = await Helpers.deploy();
    await helpers.waitForDeployment();
    return helpers;
  }

  async getRelay() {
    const helpers: Helpers = await this.getHelpers();
    const relayAddress: string = await helpers.getRelay();
    return await ethers.getContractAt("IRelay", relayAddress);
  }
  async retrieveDataAndProofBase(
    url: string,
    abiEncodedRequest: string,
    roundId: number
  ) {
    console.log("Waiting for the round to finalize...");
    // We check every 10 seconds if the round is finalized
    const relay: IRelay = await this.getRelay();
    while (!(await relay.isFinalized(200, roundId))) {
      await this.sleep(30000);
    }
    console.log("Round finalized!\n");

    const request = {
      votingRoundId: roundId,
      requestBytes: abiEncodedRequest,
    };
    console.log("Prepared request:\n", request, "\n");

    await this.sleep(10000);
    var proof = await this.postRequestToDALayer(url, request, true);
    console.log("Waiting for the DA Layer to generate the proof...");
    while (proof.response_hex == undefined) {
      await this.sleep(10000);
      proof = await this.postRequestToDALayer(url, request, false);
    }
    console.log("Proof generated!\n");

    console.log("Proof:", proof, "\n");
    return proof;
  }

  async postRequestToDALayer(
    url: string,
    request: any,
    watchStatus: boolean = false
  ) {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        //   "X-API-KEY": "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });
    if (watchStatus && response.status != 200) {
      throw new Error(
        `Response status is not OK, status ${response.status} ${response.statusText}\n`
      );
    } else if (watchStatus) {
      console.log("Response status is OK\n");
    }
    return await response.json();
  }

  async getFdcHub() {
    const helpers: Helpers = await this.getHelpers();
    const fdcHubAddress: string = await helpers.getFdcHub();
    return await ethers.getContractAt("IFdcHub", fdcHubAddress);
  }

  async getFlareSystemsManager() {
    const helpers: Helpers = await this.getHelpers();
    const flareSystemsManagerAddress: string =
      await helpers.getFlareSystemsManager();
    return await ethers.getContractAt(
      "IFlareSystemsManager",
      flareSystemsManagerAddress
    );
  }

  async getFdcRequestFee(abiEncodedRequest: string) {
    const helpers: Helpers = await this.getHelpers();
    const fdcRequestFeeConfigurationsAddress: string =
      await helpers.getFdcRequestFeeConfigurations();
    const fdcRequestFeeConfigurations: IFdcRequestFeeConfigurations =
      await ethers.getContractAt(
        "IFdcRequestFeeConfigurations",
        fdcRequestFeeConfigurationsAddress
      );
    return await fdcRequestFeeConfigurations.getRequestFee(abiEncodedRequest);
  }

  async calculateRoundId(transaction: ContractTransactionResponse) {
    const blockNumber = transaction.blockNumber;
    const block = await ethers.provider.getBlock(blockNumber!);
    const blockTimestamp = BigInt(block!.timestamp);

    const flareSystemsManager: IFlareSystemsManager =
      await this.getFlareSystemsManager();
    const firsVotingRoundStartTs = BigInt(
      await flareSystemsManager.firstVotingRoundStartTs()
    );
    const votingEpochDurationSeconds = BigInt(
      await flareSystemsManager.votingEpochDurationSeconds()
    );

    console.log("Block timestamp:", blockTimestamp, "\n");
    console.log("First voting round start ts:", firsVotingRoundStartTs, "\n");
    console.log(
      "Voting epoch duration seconds:",
      votingEpochDurationSeconds,
      "\n"
    );

    const roundId = Number(
      (blockTimestamp - firsVotingRoundStartTs) / votingEpochDurationSeconds
    );
    console.log("Calculated round id:", roundId, "\n");
    console.log(
      "Received round id:",
      Number(await flareSystemsManager.getCurrentVotingEpochId()),
      "\n"
    );
    return roundId;
  }

  async prepareAttestationRequestBase(
    url: string,
    apiKey: string,
    attestationTypeBase: string,
    sourceIdBase: string,
    requestBody: any
  ) {
    console.log("Url:", url, "\n");
    const attestationType = this.toUtf8HexString(attestationTypeBase);
    const sourceId = this.toUtf8HexString(sourceIdBase);

    const request = {
      attestationType: attestationType,
      sourceId: sourceId,
      requestBody: requestBody,
    };
    console.log("Prepared request:\n", request, "\n");

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });
    if (response.status != 200) {
      throw new Error(
        `Response status is not OK, status ${response.status} ${response.statusText}\n`
      );
    }
    console.log("Response status is OK\n");

    return await response.json();
  }

  async submitAttestationRequest(abiEncodedRequest: string) {
    const fdcHub = await base.getFdcHub();
    const requestFee = await base.getFdcRequestFee(abiEncodedRequest);
    const transaction = await fdcHub.requestAttestation(abiEncodedRequest, {
      value: requestFee,
    });
    console.log("Submitted request:", transaction.hash, "\n");
    const roundId = await base.calculateRoundId(transaction);
    console.log(
      `Check round progress at: https://${hre.network.name}-systems-explorer.flare.rocks/voting-epoch/${roundId}?tab=fdc\n`
    );
    return roundId;
  }
}

const base = new Base();

async function prepareAttestationRequest(
  apiUrl: string,
  postprocessJq: string,
  abiSignature: string
) {
  const requestBody = {
    url: apiUrl,
    postprocessJq: postprocessJq,
    abi_signature: abiSignature,
  };

  const url = `${verifierUrlBase}JsonApi/prepareRequest`;
  const apiKey = JQ_VERIFIER_API_KEY_TESTNET!;

  return await base.prepareAttestationRequestBase(
    url,
    apiKey,
    attestationTypeBase,
    sourceIdBase,
    requestBody
  );
}

async function retrieveDataAndProof(
  abiEncodedRequest: string,
  roundId: number
) {
  const url = `${COSTON2_DA_LAYER_URL}api/v1/fdc/proof-by-request-round-raw`;
  console.log("Url:", url, "n");
  return await base.retrieveDataAndProofBase(url, abiEncodedRequest, roundId);
}

const latitude = 46.419402127862405;
const longitude = 15.587079308221126;

const units = "metric";

// const apiUrl = `https://api.openweathermap.org/data/2.5/weather\?lat\=${latitude}\&lon\=${longitude}\&appid\=${OPEN_WEATHER_API_KEY}\&units\=${units}`;
const apiUrl = "https://eventguard.onrender.com/api/fdc/sample-open-weather";
const postprocessJq = `{
  latitude: (.coord.lat | if . != null then .*pow(10;6) else null end),
  longitude: (.coord.lon | if . != null then .*pow(10;6) else null end),
  description: .weather[0].description,
  temperature: (.main.temp | if . != null then .*pow(10;6) else null end),
  minTemp: (.main.temp_min | if . != null then .*pow(10;6) else null end),
  windSpeed: (.wind.speed | if . != null then . *pow(10;6) end),
  windDeg: .wind.deg
  }`;

const abiSignature = `{
    "components": [
      {
        "internalType": "int256",
        "name": "latitude",
        "type": "int256"
      },
      {
        "internalType": "int256",
        "name": "longitude",
        "type": "int256"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "internalType": "int256",
        "name": "temperature",
        "type": "int256"
      },
      {
        "internalType": "int256",
        "name": "minTemp",
        "type": "int256"
      },
      {
        "internalType": "uint256",
        "name": "windSpeed",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "windDeg",
        "type": "uint256"
      }
    ],
    "internalType": "struct DataTransportObject",
    "name": "dto",
    "type": "tuple"
  }`;
// Configuration constants
const attestationTypeBase = "IJsonApi";
const sourceIdBase = "WEB2";
const verifierUrlBase = JQ_VERIFIER_URL_TESTNET;

async function main() {
  const data = await prepareAttestationRequest(
    apiUrl,
    postprocessJq,
    abiSignature
  );
  console.log("Data:", data, "\n");
  const abiEncodedRequest = data.abiEncodedRequest;
  const roundId = await base.submitAttestationRequest(abiEncodedRequest);
  const proof = await retrieveDataAndProof(abiEncodedRequest, roundId);
  console.log({ proof });

  const responseType =
    IJsonApiVerification__factory.abi[0].inputs[0].components[1];

  console.log("Response type:", responseType, "\n");

  const jsonInterface = new ethers.Interface(IJsonApiVerification__factory.abi);

  const decodingFrag = jsonInterface.fragments.find(
    (fragment) =>
      fragment.type === "function" &&
      (fragment as any).selector === proof.response_hex
  );

  if (!decodingFrag) {
    throw new Error("Can not decode hex");
  }

  const decodedResponse = ethers.AbiCoder.defaultAbiCoder().decode(
    decodingFrag.inputs,
    proof.response_hex
  );

  const jsonProof = {
    merkleProof: proof.proof,
    data: decodedResponse,
  };
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    if (error instanceof Error) {
      console.log(error.message);
    } else console.log(error);
    process.exit(1);
  });
