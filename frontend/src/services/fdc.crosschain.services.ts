import { ethers } from "ethers";
import { FDCServiceJson } from "./fdc.json.services";
import ievmTransactionVerificationAbi from "../assets/json/ievm-transaction-verification.json";

const IEVMTransactionVerificationAbiInterface = new ethers.Interface(
  ievmTransactionVerificationAbi
);
export class FDCServiceEVMTransaction extends FDCServiceJson {
  async getDataAndStoreProof(data: any) {
    console.log("Data:", data, "\n");
    const abiEncodedRequest = data.abiEncodedRequest;
    const roundId = await this.submitAttestationRequest(abiEncodedRequest);
    const proof = await this.retrieveDataAndProof(abiEncodedRequest, roundId);

    const component =
      IEVMTransactionVerificationAbiInterface.fragments[0].inputs[0]
        .components![1];

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
