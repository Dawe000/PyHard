// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ISmartWallet {
    // Events
    event SubscriptionCreated(uint256 indexed subscriptionId, address indexed vendor, uint256 amount, uint256 interval);
    event SubscriptionCancelled(uint256 indexed subscriptionId);
    event SubscriptionPaymentExecuted(uint256 indexed subscriptionId, uint256 amount);
    
    event SubWalletCreated(uint256 indexed subWalletId, address indexed childEOA, uint256 limit, uint8 mode);
    event SubWalletLimitUpdated(uint256 indexed subWalletId, uint256 newLimit);
    event SubWalletPaused(uint256 indexed subWalletId);
    event SubWalletRevoked(uint256 indexed subWalletId);
    event SubWalletTransactionExecuted(uint256 indexed subWalletId, address indexed to, uint256 amount);
    
    event PYUSDBridged(uint256 amount, uint32 dstChainId, bytes32 indexed txHash);
    
    // Core execution functions
    function execute(address target, uint256 value, bytes calldata data) external;
    function executeBatch(address[] calldata targets, uint256[] calldata values, bytes[] calldata data) external;
    
    // Subscription functions
    function createSubscription(address vendor, uint256 amount, uint256 interval) external returns (uint256);
    function cancelSubscription(uint256 subscriptionId) external;
    function executeSubscriptionPayment(uint256 subscriptionId) external;
    
    // Sub-wallet functions
    function createSubWallet(address childEOA, uint256 limit, uint8 mode, uint256 period) external returns (uint256);
    function updateSubWalletLimit(uint256 subWalletId, uint256 newLimit) external;
    function pauseSubWallet(uint256 subWalletId) external;
    function revokeSubWallet(uint256 subWalletId) external;
    function executeSubWalletTransaction(uint256 subWalletId, address to, uint256 amount) external;
    
    // Bridge functions
    function bridgePYUSD(uint256 amount, uint32 dstChainId) external payable;
    
    // View functions
    function getSubscription(uint256 subscriptionId) external view returns (
        address vendor,
        uint256 amountPerInterval,
        uint256 interval,
        uint256 lastPayment,
        bool active
    );
    
    function getSubWallet(uint256 subWalletId) external view returns (
        address childEOA,
        uint256 spendingLimit,
        uint256 spentThisPeriod,
        uint256 periodStart,
        uint256 periodDuration,
        uint8 mode,
        bool active
    );
    
    function getSubscriptionCount() external view returns (uint256);
    function getSubWalletCount() external view returns (uint256);
}
