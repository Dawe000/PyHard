// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@account-abstraction/contracts/interfaces/IPaymaster.sol";

interface ICustomPaymaster is IPaymaster {
    // Events
    event WalletWhitelisted(address indexed wallet);
    event WalletRemoved(address indexed wallet);
    event Deposited(address indexed depositor, uint256 amount);
    event Withdrawn(address indexed withdrawer, uint256 amount);
    event RateLimitUpdated(uint256 newLimit);
    
    // Functions
    function deposit() external payable;
    function withdraw(uint256 amount) external;
    function addWallet(address wallet) external;
    function removeWallet(address wallet) external;
    function setRateLimit(uint256 newLimit) external;
    function setWhitelist(address[] calldata wallets, bool[] calldata status) external;
    
    // View functions
    function isWhitelisted(address wallet) external view returns (bool);
    function getRateLimit() external view returns (uint256);
    function getBalance() external view returns (uint256);
    function getOperationsCount(address wallet, uint256 hour) external view returns (uint256);
}
