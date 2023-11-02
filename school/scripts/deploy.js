// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
 


  const Land = await hre.ethers.deployContract("Land");
  const LandProcess = await hre.ethers.deployContract("LandProcess")

  const land = await Land.waitForDeployment();
  const landProcess = await LandProcess.waitForDeployment();

  console.log(`land contract was deployed to ${land.target}`);
 console.log(`\n land Process contract was deployed to ${landProcess.target}`);

  saveFrontendFiles(land , "Land");
  saveFrontendFiles(landProcess , "LandProcess");
}
function saveFrontendFiles(contract, name) {
  const fs = require("fs");
  const contractsDir = __dirname + "/../frontend/src/contractsData";

  

  fs.writeFileSync(
    contractsDir + `/${name}-address.json`,
    JSON.stringify({ address: contract.target }, undefined, 2)
  );

  const contractArtifact = artifacts.readArtifactSync(name);

  fs.writeFileSync(
    contractsDir + `/${name}.json`,
    JSON.stringify(contractArtifact, null, 2)
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
