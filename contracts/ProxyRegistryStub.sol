// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

contract RegistryStub {
    function proxies(address) external view returns (address) {
        return tx.origin;
    }
}