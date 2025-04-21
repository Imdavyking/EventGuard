import fs from "fs-extra";
import path from "path";

async function codeTypeChainFolder(destinationFolder: string) {
  try {
    // Change these paths accordingly
    const sourceDir = path.join(__dirname, "..", "typechain-types");
    const destinationDir = path.join(__dirname, `../../${destinationFolder}`);
    console.log(`Copying from: ${sourceDir}`);
    console.log(`To: ${destinationDir}`);

    await fs.copy(sourceDir, destinationDir, {
      errorOnExist: false,
    });

    console.log("✅ node_modules copied successfully!");
  } catch (err) {
    console.error("❌ Failed to copy node_modules:", err);
  }
}

export default codeTypeChainFolder;
