const hre = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);

    // Deploy token
    const Token = await ethers.getContractFactory("ElizaToken");
    const token = await Token.deploy();
    await token.waitForDeployment();
    const tokenAddress = await token.getAddress();
    console.log("Token deployed to:", tokenAddress);

    // Deploy timelock
    const Timelock = await ethers.getContractFactory("ElizaTimelock");
    const timelock = await Timelock.deploy(
        3600, // 1 hour delay
        [deployer.address], // proposers
        [deployer.address], // executors
        deployer.address // admin
    );
    await timelock.waitForDeployment();
    const timelockAddress = await timelock.getAddress();
    console.log("Timelock deployed to:", timelockAddress);

    // Deploy Governor
    const Governor = await ethers.getContractFactory("ElizaGovernor");
    const governor = await Governor.deploy(tokenAddress);
    await governor.waitForDeployment();
    const governorAddress = await governor.getAddress();
    console.log("Governor deployed to:", governorAddress);

    console.log("Deployment complete!");
    console.log({
        token: tokenAddress,
        timelock: timelockAddress,
        governor: governorAddress
    });
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
