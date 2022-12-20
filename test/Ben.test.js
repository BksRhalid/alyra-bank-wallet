const { assert, expect } = require("chai");
const { network, deployments, ethers } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Units tests of Bank smart contract", function () {
      let accounts;
      let bank;

      before(async () => {
        accounts = await ethers.getSigners();
        deployer = accounts[0];
        //console.log(deployer);
      });

      describe("Deployment", function () {
        it("Should deploy the smart contract", async function () {
          await deployments.fixture(["wallet"]);
          bank = await ethers.getContract("Bank");
        });
      });

      describe("Deposit", function () {
        it("should NOT deposit ethers if not enough funds are deposited", async function () {
          await expect(bank.deposit()).to.be.revertedWith(
            "You must send ether"
          );
        });

        it("should deposit ethers on the smart contract if enough funds/ethers are deposited", async function () {
          //deployer deposits 1000 Wei
          await expect(await bank.deposit({ value: 1000 })).to.emit(
            bank,
            "etherDeposited"
          );
          let account = await bank.getBalanceAndLastPayment();
          assert(account.balance.toString() === "1000");
          assert(account.lastPayment.toString().length === 10);
        });
      });

      describe("Withdraw", function () {
        it("should NOT withdraw if no ethers are on the smart contract for this address", async function () {
          await expect(
            bank.connect(accounts[1]).withdraw(1000)
          ).to.be.revertedWith("Bank: You don't have enough ether");
        });

        it("should NOT withdraw if the account is trying to withdraw more ethers than what he deposited on the smart contract", async function () {
          await expect(bank.withdraw(1200)).to.be.revertedWith(
            "Bank: You don't have enough ether"
          );
        });

        it("should withdraw if enough ethers are deposited by this account on the smart contract", async function () {
          const balanceOfDeployer = await deployer.getBalance();

          // GAS COST
          const transactionResponse = await bank.withdraw(900);
          const transactionReceipt = await transactionResponse.wait();
          //console.log(transactionReceipt);
          //console.log(await deployer.getAddress());
          const { gasUsed, effectiveGasPrice } = transactionReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);

          let bn900 = ethers.BigNumber.from("900");
          let newBalanceOfDeployer = await deployer.getBalance();

          let result = balanceOfDeployer.add(bn900).sub(gasCost);
          assert.equal(result.toString(), newBalanceOfDeployer.toString());

          let account = await bank.getBalanceAndLastPayment();
          assert(account.balance.toString() === "100");
          assert(account.lastPayment.toString().length === 10);
        });
      });
    });
