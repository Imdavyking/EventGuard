import { ethers, ContractTransactionResponse } from "ethers";
import {
  Helpers,
  Helpers__factory,
  IFdcHub__factory,
  IFdcRequestFeeConfigurations,
  IFdcRequestFeeConfigurations__factory,
  IFlareSystemsManager,
  IJsonApiVerification__factory,
  IRelay,
  IRelay__factory,
} from "../typechain-types";
import { getSigner } from "./blockchain.services";
import { IFlareSystemsManager__factory } from "../typechain-types/factories/@flarenetwork/flare-periphery-contracts/coston";
import { flareTestnet } from "wagmi/chains";
import { COSTON2_DA_LAYER_URL, FDC_HELPER_ADDRESS } from "./constants";

export class FDCService {
  sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async getHelpers() {
    const signer = await getSigner();
    return Helpers__factory.connect(FDC_HELPER_ADDRESS, signer);
  }

  async getRelay() {
    const signer = await getSigner();
    const helpers: Helpers = await this.getHelpers();
    const relayAddress: string = await helpers.getRelay();
    return IRelay__factory.connect(relayAddress, signer);
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
    const signer = await getSigner();
    const helpers: Helpers = await this.getHelpers();
    const fdcHubAddress: string = await helpers.getFdcHub();
    return IFdcHub__factory.connect(fdcHubAddress, signer);
  }

  async getFlareSystemsManager() {
    const helpers: Helpers = await this.getHelpers();
    const flareSystemsManagerAddress: string =
      await helpers.getFlareSystemsManager();
    const signer = await getSigner();
    return IFlareSystemsManager__factory.connect(
      flareSystemsManagerAddress,
      signer
    );
  }

  async getFdcRequestFee(abiEncodedRequest: string) {
    const helpers: Helpers = await this.getHelpers();
    const fdcRequestFeeConfigurationsAddress: string =
      await helpers.getFdcRequestFeeConfigurations();

    const signer = await getSigner();
    const fdcRequestFeeConfigurations: IFdcRequestFeeConfigurations =
      IFdcRequestFeeConfigurations__factory.connect(
        fdcRequestFeeConfigurationsAddress,
        signer
      );

    return await fdcRequestFeeConfigurations.getRequestFee(abiEncodedRequest);
  }

  async calculateRoundId(transaction: ContractTransactionResponse) {
    const blockNumber = transaction.blockNumber;
    const signer = await getSigner();
    const block = await signer.provider.getBlock(blockNumber!);
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

  async submitAttestationRequest(abiEncodedRequest: string) {
    const fdcHub = await this.getFdcHub();
    const requestFee = await this.getFdcRequestFee(abiEncodedRequest);
    const transaction = await fdcHub.requestAttestation(abiEncodedRequest, {
      value: requestFee,
    });
    console.log("Submitted request:", transaction.hash, "\n");
    const roundId = await this.calculateRoundId(transaction);
    console.log(
      `Check round progress at: https://${flareTestnet.name}-systems-explorer.flare.rocks/voting-epoch/${roundId}?tab=fdc\n`
    );
    return roundId;
  }

  async retrieveDataAndProof(abiEncodedRequest: string, roundId: number) {
    const url = `${COSTON2_DA_LAYER_URL}api/v1/fdc/proof-by-request-round-raw`;
    console.log("Url:", url, "n");
    return await this.retrieveDataAndProofBase(url, abiEncodedRequest, roundId);
  }

  async getDataAndStoreProof(data: any) {
    console.log("Data:", data, "\n");
    const abiEncodedRequest = data.abiEncodedRequest;
    const roundId = await this.submitAttestationRequest(abiEncodedRequest);
    const proof = await this.retrieveDataAndProof(abiEncodedRequest, roundId);
    console.log({ proof });

    const responseType =
      IJsonApiVerification__factory.abi[0].inputs[0].components[1];

    console.log("Response type:", responseType, "\n");

    const jsonInterface = new ethers.Interface(
      IJsonApiVerification__factory.abi
    );

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

    return jsonProof;
  }
}
