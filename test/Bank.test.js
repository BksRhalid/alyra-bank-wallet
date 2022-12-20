const { assert, expect } = require("chai");
const { network, deployments, ethers } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Units tests of Bank smart contract", function () {
      let accounts;
      let bank;

      beforeEach(async () => {
        accounts = await ethers.getSigners();
        deployer = accounts[0];
      });

      describe("Deployment", async function () {
        it("should deploy the smart contract", async function () {
          await deployments.fixture(["wallet"]);
          Wallet = await ethers.getContract("Bank");
        });
      });

      describe("Test of the getBalance&LastPayment", async function () {
        it("should return 0", async function () {
          const account = await Wallet.getBalanceAndLastPayment();
          expect(account.balance).to.equal(ethers.BigNumber.from("0"));
          expect(account.lastPayment).to.equal(ethers.BigNumber.from("0"));
        });
      });

      describe("Test of the function deposit", async function () {
        it("should deposit 1000", async function () {
          await Wallet.deposit({ value: 1000 });
          const account = await Wallet.getBalanceAndLastPayment();
          expect(account.balance).to.equal(ethers.BigNumber.from("1000"));
        });
        it("should be different to zero", async function () {
          await Wallet.deposit({ value: 1000 });
          const account = await Wallet.getBalanceAndLastPayment();
          expect(account.lastPayment).to.not.equal(ethers.BigNumber.from("0"));
          assert(account.lastPayment.toString().length == 10);
          expect(account.lastPayment).above(0);
        });
      });
      describe("Test of the function withdraw", async function () {
        it("should withdraw all", async function () {
          const account = await Wallet.getBalanceAndLastPayment();
          _amount = account.balance;
          await Wallet.withdraw(_amount);
          const updatedAccount = await Wallet.getBalanceAndLastPayment();
          expect(updatedAccount.balance).to.equal(ethers.BigNumber.from("0"));
        });
        it("should withdraw 1000", async function () {
          const account = await Wallet.getBalanceAndLastPayment();
          await Wallet.deposit({ value: 1000 });
          await Wallet.withdraw(1000);
          expect(account.balance).to.equal(ethers.BigNumber.from("0"));
        });
        it("should NOT withdraw", async function () {
          await expect(
            Wallet.connect(accounts[1]).withdraw(1000)
          ).to.be.revertedWith("Bank: You don't have enough ether");
          //await expect (bank.connect(accounts[1]).withdraw(1000)).to.be.revertedWith("You are not the owner of this account");
        });

        it("should return true", async function () {
          const account = await Wallet.getBalanceAndLastPayment();
          _amount = account.balance;
          //expect(await Wallet.withdraw(_amount)).to.be.true;
          //console.log(await Wallet.withdraw(_amount));
        });
      });
      describe("Test of the event", async function () {
        it("should emit an deposit event", async function () {
          await expect(Wallet.deposit({ value: 1000 }))
            .to.emit(Wallet, "etherDeposited")
            .withArgs(deployer.address, 1000);
        });
        it("should emit an withdraw event", async function () {
          await Wallet.deposit({ value: 1000 });
          await expect(Wallet.withdraw(1000))
            .to.emit(Wallet, "etherWithdrawed")
            .withArgs(deployer.address, 1000);
        });
      });
      describe("Test of the revert", async function () {
        it("should revert withdraw", async function () {
          const account = await Wallet.getBalanceAndLastPayment();
          _amount = account.balance + 1;
          await expect(Wallet.withdraw(_amount)).to.be.revertedWith(
            "Bank: You don't have enough ether"
          );
        });
        it("should revert deposit", async function () {
          await expect(Wallet.deposit({ value: 0 })).to.be.revertedWith(
            "You must send ether"
          );
        });
      });
    });
