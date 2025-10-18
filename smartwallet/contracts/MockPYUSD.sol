// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MockPYUSD is ERC20, Ownable {
    uint8 private constant _DECIMALS = 6;
    
    constructor() ERC20("Mock PYUSD", "PYUSD") Ownable(msg.sender) {
        // Initial supply of 1,000,000 PYUSD
        _mint(msg.sender, 1000000 * 10**_DECIMALS);
    }
    
    function decimals() public view virtual override returns (uint8) {
        return _DECIMALS;
    }
    
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
    
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
    
    function burnFrom(address account, uint256 amount) external {
        _spendAllowance(account, msg.sender, amount);
        _burn(account, amount);
    }
}
