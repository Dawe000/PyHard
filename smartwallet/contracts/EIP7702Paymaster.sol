// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title EIP7702Paymaster
 * @notice Paymaster for sponsoring EIP-7702 delegated EOA transactions
 * @dev This is different from ERC-4337 paymaster - it sponsors regular transactions from EOAs
 *      that have delegated their code to EOADelegation contract
 */
contract EIP7702Paymaster is Ownable, ReentrancyGuard, Pausable {
    // Events
    event TransactionSponsored(
        address indexed eoa,
        address indexed target,
        uint256 gasUsed,
        uint256 gasCost,
        address indexed relayer
    );
    
    event RelayerAdded(address indexed relayer);
    event RelayerRemoved(address indexed relayer);
    event FundsDeposited(address indexed depositor, uint256 amount);
    event FundsWithdrawn(address indexed recipient, uint256 amount);
    event EOAWhitelisted(address indexed eoa, bool whitelisted);

    // Errors
    error InsufficientBalance();
    error UnauthorizedRelayer();
    error EOANotWhitelisted();
    error InvalidAmount();
    error TransferFailed();

    // Authorized relayers (e.g., our CF Worker)
    mapping(address => bool) public authorizedRelayers;
    
    // Whitelisted EOAs that can receive sponsorship
    mapping(address => bool) public whitelistedEOAs;
    
    // Track gas usage per EOA for rate limiting
    mapping(address => uint256) public totalGasSponsored;
    mapping(address => uint256) public lastSponsorshipTime;
    
    // Rate limiting parameters
    uint256 public maxGasPerDay = 1000000; // 1M gas per day per EOA
    uint256 public minTimeBetweenTx = 1; // 1 second between transactions

    constructor() Ownable(msg.sender) payable {}

    /**
     * @notice Sponsor a transaction by refunding the relayer
     * @dev Called by authorized relayer after executing a transaction
     * @param eoa The EOA whose transaction was sponsored
     * @param target The target contract that was called
     * @param gasUsed Amount of gas used
     * @param gasPrice Gas price of the transaction
     */
    function sponsorTransaction(
        address eoa,
        address target,
        uint256 gasUsed,
        uint256 gasPrice
    ) external nonReentrant whenNotPaused {
        // Verify relayer is authorized
        if (!authorizedRelayers[msg.sender]) {
            revert UnauthorizedRelayer();
        }

        // Verify EOA is whitelisted
        if (!whitelistedEOAs[eoa]) {
            revert EOANotWhitelisted();
        }

        // Check rate limiting
        if (block.timestamp < lastSponsorshipTime[eoa] + minTimeBetweenTx) {
            revert("Rate limit exceeded");
        }

        // Calculate refund amount
        uint256 gasCost = gasUsed * gasPrice;
        
        // Check if we have enough balance
        if (address(this).balance < gasCost) {
            revert InsufficientBalance();
        }

        // Update tracking
        totalGasSponsored[eoa] += gasUsed;
        lastSponsorshipTime[eoa] = block.timestamp;

        // Refund the relayer
        (bool success, ) = msg.sender.call{value: gasCost}("");
        if (!success) {
            revert TransferFailed();
        }

        emit TransactionSponsored(eoa, target, gasUsed, gasCost, msg.sender);
    }

    /**
     * @notice Pre-approve a transaction for sponsorship
     * @dev Called by CF Worker before submitting transaction to verify it will be sponsored
     * @param eoa The EOA requesting sponsorship
     * @param estimatedGas Estimated gas for the transaction
     * @return approved Whether the transaction is approved for sponsorship
     * @return reason Reason if not approved
     */
    function preApproveTransaction(
        address eoa,
        uint256 estimatedGas
    ) external view returns (bool approved, string memory reason) {
        // Check if EOA is whitelisted
        if (!whitelistedEOAs[eoa]) {
            return (false, "EOA not whitelisted");
        }

        // Check rate limiting
        if (block.timestamp < lastSponsorshipTime[eoa] + minTimeBetweenTx) {
            return (false, "Rate limit exceeded");
        }

        // Check daily gas limit
        if (totalGasSponsored[eoa] + estimatedGas > maxGasPerDay) {
            return (false, "Daily gas limit exceeded");
        }

        // Check balance
        uint256 estimatedCost = estimatedGas * tx.gasprice;
        if (address(this).balance < estimatedCost) {
            return (false, "Insufficient paymaster balance");
        }

        return (true, "");
    }

    /**
     * @notice Add an authorized relayer
     * @param relayer Address of the relayer to authorize
     */
    function addRelayer(address relayer) external onlyOwner {
        authorizedRelayers[relayer] = true;
        emit RelayerAdded(relayer);
    }

    /**
     * @notice Remove an authorized relayer
     * @param relayer Address of the relayer to remove
     */
    function removeRelayer(address relayer) external onlyOwner {
        authorizedRelayers[relayer] = false;
        emit RelayerRemoved(relayer);
    }

    /**
     * @notice Whitelist an EOA for gas sponsorship
     * @param eoa Address of the EOA
     * @param whitelisted Whether to whitelist or remove from whitelist
     */
    function setEOAWhitelisted(address eoa, bool whitelisted) external onlyOwner {
        whitelistedEOAs[eoa] = whitelisted;
        emit EOAWhitelisted(eoa, whitelisted);
    }

    /**
     * @notice Batch whitelist EOAs
     * @param eoas Array of EOA addresses
     * @param whitelisted Whether to whitelist or remove from whitelist
     */
    function batchSetEOAWhitelisted(
        address[] calldata eoas,
        bool whitelisted
    ) external onlyOwner {
        for (uint256 i = 0; i < eoas.length; i++) {
            whitelistedEOAs[eoas[i]] = whitelisted;
            emit EOAWhitelisted(eoas[i], whitelisted);
        }
    }

    /**
     * @notice Update rate limiting parameters
     * @param _maxGasPerDay Maximum gas per day per EOA
     * @param _minTimeBetweenTx Minimum time between transactions
     */
    function updateRateLimits(
        uint256 _maxGasPerDay,
        uint256 _minTimeBetweenTx
    ) external onlyOwner {
        maxGasPerDay = _maxGasPerDay;
        minTimeBetweenTx = _minTimeBetweenTx;
    }

    /**
     * @notice Deposit funds to sponsor transactions
     */
    function deposit() external payable {
        if (msg.value == 0) {
            revert InvalidAmount();
        }
        emit FundsDeposited(msg.sender, msg.value);
    }

    /**
     * @notice Withdraw funds from the paymaster
     * @param amount Amount to withdraw
     * @param recipient Address to receive the funds
     */
    function withdraw(uint256 amount, address payable recipient) external onlyOwner {
        if (amount > address(this).balance) {
            revert InsufficientBalance();
        }
        
        (bool success, ) = recipient.call{value: amount}("");
        if (!success) {
            revert TransferFailed();
        }
        
        emit FundsWithdrawn(recipient, amount);
    }

    /**
     * @notice Emergency withdraw all funds
     * @param recipient Address to receive all funds
     */
    function emergencyWithdraw(address payable recipient) external onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = recipient.call{value: balance}("");
        if (!success) {
            revert TransferFailed();
        }
        emit FundsWithdrawn(recipient, balance);
    }

    /**
     * @notice Pause the paymaster
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause the paymaster
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Get the paymaster balance
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @notice Receive ETH
     */
    receive() external payable {
        emit FundsDeposited(msg.sender, msg.value);
    }
}



