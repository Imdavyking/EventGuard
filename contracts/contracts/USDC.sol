// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract USDC is ERC20 {
    error USDC__NotOwner();
    error USDC__MaxSupplyExceeded();

    constructor() ERC20("USDC", "USDC") {}

    /**
     * @dev Mint tokens
     * @param to - the address to mint tokens to
     * @param amount - the amount of tokens to mint
     */

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    /**
     * @dev Burn tokens
     * @param amount - the amount of tokens to burn
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
