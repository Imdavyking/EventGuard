import { environment } from "../utils/config";

const { JQ_VERIFIER_URL_TESTNET, JQ_VERIFIER_API_KEY_TESTNET } = environment;
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
}

const base = new Base();

async function prepareAttestationRequest(
  apiUrl: string,
  postprocessJq: string,
  abiSignature: string
): Promise<{
  abiEncodedRequest: string;
}> {
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

const postprocessJq = `{
  flightId: (.flight_id // null),
  status: .status,
  reasonType: (.reason_for_delay.type // null),
  reasonDescription: (.reason_for_delay.description // null)
}`;

const abiSignature = ` {
    "components": [
      {
        "internalType": "string",
        "name": "status",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "reasonType",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      }
    ],
    "internalType": "struct FlightTicket.DataTransportObject",
    "name": "dto",
    "type": "tuple"
  }`;
// Configuration constants
const attestationTypeBase = "IJsonApi";
const sourceIdBase = "WEB2";
const verifierUrlBase = JQ_VERIFIER_URL_TESTNET;

export async function getJsonAttestation(flightId: string) {
  const apiUrl = `https://eventguard.onrender.com/api/flight/status/${flightId}`;
  const data = await prepareAttestationRequest(
    apiUrl,
    postprocessJq,
    abiSignature
  );
  return data;
}
