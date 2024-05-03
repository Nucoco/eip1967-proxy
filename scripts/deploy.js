// deploy.js
async function main() {
  // logic1: bankV1
  const bankV1ContractFactory = await hre.ethers.getContractFactory("BankV1");
  const bankV1 = await bankV1ContractFactory.deploy();
  await bankV1.waitForDeployment();
  const bankV1Addr = await bankV1.getAddress();
  console.log("Bank1:", bankV1Addr);

  // storage: upgradeProxy
  const proxyContractFactory = await hre.ethers.getContractFactory("UpgradeProxy");
  const proxy = await proxyContractFactory.deploy(bankV1Addr);
  await proxy.waitForDeployment();
  const proxyAddr = await proxy.getAddress();
  console.log("Proxy:", proxyAddr);

  // call setName via Proxy
  const [signer] = await hre.ethers.getSigners();
  const iface = bankV1.interface;
  // const iface = new hre.ethers.Interface(["function setName(string newName)", "function deposit() payable"]);
  // console.log(iface)

  let abiEncodedCall;
  abiEncodedCall = iface.encodeFunctionData("setName", [ "piggy bank" ]);
	console.log(`calldate of setName: ${abiEncodedCall}`)

  const tx = await signer.sendTransaction({
    to: proxyAddr,
    data: abiEncodedCall,
  });
  console.log("Tx Hash:", tx.hash);

  // getname
  // console.log('bankV1.name: ', await bankV1.name());
  // console.log('proxy.name: ', await proxy.callStatic.name());
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});