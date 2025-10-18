// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MockEntryPoint {
    // Minimal mock implementation for testing purposes
    // This avoids complex ERC-4337 interface implementations
    
    function depositTo(address) external payable {
        // Mock implementation
    }
    
    function getDeposit(address) external pure returns (uint256) {
        return 0;
    }
}
