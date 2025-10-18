// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Create2.sol";
// Simplified imports for testing
import "./SmartWallet.sol";
import "./interfaces/IPYUSD.sol";

contract SmartWalletFactory is Ownable {
    using Create2 for bytes32;
    
    // Events
    event WalletCreated(address indexed owner, address indexed wallet);
    
    // State variables
    address public immutable entryPoint;
    IPYUSD public immutable pyusd;
    address public immutable walletImplementation;
    
    // Mappings
    mapping(address => address) public ownerToWallet;
    mapping(address => bool) public isWallet;
    
    // Salt for CREATE2
    bytes32 private constant SALT = keccak256("PYUSD_SMART_WALLET_FACTORY_V1");
    
    constructor(
        address _entryPoint,
        IPYUSD _pyusd
    ) Ownable(msg.sender) {
        entryPoint = _entryPoint;
        pyusd = _pyusd;
        
        // Deploy implementation contract
        walletImplementation = address(new SmartWallet(_entryPoint, _pyusd, address(this), msg.sender));
    }
    
    /**
     * @dev Creates a new smart wallet for the given owner
     * @param owner The EOA that will own the smart wallet
     * @return wallet The address of the newly created wallet
     */
    function createWallet(address owner) external returns (address wallet) {
        require(owner != address(0), "Invalid owner address");
        require(ownerToWallet[owner] == address(0), "Wallet already exists for owner");
        
        // Calculate wallet address using CREATE2
        bytes32 salt = keccak256(abi.encodePacked(owner, block.timestamp));
        bytes memory bytecode = abi.encodePacked(
            type(SmartWallet).creationCode,
            abi.encode(entryPoint, pyusd, address(this), owner)
        );
        
        wallet = Create2.computeAddress(salt, keccak256(bytecode), address(this));
        
        // Deploy wallet using CREATE2
        assembly {
            wallet := create2(0, add(bytecode, 0x20), mload(bytecode), salt)
        }
        
        require(wallet != address(0), "Wallet creation failed");
        
        // Update mappings
        ownerToWallet[owner] = wallet;
        isWallet[wallet] = true;
        
        emit WalletCreated(owner, wallet);
        
        return wallet;
    }
    
    /**
     * @dev Predicts the address of a wallet that would be created for a given owner
     * @param owner The EOA that would own the wallet
     * @return The predicted wallet address
     */
    function predictWalletAddress(address owner) external view returns (address) {
        require(owner != address(0), "Invalid owner address");
        
        // Use a deterministic salt based on owner address
        bytes32 salt = keccak256(abi.encodePacked(owner, uint256(0)));
        bytes memory bytecode = abi.encodePacked(
            type(SmartWallet).creationCode,
            abi.encode(entryPoint, pyusd, address(this), owner)
        );
        
        return Create2.computeAddress(salt, keccak256(bytecode), address(this));
    }
    
    /**
     * @dev Creates a wallet with a specific salt for deterministic addressing
     * @param owner The EOA that will own the smart wallet
     * @param salt The salt to use for CREATE2
     * @return wallet The address of the newly created wallet
     */
    function createWalletWithSalt(address owner, bytes32 salt) external returns (address wallet) {
        require(owner != address(0), "Invalid owner address");
        require(ownerToWallet[owner] == address(0), "Wallet already exists for owner");
        
        bytes memory bytecode = abi.encodePacked(
            type(SmartWallet).creationCode,
            abi.encode(entryPoint, pyusd, address(this), owner)
        );
        
        wallet = Create2.computeAddress(salt, keccak256(bytecode), address(this));
        
        // Check if wallet already exists at this address
        require(wallet.code.length == 0, "Wallet already exists at this address");
        
        // Deploy wallet using CREATE2
        assembly {
            wallet := create2(0, add(bytecode, 0x20), mload(bytecode), salt)
        }
        
        require(wallet != address(0), "Wallet creation failed");
        
        // Update mappings
        ownerToWallet[owner] = wallet;
        isWallet[wallet] = true;
        
        emit WalletCreated(owner, wallet);
        
        return wallet;
    }
    
    /**
     * @dev Gets the wallet address for a given owner
     * @param owner The EOA owner
     * @return The wallet address, or address(0) if no wallet exists
     */
    function getWallet(address owner) external view returns (address) {
        return ownerToWallet[owner];
    }
    
    /**
     * @dev Checks if an address is a wallet created by this factory
     * @param wallet The address to check
     * @return True if the address is a wallet created by this factory
     */
    function isValidWallet(address wallet) external view returns (bool) {
        return isWallet[wallet];
    }
    
    /**
     * @dev Batch creates wallets for multiple owners
     * @param owners Array of owner addresses
     * @return wallets Array of created wallet addresses
     */
    function batchCreateWallets(address[] calldata owners) external returns (address[] memory wallets) {
        require(owners.length > 0, "Empty owners array");
        require(owners.length <= 50, "Too many owners"); // Gas limit protection
        
        wallets = new address[](owners.length);
        
        for (uint256 i = 0; i < owners.length; i++) {
            wallets[i] = this.createWallet(owners[i]);
        }
        
        return wallets;
    }
    
    /**
     * @dev Emergency function to remove a wallet from mappings (only owner)
     * @param owner The owner whose wallet should be removed
     */
    function emergencyRemoveWallet(address owner) external onlyOwner {
        address wallet = ownerToWallet[owner];
        if (wallet != address(0)) {
            ownerToWallet[owner] = address(0);
            isWallet[wallet] = false;
        }
    }
}
