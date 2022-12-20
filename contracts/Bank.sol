// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract Bank {
    struct Account {
        uint256 balance;
        uint256 lastPayment;
    }

    mapping(address => Account) private accounts;

    event etherDeposited(address indexed account, uint256 amount);
    event etherWithdrawed(address indexed account, uint256 amount);

    function getBalanceAndLastPayment() external view returns (Account memory) {
        return accounts[msg.sender];
    }

    function deposit() external payable {
        require(msg.value > 0, "You must send ether");
        accounts[msg.sender].balance += msg.value;
        accounts[msg.sender].lastPayment = block.timestamp;
        emit etherDeposited(msg.sender, msg.value);
    }

    function withdraw(uint256 _amount) external {
        require(
            accounts[msg.sender].balance >= _amount,
            "Bank: You don't have enough ether"
        );
        accounts[msg.sender].balance -= _amount;
        (bool success, ) = msg.sender.call{value: _amount}("");
        require(success, "Transfer failed.");
        emit etherWithdrawed(msg.sender, _amount);
    }
}
