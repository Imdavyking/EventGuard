import { useState } from "react";
import {
  mintUSDCFlare,
  mintUSDCSepolia,
} from "../../services/blockchain.services";

const Mint = () => {
  const [loadingFlare, setLoadingFlare] = useState(false);
  const [loadingSepolia, setLoadingSepolia] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleMint = async (
    mintFunc: () => Promise<string>,
    setLoading: (b: boolean) => void
  ) => {
    setLoading(true);
    setResult(null);
    const response = await mintFunc();
    setResult(response);
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto mt-12 p-6 bg-white shadow-lg rounded-xl space-y-6 text-center">
      <h2 className="text-2xl font-bold text-blue-600">Mint Test USDC</h2>
      <p className="text-gray-600">
        Click a button to mint <strong>10 USDC</strong> tokens to your wallet on
        a testnet.
      </p>

      <div className="flex justify-center flex-wrap gap-4">
        <button
          onClick={() => handleMint(mintUSDCFlare, setLoadingFlare)}
          disabled={loadingFlare}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loadingFlare ? "Minting on Flare..." : "Mint on Flare"}
        </button>
        <button
          onClick={() => handleMint(mintUSDCSepolia, setLoadingSepolia)}
          disabled={loadingSepolia}
          className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loadingSepolia ? "Minting on Sepolia..." : "Mint on Sepolia"}
        </button>
      </div>

      {result && (
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded text-sm text-left text-gray-800">
          <span className="font-semibold">Result:</span>
          <pre className="whitespace-pre-wrap break-words mt-2">{result}</pre>
        </div>
      )}
    </div>
  );
};

export default Mint;
