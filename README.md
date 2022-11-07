# OpenSea Shared Storefront Backdoor Demo

This project demonstrates how OpenSea administrators can take any tokens minted on the OpenSea Shared Storefront. This is a previously-undocumented backdoor.

## Background

OpenSea Shared Storefront is an [ERC-1155](https://eips.ethereum.org/EIPS/eip-1155) contract deployed on Ethereum Mainnet at 0x495f947276749ce646f68ac8c248420045cb7b5e. The contract supports an OpenSea service where artists can sell NFTs without incurring gas fees. 

There [are about 1 million transactions](https://etherscan.io/txs?a=0x495f947276749ce646f68ac8c248420045cb7b5e) against this contract.

OpenSea administrators maintain control such that they can take, or freeze, NFTs created with this contract at any time. The contract's source code is not published and this control ability is not disclosed anywhere in OpenSea's terms of service or documentation.

OpenSea's level of control should be considered "signature authority" over the relevant assets. For US FinCen purposes, and other government bodies in the markets where OpenSea operates, this makes OpenSea administrators capable of executing civil asset seizures/forfeitures.

For more information about the potential implications, see [the full blog post](https://blog.phor.net/2022/11/04/Does-OpenSea-Shared-Storefront-have-a-backdoor.html).

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

4. Find the owner of that NFT. [The demonstration uses](./index.mjs)  `0xE34228f210354911c0FedAD9941c7Cfd269B9E91`, change it if you like or if anybody else receives the NFT from Step 3.

### Execute

In one terminal window, execute Hardhat per below. This will allow you to locally try transactions on behalf of OpenSea administrators even though you don't know their private keys.

```sh
npx hardhat node --fork https://mainnet.infura.io/v3/xxxxYOURxKEYxxxx
```

In a second terminal window, execute the demonstration transactions:

```sh
node index.mjs
```

You should see some information printed, the current and new owner for the token and logs for the transfer. This demonstrates that the token was transferred.

Example output:

```
Storefront (ERC-1155): 0x495f947276749ce646f68ac8c248420045cb7b5e
Contract owner:        0xC669B5F25F03be2ac0323037CB57f49eB543657a
Token ID:              46038921131323814396335747090004559834868014221610645288463784344990987059201
Token owner:           0xE34228f210354911c0FedAD9941c7Cfd269B9E91
Proxy registry stub:   0x20348916e39f3fc0E44338745b1bf1d6b57bcdDC
Sender balance:        1
Recipient balance:     0
Transaction hash:      0x70a589322708fba40c9816a089e78cab3628d8c3030e64b9fdee55d07c7cef97
Transaction logs:      [
  {
    transactionIndex: 0,
    blockNumber: 15898730,
    transactionHash: '0x70a589322708fba40c9816a089e78cab3628d8c3030e64b9fdee55d07c7cef97',
    address: '0x495f947276749Ce646f68AC8c248420045cb7b5e',
    topics: [
      '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62',
      '0x000000000000000000000000c669b5f25f03be2ac0323037cb57f49eb543657a',
      '0x000000000000000000000000e34228f210354911c0fedad9941c7cfd269b9e91',
      '0x000000000000000000000000aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
    ],
    data: '0x65c91b1e502d798939f9f75d4710895e6315df770000000000013800000000010000000000000000000000000000000000000000000000000000000000000001',
    logIndex: 0,
    blockHash: '0x8edd5c489335ed9411724af5f0e9a565edd9b93e9ed306450d575ae8efd8268e'
  }
]
Sender balance:        0
Recipient balance:     1
```

If OpenSea administrators run this same transaction with their real private key on the Mainnet network then this token would be transferred for real. (What you are seeing is a local copy of this transaction which ignores the fact that it is invalid for want of the correct private key.)

The above is a brief simplification. OpenSea Shared Storefront administration privilege has recently changed from a single owner to a [Gnosis safe](https://gnosis.io/safe/). No difference, to execute this transaction OpenSea administrators need to use only a slightly different process.

### Debugging

Feel free to hack and try other things with this project. I learned about OpenSea Shared Storefront by decompiling it, printing in a word processor and using highlighters. Another helpful technique is to inspect transaction storage access and internal calls. To try that you can use a third terminal to run:

```sh
npx hardhat trace --fulltrace --rpc http://127.0.0.1:8545/ --hash 0xxxxxYOURxTRANSACTIONxHASHxxxx 
```

### So what about OFAC/SDN compliance?

See [the full blog post](https://blog.phor.net/2022/11/04/Does-OpenSea-Shared-Storefront-have-a-backdoor.html), which mentions this.

## Acknowledgements

- Contract decompilation (easier than reading straight bytecode) provided by https://ethervm.io/decompile.
- Tracing each `SLOAD` and `STATICCALL` while playing with contracts provided by [@sohamzemse](https://twitter.com/sohamzemse) in [hardhat-tracer](https://github.com/zemse/hardhat-tracer), running on [@HardhatHQ](https://twitter.com/HardhatHQ) [Hardhat](https://hardhat.org/).
