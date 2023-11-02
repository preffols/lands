const { expect } = require("chai"); 

const toWei = (num) => ethers.parseEther(num.toString())
const fromWei = (num) => ethers.formatEther(num)

describe("landlandProcess", function () {

  let land;
  let Land;
  let landProcess;
  let LandProcess
  let deployer;
  let addr1;
  let addr2;
  let addrs;
  let feePercent = 1;
  let URI = "sample URI"

  beforeEach(async function () {
    // Get the ContractFactories and Signers here.
    Land = await ethers.getContractFactory("Land");
    LandProcess = await ethers.getContractFactory("LandProcess");
    [deployer, addr1, addr2, ...addrs] = await ethers.getSigners();

    // To deploy our contracts
    land = await Land.deploy();
    landProcess = await LandProcess.deploy();
  });

  describe("Deployment", function () {

    it("Should track name and symbol of the land collection", async function () {
      // This test expects the owner variable stored in the contract to be equal
      // to our Signer's owner.
      const landName = "My Land"
      const landSymbol = "ML"
      expect(await land.name()).to.equal(landName);
      expect(await land.symbol()).to.equal(landSymbol);
    });

    it("Should track feeAccount and feePercent of the landProcess", async function () {
      expect(await landProcess.feeAccount()).to.equal(deployer.address);
      expect(await landProcess.feePercent()).to.equal(feePercent);
    });
  });

  describe("Minting lands", function () {

    it("Should track each minted land", async function () {
      // addr1 mints an land
      await land.connect(addr1).mint(URI)
     // expect(await land.totalSupply()).to.equal(1);
     // expect(await land.balanceOf(addr1.address)).to.equal(1);
      expect(await land.tokenURI(1)).to.equal(URI);
      // addr2 mints an land
      await land.connect(addr2).mint(URI)
      expect(await land.totalSupply()).to.equal(2);
      expect(await land.balanceOf(addr2.address)).to.equal(1);
      expect(await land.tokenURI(2)).to.equal(URI);
    });
  })

  describe("Making land Process items", function () {
    let price = 1
    let result 
    beforeEach(async function () {
      // addr1 mints an land
      await land.connect(addr1).mint(URI)
      // addr1 approves landProcess to spend land
      await land.connect(addr1).setApprovalForAll(landProcess.target, true)
    })
    it("Should track newly created item, transfer NFT from seller to marketplace and emit Offered event", async function () {
      // addr1 offers their nft at a price of 1 ether
      await expect(landProcess.connect(addr1).makeItem(land.target, 1 , toWei(price)))
        .to.emit(landProcess, "Offered")
        .withArgs(
          1,
          land.target,
          1,
          toWei(price),
          addr1.address
        )
      // Owner of NFT should now be the marketplace
      expect(await land.ownerOf(1)).to.equal(landProcess.target);
      // Item count should now equal 1
      expect(await landProcess.itemCount()).to.equal(1)
      // Get item from items mapping then check fields to ensure they are correct
       const item = await landProcess.items(1)
       expect(item.itemId).to.equal(1)
       expect(item.nft).to.equal(land.target)
      expect(item.tokenId).to.equal(1)
       expect(item.price).to.equal(toWei(price))
      expect(item.sold).to.equal(false)
    });

    it("Should fail if price is set to zero", async function () {
      await expect(
        landProcess.connect(addr1).makeItem(land.target, 1, 0)
      ).to.be.revertedWith("Price must be greater than zero");
    });
    describe("Purchasing land", function () {
      let price = 2
      let fee = (feePercent/100)*price
      let totalPriceInWei
      beforeEach(async function () {
        // addr1 mints an nft
        await land.connect(addr1).mint(URI)
        // addr1 approves marketplace to spend tokens
        await land.connect(addr1).setApprovalForAll(landProcess.target, true)
        // addr1 makes their nft a marketplace item.
        await landProcess.connect(addr1).makeItem(land.target, 1 , toWei(price))
      })
      it("Should update item as sold, pay seller, transfer land to buyer, charge fees and emit a Bought event", async function () {
        const sellerInitalEthBal = await addr1.getBalance()
        const feeAccountInitialEthBal = await deployer.getBalance()
        // fetch items total price (market fees + item price)
        totalPriceInWei = await landProcess.getTotalPrice(1);
        // addr 2 purchases item.
        await expect(landProcess.connect(addr2).purchaseItem(1, {value: totalPriceInWei}))
        .to.emit(landProcess, "Bought")
          .withArgs(
            1,
            land.target,
            1,
            toWei(price),
            addr1.address,
            addr2.address
          )
        const sellerFinalEthBal = await addr1.getBalance()
        const feeAccountFinalEthBal = await deployer.getBalance()
        // // Item should be marked as sold
        // expect((await marketplace.items(1)).sold).to.equal(true)
        // // Seller should receive payment for the price of the NFT sold.
        // expect(+fromWei(sellerFinalEthBal)).to.equal(+price + +fromWei(sellerInitalEthBal))
        // // feeAccount should receive fee
        // expect(+fromWei(feeAccountFinalEthBal)).to.equal(+fee + +fromWei(feeAccountInitialEthBal))
        // // The buyer should now own the nft
        // expect(await nft.ownerOf(1)).to.equal(addr2.address);
      })


  });
  
})
})