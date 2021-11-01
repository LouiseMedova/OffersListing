// SPDX-License-Identifier: MIT
pragma solidity 0.8.6;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract Tokens is ERC1155 {
    uint256 public constant TOKEN_0 = 0;
    uint256 public constant TOKEN_1 = 1;
    uint256 public constant TOKEN_2 = 2;
    uint256 public constant TOKEN_3 = 3;
    uint256 public constant TOKEN_4 = 4;
        
    constructor() ERC1155("") {
        _mint(msg.sender, TOKEN_0, 10**18, "");
        _mint(msg.sender, TOKEN_1, 10**18, "");
        _mint(msg.sender, TOKEN_2, 10**18, "");
        _mint(msg.sender, TOKEN_3, 10**18, "");
        _mint(msg.sender, TOKEN_4, 10**18, "");
    }
}
