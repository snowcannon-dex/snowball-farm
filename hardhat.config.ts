import { task } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import "solidity-coverage";
import "@nomiclabs/hardhat-ethers";
import "hardhat-deploy-ethers";
// Bring your own
import { config } from "./.config";

const testAccount = config.testAccount;

// This is a sample Buidler task. To learn how to create your own go to
// https://buidler.dev/guides/create-task.html
task("accounts", "Prints the list of accounts", async (args, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(await account.getAddress());
  }
});

task(
  "blockNumber",
  "Prints the current block number",
  async (_, { ethers }) => {
    await ethers.provider.getBlockNumber().then((blockNumber) => {
      console.log("Current block number: " + blockNumber);
    });
  }
);

task("faucet", "Send eth to target", async (_, { ethers }) => {
  const accounts = await ethers.getSigners();
  //@ts-ignore
  const amount = ethers.constants.WeiPerEther.div(100);
  const tx2 = await accounts[0].sendTransaction({
    to: testAccount,
    value: amount,
  });
  await tx2.wait();

  console.log(
    `Balance of ${testAccount} = ${await ethers.provider.getBalance(
      testAccount
    )}`
  );
});

task("snowfaucet", "Send snow to target", async (_, { ethers }) => {
  const accounts = await ethers.getSigners();
  //@ts-ignore
  const amount = ethers.constants.WeiPerEther.div(100);

  const snowBallTokenFactory = await ethers.getContractFactory("SnowballToken");
  //const snowBallToken =
});

task("deploy", "Deploy the whole thing", async (_, { ethers }) => {
  const accounts = await ethers.getSigners();

  const snowBallTokenFactory = await ethers.getContractFactory("SnowballToken");
  const snowBallToken = await snowBallTokenFactory.deploy();
  await snowBallToken.deployed();
  console.log("Snowballtoken deployed to:", snowBallToken.address);

  const initialMintTx = await snowBallToken.mentos(
    testAccount,
    ethers.constants.WeiPerEther.mul(1000000)
  );
  await initialMintTx.wait();

  console.log(
    `Snowbalance of ${testAccount} ${await snowBallToken.balanceOf(
      testAccount
    )}`
  );

  const syrupFactory = await ethers.getContractFactory("SyrupBar");
  const syrupBar = await syrupFactory.deploy(snowBallToken.address);
  await syrupBar.deployed();
  console.log("Syrupbar deployed to:", syrupBar.address);

  const snowCannonFactory = await ethers.getContractFactory("SnowCannon");
  const snowCannon = await snowCannonFactory.deploy(
    snowBallToken.address,
    syrupBar.address,
    accounts[0].address,
    200,
    5
  );
  await snowCannon.deployed();

  console.log("Snowcannon deployed to:", snowCannon.address);
});

require("@nomiclabs/hardhat-truffle5");

// You have to export an object to set up your config
// This object can have the following optional entries:
// defaultNetwork, networks, solc, and paths.
// Go to https://buidler.dev/config/ to learn more
module.exports = {
  // This is a sample solc configuration that specifies which version of solc to use
  solidity: {
    version: "0.6.12",
    optimizer: {
      enabled: true,
      runs: 200,
    },
  },

  networks: {
    testnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      chainId: 97,
      gasPrice: 20000000000,
      accounts: {
        mnemonic: config.testSeed,
      },
    },
    hardhat: {},
    development: {
      url: "http://127.0.0.1:7545",
      port: 7545,
      network_id: "101",
    },
    test: {
      url: "http://127.0.0.1:7545",
      port: 7545,
      network_id: "*",
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
