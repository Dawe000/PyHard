// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title EOADelegation
 * @notice EIP-7702 delegation contract that relays calls to SmartWallet with gas sponsorship
 * @dev This contract is set as the code for an EOA using EIP-7702 SET_CODE transaction
 * 
 * EIP-7702 allows an EOA to temporarily delegate its execution to a smart contract.
 * This contract acts as a simple relay/proxy that:
 * - Verifies the EOA's signature
 * - Forwards calls to the EOA's SmartWallet
 * - Enables gas sponsorship by allowing a relayer (CF Worker) to submit transactions
 */
contract EOADelegation is ReentrancyGuard {
    // Events
    event OperationExecuted(
        address indexed eoa,
        address indexed smartWallet,
        bytes data,
        address indexed relayer
    );

    // Errors
    error InvalidSignature();
    error OperationFailed(bytes returnData);
    error InvalidNonce();
    error ExpiredDeadline();
    error InvalidSmartWallet();

    // Nonce tracking for replay protection
    mapping(address => uint256) public nonces;

    /**
     * @notice Execute an operation on the EOA's SmartWallet with gas sponsorship
     * @dev This is called by a relayer (CF Worker) who sponsors the gas
     * @param smartWallet The SmartWallet contract to call
     * @param data The encoded function call to execute on the SmartWallet
     * @param nonce Nonce for replay protection
     * @param deadline Expiration timestamp
     * @param signature EOA's signature authorizing this operation
     */
    function executeOnSmartWallet(
        address smartWallet,
        bytes calldata data,
        uint256 nonce,
        uint256 deadline,
        bytes calldata signature
    ) external nonReentrant returns (bytes memory) {
        // Verify deadline
        if (block.timestamp > deadline) {
            revert ExpiredDeadline();
        }

        // Verify smart wallet address
        if (smartWallet == address(0)) {
            revert InvalidSmartWallet();
        }

        // Get the EOA address (this contract is temporarily the EOA's code via EIP-7702)
        address eoa = address(this);

        // Verify nonce
        if (nonces[eoa] != nonce) {
            revert InvalidNonce();
        }
        nonces[eoa]++;

        // Verify signature
        bytes32 messageHash = keccak256(
            abi.encodePacked(
                "\x19Ethereum Signed Message:\n32",
                keccak256(abi.encode(smartWallet, data, nonce, deadline, block.chainid))
            )
        );

        address signer = recoverSigner(messageHash, signature);
        if (signer != eoa) {
            revert InvalidSignature();
        }

        // Forward the call to the SmartWallet
        // The SmartWallet will verify that msg.sender (the EOA) is the owner
        (bool success, bytes memory returnData) = smartWallet.call(data);
        if (!success) {
            revert OperationFailed(returnData);
        }

        emit OperationExecuted(eoa, smartWallet, data, msg.sender);
        return returnData;
    }

    /**
     * @notice Get the current nonce for an EOA
     * @param eoa The EOA address
     * @return The current nonce
     */
    function getNonce(address eoa) external view returns (uint256) {
        return nonces[eoa];
    }

    /**
     * @notice Recover the signer from a signature
     * @param messageHash The hash that was signed
     * @param signature The signature
     * @return The signer's address
     */
    function recoverSigner(
        bytes32 messageHash,
        bytes memory signature
    ) internal pure returns (address) {
        require(signature.length == 65, "Invalid signature length");

        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
            r := mload(add(signature, 32))
            s := mload(add(signature, 64))
            v := byte(0, mload(add(signature, 96)))
        }

        if (v < 27) {
            v += 27;
        }

        require(v == 27 || v == 28, "Invalid signature v value");

        return ecrecover(messageHash, v, r, s);
    }

    /**
     * @notice Fallback to receive ETH
     */
    receive() external payable {}
}
