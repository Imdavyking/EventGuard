import { ethers, ContractTransactionResponse } from "ethers";
import { getSigner } from "./blockchain.services";
import { flareTestnet } from "wagmi/chains";
import { COSTON2_DA_LAYER_URL, FDC_HELPER_ADDRESS } from "./constants";
import helpersFDCAbi from "../assets/json/helpers-fdc.json";
import irelayAbi from "../assets/json/irelay-fdc.json";
import ifdcHubAbi from "../assets/json/ifdchub-fdc.json";
import iflareSystemManagerAbi from "../assets/json/iflare-system-manager.json";
import iflareRequestFeeConfirmationsAbi from "../assets/json/iflare-request-fee-confirmations.json";
import ijsonVerificationAbi from "../assets/json/ijson-verfication.json";

const helpersFDCAbiInterFace = new ethers.Interface(helpersFDCAbi);
const iRelayAbiInterFace = new ethers.Interface(irelayAbi);
const ifdcHubAbiInterFace = new ethers.Interface(ifdcHubAbi);
const iFlareSystemsManagerAbiInterFace = new ethers.Interface(
  iflareSystemManagerAbi
);
const iFdcRequestFeeConfigurationsAbiInterFace = new ethers.Interface(
  iflareRequestFeeConfirmationsAbi
);
const IJsonApiVerificationAbiInterface = new ethers.Interface(
  ijsonVerificationAbi
);

export class FDCService {
  sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async getHelpers() {
    const signer = await getSigner();
    return new ethers.Contract(
      FDC_HELPER_ADDRESS,
      helpersFDCAbiInterFace,
      signer
    );
  }

  async getRelay() {
    const signer = await getSigner();
    const helpers = await this.getHelpers();
    const relayAddress: string = await helpers.getRelay();
    return new ethers.Contract(relayAddress, iRelayAbiInterFace, signer);
  }
  async retrieveDataAndProofBase(
    url: string,
    abiEncodedRequest: string,
    roundId: number
  ) {
    console.log("Waiting for the round to finalize...");
    // We check every 10 seconds if the round is finalized
    const relay = await this.getRelay();
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
    const helpers = await this.getHelpers();
    const fdcHubAddress: string = await helpers.getFdcHub();
    return new ethers.Contract(fdcHubAddress, ifdcHubAbiInterFace, signer);
  }

  async getFlareSystemsManager() {
    const helpers = await this.getHelpers();
    const flareSystemsManagerAddress: string =
      await helpers.getFlareSystemsManager();
    const signer = await getSigner();
    return new ethers.Contract(
      flareSystemsManagerAddress,
      iFlareSystemsManagerAbiInterFace,
      signer
    );
  }

  async getFdcRequestFee(abiEncodedRequest: string) {
    const helpers = await this.getHelpers();
    const fdcRequestFeeConfigurationsAddress: string =
      await helpers.getFdcRequestFeeConfigurations();

    const signer = await getSigner();
    const fdcRequestFeeConfigurations = new ethers.Contract(
      fdcRequestFeeConfigurationsAddress,
      iFdcRequestFeeConfigurationsAbiInterFace,
      signer
    );

    return await fdcRequestFeeConfigurations.getRequestFee(abiEncodedRequest);
  }

  async calculateRoundId(transaction: ContractTransactionResponse) {
    const blockNumber = transaction.blockNumber;
    const signer = await getSigner();
    const block = await signer.provider.getBlock(blockNumber!);
    const blockTimestamp = BigInt(block!.timestamp);
    const flareSystemsManager = await this.getFlareSystemsManager();
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

    // const sampleProof = {
    //   response_hex:
    //     "0x0000000000000000000000000000000000000000000000000000000000000020494a736f6e417069000000000000000000000000000000000000000000000000574542320000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000ebbac000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000005000000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001e0000000000000000000000000000000000000000000000000000000000000007f68747470733a2f2f6576656e7467756172642e6f6e72656e6465722e636f6d2f6170692f666c696768742f7374617475732f36333733373435393430353737353235303436393935303331313530323833363131353933373533383230313234393934313634393330363739373830323339383333343231353633393439360000000000000000000000000000000000000000000000000000000000000000a97b0a2020666c6967687449643a202e646174612e666c696768745f69642c0a20207374617475733a202e646174612e7374617475732c0a2020726561736f6e547970653a20282e646174612e726561736f6e5f666f725f64656c61792e74797065202f2f206e756c6c292c0a20206465736372697074696f6e3a20282e646174612e726561736f6e5f666f725f64656c61792e6465736372697074696f6e202f2f206e756c6c290a7d0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022b207b0a2020202022636f6d706f6e656e7473223a205b0a2020202020207b0a202020202020202022696e7465726e616c54797065223a202275696e74323536222c0a2020202020202020226e616d65223a2022666c696768744964222c0a20202020202020202274797065223a202275696e74323536220a2020202020207d2c0a2020202020207b0a202020202020202022696e7465726e616c54797065223a2022737472696e67222c0a2020202020202020226e616d65223a2022737461747573222c0a20202020202020202274797065223a2022737472696e67220a2020202020207d2c0a2020202020207b0a202020202020202022696e7465726e616c54797065223a2022737472696e67222c0a2020202020202020226e616d65223a2022726561736f6e54797065222c0a20202020202020202274797065223a2022737472696e67220a2020202020207d2c0a2020202020207b0a202020202020202022696e7465726e616c54797065223a2022737472696e67222c0a2020202020202020226e616d65223a20226465736372697074696f6e222c0a20202020202020202274797065223a2022737472696e67220a2020202020207d0a202020205d2c0a2020202022696e7465726e616c54797065223a202273747275637420466c696768745469636b65742e446174615472616e73706f72744f626a656374222c0a20202020226e616d65223a202264746f222c0a202020202274797065223a20227475706c65220a20207d0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000018000000000000000000000000000000000000000000000000000000000000000208cea1fa492276b07ccfe4ac19b3c36d1c3487dc683a92c2d139dccfd0dddd1c8000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000843616e63656c65640000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000009546563686e6963616c0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002f4169726372616674206d61696e74656e616e6365207265717569726564206265666f7265206465706172747572652e0000000000000000000000000000000000",
    //   attestation_type:
    //     "0x494a736f6e417069000000000000000000000000000000000000000000000000",
    //   proof: [
    //     "0x95c4ad4b15818a7e3c8b744792b1ba5e8fe0b49855105369150f7f5c2f8cefb9",
    //     "0x005e737e717d8ea0c626bdb5b2a747a3965347f01d783035a8592c238f36ab27",
    //     "0x46c2b861589ce5c9444557795e0788fe6dcab197d2472eb4fa13c5d80f61dd0d",
    //     "0x2e3e9cf6d28879bbb8dcc44667dd714b2c56d17fd5f5a659f83583efe46462a2",
    //   ],
    // };

    const component =
      IJsonApiVerificationAbiInterface.fragments[0].inputs[0].components![1];

    const decodedResponse = JSON.stringify(
      [
        ...ethers.AbiCoder.defaultAbiCoder().decode(
          [component],
          proof.response_hex
        )[0],
      ],
      (_, v) => (typeof v === "bigint" ? v.toString() : v)
    );

    return {
      merkleProof: proof.proof,
      data: JSON.parse(decodedResponse),
    };
  }
}
