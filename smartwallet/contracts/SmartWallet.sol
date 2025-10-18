// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
// Simplified imports for testing
import "./interfaces/ISmartWallet.sol";
import "./interfaces/IPYUSD.sol";

contract SmartWallet is ISmartWallet, Ownable, ReentrancyGuard {
    using ECDSA for bytes32;
    
    // Constants
    uint256 private constant NONCE_MASK = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;
    
    // State variables
    address private immutable _entryPoint;
    IPYUSD public immutable pyusd;
    address public immutable factory;
    
    // Subscription system
    struct Subscription {
        address vendor;
        uint256 amountPerInterval;
        uint256 interval;
        uint256 lastPayment;
        bool active;
    }
    
    mapping(uint256 => Subscription) public subscriptions;
    uint256 public subscriptionCount;
    uint256 private _nextSubscriptionId = 1;
    
    // Sub-wallet system
    enum SubWalletMode {
        ALLOWANCE,
        POCKET_MONEY
    }
    
    struct SubWallet {
        address childEOA;
        uint256 spendingLimit;
        uint256 spentThisPeriod;
        uint256 periodStart;
        uint256 periodDuration;
        SubWalletMode mode;
        bool active;
    }
    
    mapping(uint256 => SubWallet) public subWallets;
    uint256 public subWalletCount;
    uint256 private _nextSubWalletId = 1;
    
    // Events (inherited from interface)
    
    constructor(
        address entryPoint_,
        IPYUSD _pyusd,
        address _factory,
        address _owner
    ) Ownable(_owner) {
        _entryPoint = entryPoint_;
        pyusd = _pyusd;
        factory = _factory;
    }
    
    // Simplified implementation for testing
    
    // Core execution functions
    function execute(address target, uint256 value, bytes calldata data) external onlyOwner {
        _execute(target, value, data);
    }
    
    function executeBatch(address[] calldata targets, uint256[] calldata values, bytes[] calldata data) external onlyOwner {
        require(targets.length == values.length && targets.length == data.length, "Array length mismatch");
        
        for (uint256 i = 0; i < targets.length; i++) {
            _execute(targets[i], values[i], data[i]);
        }
    }
    
    function _execute(address target, uint256 value, bytes memory data) internal {
        (bool success, bytes memory result) = target.call{value: value}(data);
        if (!success) {
            assembly {
                returndatacopy(0, 0, returndatasize())
                revert(0, returndatasize())
            }
        }
    }
    
    // Subscription functions
    function createSubscription(address vendor, uint256 amount, uint256 interval) external onlyOwner returns (uint256) {
        require(vendor != address(0), "Invalid vendor");
        require(amount > 0, "Amount must be positive");
        require(interval > 0, "Interval must be positive");
        
        uint256 subscriptionId = _nextSubscriptionId++;
        subscriptions[subscriptionId] = Subscription({
            vendor: vendor,
            amountPerInterval: amount,
            interval: interval,
            lastPayment: block.timestamp,
            active: true
        });
        
        subscriptionCount++;
        
        emit SubscriptionCreated(subscriptionId, vendor, amount, interval);
        return subscriptionId;
    }
    
    function cancelSubscription(uint256 subscriptionId) external onlyOwner {
        require(subscriptionId > 0 && subscriptionId < _nextSubscriptionId, "Invalid subscription ID");
        require(subscriptions[subscriptionId].active, "Subscription not active");
        
        subscriptions[subscriptionId].active = false;
        subscriptionCount--;
        
        emit SubscriptionCancelled(subscriptionId);
    }
    
    function executeSubscriptionPayment(uint256 subscriptionId) external nonReentrant {
        require(subscriptionId > 0 && subscriptionId < _nextSubscriptionId, "Invalid subscription ID");
        
        Subscription storage subscription = subscriptions[subscriptionId];
        require(subscription.active, "Subscription not active");
        require(msg.sender == subscription.vendor, "Only vendor can execute payment");
        require(block.timestamp >= subscription.lastPayment + subscription.interval, "Payment interval not met");
        
        uint256 amount = subscription.amountPerInterval;
        require(pyusd.balanceOf(address(this)) >= amount, "Insufficient PYUSD balance");
        
        subscription.lastPayment = block.timestamp;
        
        require(pyusd.transfer(subscription.vendor, amount), "PYUSD transfer failed");
        
        emit SubscriptionPaymentExecuted(subscriptionId, amount);
    }
    
    // Sub-wallet functions
    function createSubWallet(address childEOA, uint256 limit, uint8 mode, uint256 period) external onlyOwner returns (uint256) {
        require(childEOA != address(0), "Invalid child EOA");
        require(limit > 0, "Limit must be positive");
        require(mode <= 1, "Invalid mode");
        require(period > 0, "Period must be positive");
        
        uint256 subWalletId = _nextSubWalletId++;
        subWallets[subWalletId] = SubWallet({
            childEOA: childEOA,
            spendingLimit: limit,
            spentThisPeriod: 0,
            periodStart: block.timestamp,
            periodDuration: period,
            mode: SubWalletMode(mode),
            active: true
        });
        
        subWalletCount++;
        
        emit SubWalletCreated(subWalletId, childEOA, limit, mode);
        return subWalletId;
    }
    
    function updateSubWalletLimit(uint256 subWalletId, uint256 newLimit) external onlyOwner {
        require(subWalletId > 0 && subWalletId < _nextSubWalletId, "Invalid sub-wallet ID");
        require(subWallets[subWalletId].active, "Sub-wallet not active");
        require(newLimit > 0, "Limit must be positive");
        
        subWallets[subWalletId].spendingLimit = newLimit;
        
        emit SubWalletLimitUpdated(subWalletId, newLimit);
    }
    
    function pauseSubWallet(uint256 subWalletId) external onlyOwner {
        require(subWalletId > 0 && subWalletId < _nextSubWalletId, "Invalid sub-wallet ID");
        require(subWallets[subWalletId].active, "Sub-wallet not active");
        
        subWallets[subWalletId].active = false;
        
        emit SubWalletPaused(subWalletId);
    }
    
    function revokeSubWallet(uint256 subWalletId) external onlyOwner {
        require(subWalletId > 0 && subWalletId < _nextSubWalletId, "Invalid sub-wallet ID");
        
        subWallets[subWalletId].active = false;
        subWallets[subWalletId].spendingLimit = 0;
        
        emit SubWalletRevoked(subWalletId);
    }
    
    function executeSubWalletTransaction(uint256 subWalletId, address to, uint256 amount) external {
        require(subWalletId > 0 && subWalletId < _nextSubWalletId, "Invalid sub-wallet ID");
        require(msg.sender == subWallets[subWalletId].childEOA, "Only child EOA can execute");
        require(subWallets[subWalletId].active, "Sub-wallet not active");
        require(to != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be positive");
        
        SubWallet storage subWallet = subWallets[subWalletId];
        
        // Check if period needs to be reset
        if (block.timestamp >= subWallet.periodStart + subWallet.periodDuration) {
            subWallet.periodStart = block.timestamp;
            subWallet.spentThisPeriod = 0;
            
            // Handle pocket money mode
            if (subWallet.mode == SubWalletMode.POCKET_MONEY) {
                uint256 pocketMoneyAmount = subWallet.spendingLimit;
                require(pyusd.balanceOf(address(this)) >= pocketMoneyAmount, "Insufficient PYUSD for pocket money");
                require(pyusd.transfer(subWallet.childEOA, pocketMoneyAmount), "Pocket money transfer failed");
            }
        }
        
        // Check spending limit
        require(subWallet.spentThisPeriod + amount <= subWallet.spendingLimit, "Exceeds spending limit");
        
        // Execute transaction
        require(pyusd.balanceOf(address(this)) >= amount, "Insufficient PYUSD balance");
        require(pyusd.transfer(to, amount), "PYUSD transfer failed");
        
        subWallet.spentThisPeriod += amount;
        
        emit SubWalletTransactionExecuted(subWalletId, to, amount);
    }
    
    // Bridge functions (placeholder for LayerZero integration)
    function bridgePYUSD(uint256 amount, uint32 dstChainId) external payable onlyOwner {
        // TODO: Implement LayerZero bridge integration
        // For now, just emit event
        emit PYUSDBridged(amount, dstChainId, keccak256(abi.encodePacked(amount, dstChainId, block.timestamp)));
    }
    
    // View functions
    function getSubscription(uint256 subscriptionId) external view returns (
        address vendor,
        uint256 amountPerInterval,
        uint256 interval,
        uint256 lastPayment,
        bool active
    ) {
        Subscription memory subscription = subscriptions[subscriptionId];
        return (
            subscription.vendor,
            subscription.amountPerInterval,
            subscription.interval,
            subscription.lastPayment,
            subscription.active
        );
    }
    
    function getSubWallet(uint256 subWalletId) external view returns (
        address childEOA,
        uint256 spendingLimit,
        uint256 spentThisPeriod,
        uint256 periodStart,
        uint256 periodDuration,
        uint8 mode,
        bool active
    ) {
        SubWallet memory subWallet = subWallets[subWalletId];
        return (
            subWallet.childEOA,
            subWallet.spendingLimit,
            subWallet.spentThisPeriod,
            subWallet.periodStart,
            subWallet.periodDuration,
            uint8(subWallet.mode),
            subWallet.active
        );
    }
    
    function getSubscriptionCount() external view returns (uint256) {
        return subscriptionCount;
    }
    
    function getSubWalletCount() external view returns (uint256) {
        return subWalletCount;
    }
    
    // Receive ETH
    receive() external payable {}
}
