# OpenSea Shared Storefront Backdoor Demo

This project demonstrates how OpenSea administrators can take any of your tokens which were minted on the OpenSea Shared Storefront. This is a previously-undocumented backdoor.

## Background

OpenSea Shared Storefront is an ERC-1155 contract deployed on Ethereum Mainnet at 0x495f947276749ce646f68ac8c248420045cb7b5e.

There [are about 1 million transactions](https://etherscan.io/txs?a=0x495f947276749ce646f68ac8c248420045cb7b5e) against this contract.

OpenSea administrators maintain control over this contract such that they can take, or freeze, anybody's NFT at any time. The contract's source code is not published and this control ability is not disclosed anywhere in OpenSea's terms of service or documentation.

OpenSea's level of control should be considered "signature authority" over the assets, for US FinCen purposes and this makes OpenSea administrators capable of executing civil asset seizures/forfeitures requested by governments.

## Demonstration

This project allows you to make a live copy of Ethereum Mainnet, execute some transactions as if you were OpenSea (even though you don't know their private key) and examine the outcomes.

### Setup

1. Install Yarn.
   ```sh
   yarn install
   ```

2. Get access to an Ethereum Mainnet JSON-RPC provider, I recommend Infura.

   > https://infura.io/

3. Find some specific NFT for sale inside OpenSea Shared Storefront and get its ID. [The demonstration uses](./index.mjs) `46038921131323814396335747090004559834868014221610645288463784344990987059201`, change it if you like.

4. Find the owner of that NFT. [The demonstration uses](./index.mjs)  `0xE34228f210354911c0FedAD9941c7Cfd269B9E91`, change it if you like and if anybody new gets that NFT.

### Execute

In one terminal window, execute Hardhat like. This will allow you to locally try transactions on behalf of OpenSea administrators even though you don't know their private keys.

```sh
npx hardhat node --fork https://mainnet.infura.io/v3/xxxxYOURxKEYxxxx
```

In a second terminal window, execute the demonstration transactions:

```sh
node index.mjs
```

You should see some information printed, the current and new owner for the token and logs for the transfer. This demonstrates that the token was transferred.

If OpenSea administrators run this same transaction with their real private key on the Mainnet network then this token would be transferred for real. (What you are seeing is a local copy of this transaction which ignores the fact that it is invalid for want of the correct private key.)

The above paragraph is a brief simplification. OpenSea Shared Storefront has recently changed from a single owner, to a Gnosis safe. No difference, to execute this transaction OpenSea administrators need to use only a slightly different process.

### Debugging

Feel free to hack and try other things with this project. I learned about OpenSea Shared Storefront by decompiling it, printing in a word processor and using highlighters. Another helpful tool is to inspect transaction storage access and internal calls. To try that you can use a third terminal to run like:

```sh
npx hardhat trace --fulltrace --rpc http://127.0.0.1:8545/ --hash 0xxxxxYOURxTRANSACTIONxHASHxxxx 
```

### So what about OFAC/SDN compliance?

See [the full blog post](https://blog.phor.net/2022/11/04/Does-OpenSea-Shared-Storefront-have-a-backdoor.html) which mentions this.

## Acknowledgements

- Contract decompilation (easier than reading straight bytecode) provided by https://ethervm.io/decompile.
- Tracing each `SLOAD` and `STATICCALL` while playing with contracts provided by [@sohamzemse](https://twitter.com/sohamzemse) in [hardhat-tracer](https://github.com/zemse/hardhat-tracer), running on [@HardhatHQ](https://twitter.com/HardhatHQ) [Hardhat](https://hardhat.org/).