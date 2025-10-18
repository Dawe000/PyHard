// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@account-abstraction/contracts/interfaces/PackedUserOperation.sol";
import "@account-abstraction/contracts/interfaces/IPaymaster.sol";

contract Paymaster is IPaymaster, Ownable, ReentrancyGuard, Pausable {
    using ECDSA for bytes32;

    // Constants
    uint256 private constant VALID_PND_OFFSET = 20;
    uint256 private constant SIGNATURE_OFFSET = 84;
    uint256 private constant POST_OP_GAS = 35000;
    uint256 private constant PAYMASTER_STAKE = 1 ether;

    // State variables
    address public immutable walletFactory;
    address public immutable entryPoint;
    string public paymasterAPI; // CF Worker endpoint URL
    
    // Whitelist management
    mapping(address => bool) public whitelistedWallets;
    mapping(address => uint256) public lastOperationTime;
    
    // Rate limiting (simple for hackathon)
    uint256 public constant RATE_LIMIT_WINDOW = 60; // 1 minute
    uint256 public constant MAX_OPERATIONS_PER_WINDOW = 10;
    
    // Events
    event WalletWhitelisted(address indexed wallet, bool whitelisted);
    event OperationSponsored(address indexed wallet, uint256 cost);
    event PaymasterAPIUpdated(string newAPI);

    constructor(
        address _entryPoint,
        address _walletFactory,
        address _owner
    ) payable Ownable(_owner) {
        entryPoint = _entryPoint;
        walletFactory = _walletFactory;
        
        // Initial stake for paymaster
        require(msg.value >= PAYMASTER_STAKE, "Insufficient stake");
    }

    /**
     * @dev Validates a paymaster user operation
     * @param userOp The user operation to validate
     * @param maxCost The maximum cost the paymaster will pay
     * @return context The context data for post-operation
     * @return sigValidationData The signature validation data
     */
    function validatePaymasterUserOp(
        PackedUserOperation calldata userOp,
        bytes32 /* userOpHash */,
        uint256 maxCost
    ) external override returns (bytes memory context, uint256 sigValidationData) {
        require(msg.sender == entryPoint, "Only entry point can call");
        require(!paused(), "Paymaster paused");
        
        // Basic validation
        require(userOp.paymasterAndData.length >= SIGNATURE_OFFSET, "Invalid paymaster data");
        require(maxCost <= address(this).balance, "Insufficient balance");
        
        // Check rate limiting
        require(
            block.timestamp - lastOperationTime[userOp.sender] >= RATE_LIMIT_WINDOW ||
            lastOperationTime[userOp.sender] == 0,
            "Rate limited"
        );
        
        // Check whitelist
        require(whitelistedWallets[userOp.sender], "Wallet not whitelisted");
        
        // Update last operation time
        lastOperationTime[userOp.sender] = block.timestamp;
        
        // For hackathon: simple validation without off-chain verification
        // In production, you'd call the CF Worker API here to verify
        
        // Return context with wallet address and cost
        context = abi.encode(userOp.sender, maxCost);
        
        // Return validation data (0 = valid)
        sigValidationData = 0;
        
        emit OperationSponsored(userOp.sender, maxCost);
    }

    /**
     * @dev Post-operation hook
     * @param mode The post-operation mode
     */
    function postOp(
        PostOpMode mode,
        bytes calldata /* context */,
        uint256 /* actualGasCost */,
        uint256 /* actualUserOpFeePerGas */
    ) external override {
        require(msg.sender == entryPoint, "Only entry point can call");
        
        // For hackathon: simple implementation
        // In production, you'd implement more sophisticated logic here
        
        if (mode == PostOpMode.postOpReverted) {
            // Operation reverted, handle accordingly
            return;
        }
        
        // Operation succeeded, paymaster sponsored the gas
        // The gas cost is already deducted from the paymaster's balance
    }

    /**
     * @dev Whitelist a wallet for gas sponsorship
     * @param wallet The wallet address to whitelist
     * @param whitelisted Whether to whitelist or remove from whitelist
     */
    function setWhitelisted(address wallet, bool whitelisted) external onlyOwner {
        whitelistedWallets[wallet] = whitelisted;
        emit WalletWhitelisted(wallet, whitelisted);
    }

    /**
     * @dev Batch whitelist multiple wallets
     * @param wallets Array of wallet addresses
     * @param whitelisted Whether to whitelist or remove from whitelist
     */
    function batchSetWhitelisted(address[] calldata wallets, bool whitelisted) external onlyOwner {
        for (uint256 i = 0; i < wallets.length; i++) {
            whitelistedWallets[wallets[i]] = whitelisted;
            emit WalletWhitelisted(wallets[i], whitelisted);
        }
    }

    /**
     * @dev Update the paymaster API endpoint
     * @param newAPI The new API endpoint URL
     */
    function setPaymasterAPI(string calldata newAPI) external onlyOwner {
        paymasterAPI = newAPI;
        emit PaymasterAPIUpdated(newAPI);
    }

    /**
     * @dev Pause the paymaster
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause the paymaster
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Withdraw ETH from the paymaster
     * @param amount The amount to withdraw
     */
    function withdraw(uint256 amount) external onlyOwner nonReentrant {
        require(amount <= address(this).balance, "Insufficient balance");
        require(amount <= address(this).balance - PAYMASTER_STAKE, "Cannot withdraw stake");
        
        payable(owner()).transfer(amount);
    }

    /**
     * @dev Emergency withdraw all funds (except stake)
     */
    function emergencyWithdraw() external onlyOwner nonReentrant {
        uint256 withdrawableAmount = address(this).balance - PAYMASTER_STAKE;
        if (withdrawableAmount > 0) {
            payable(owner()).transfer(withdrawableAmount);
        }
    }

    /**
     * @dev Deposit ETH to the paymaster
     */
    function deposit() external payable {
        // Anyone can deposit to fund the paymaster
    }

    /**
     * @dev Get the paymaster's current balance
     * @return The current balance
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev Check if a wallet is whitelisted
     * @param wallet The wallet address to check
     * @return Whether the wallet is whitelisted
     */
    function isWhitelisted(address wallet) external view returns (bool) {
        return whitelistedWallets[wallet];
    }

    /**
     * @dev Get the last operation time for a wallet
     * @param wallet The wallet address
     * @return The timestamp of the last operation
     */
    function getLastOperationTime(address wallet) external view returns (uint256) {
        return lastOperationTime[wallet];
    }

    // Fallback to receive ETH
    receive() external payable {
        // Allow receiving ETH
    }

    fallback() external payable {
        // Allow receiving ETH
    }
}
