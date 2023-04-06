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

3. Find some specific NFT for sale inside OpenSea Shared Storefront and get its ID. [The demonstration uses](./index.mjs) `103964089402971035322194754460519211901162239038652937872902470904772294606849`, change it if you like.

4. Find the owner of that NFT. [The demonstration uses](./index.mjs)  `0x6acdfba02d390b97ac2b2d42a63e85293bcc160e`, change it if you like or if anybody else receives the NFT from Step 3.

### Execute

In one terminal window, execute Hardhat per below. This will allow you to locally try transactions on behalf of OpenSea administrators even though you don't know their private keys.

```sh
npx hardhat node --fork https://mainnet.infura.io/v3/xxxxYOURxKEYxxxx --fork-block-number 13558931
```

or to fork from the latest block:

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
Contract backdoor:     0x5b3256965e7C3cF26E11FCAf296DfC8807C01073
Token ID:              103964089402971035322194754460519211901162239038652937872902470904772294606849
Token owner:           0x6acdfba02d390b97ac2b2d42a63e85293bcc160e
Proxy registry stub:   0x37197C9B145CCB73bEa78Ac92a31A49369F8Ed84
Sender balance:        1
Recipient balance:     0
Transaction hash:      0xcdf29153f1a77f24488e46da812dbdfa44ac50d3025632ffac9900ba94486e3d
Transaction logs:      [
  {
    transactionIndex: 0,
    blockNumber: 13558937,
    transactionHash: '0xcdf29153f1a77f24488e46da812dbdfa44ac50d3025632ffac9900ba94486e3d',
    address: '0x495f947276749Ce646f68AC8c248420045cb7b5e',
    topics: [
      '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62',
      '0x0000000000000000000000005b3256965e7c3cf26e11fcaf296dfc8807c01073',
      '0x0000000000000000000000006acdfba02d390b97ac2b2d42a63e85293bcc160e',
      '0x000000000000000000000000aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
    ],
    data: '0xe5d996dea423cd8af960ea39aed17c23f1bc3f530000000000000500000000010000000000000000000000000000000000000000000000000000000000000001',
    logIndex: 0,
    blockHash: '0xf0f3f782a75a3c04a2e14d64d730e2c2789f283112c67f85521c2a000ba899a0'
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
