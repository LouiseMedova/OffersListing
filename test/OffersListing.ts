import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { ethers, network, upgrades } from 'hardhat'
import { expect } from 'chai'


import Web3 from 'web3'
// @ts-ignore
const web3 = new Web3(network.provider) as Web3
const provider = ethers.provider;
import { OffersListing, Tokens } from '../typechain'

let offersListing: OffersListing
let tokens0: Tokens
let tokens1: Tokens
let user0: SignerWithAddress
let user1: SignerWithAddress

describe('Contract: OffersListing', () => {
	beforeEach(async () => {
		[user0, user1] = await ethers.getSigners()
		let Tokens = await ethers.getContractFactory('Tokens')
		tokens0 = await Tokens.deploy() as Tokens
		tokens1 = await Tokens.deploy() as Tokens
		let OffersListing = await ethers.getContractFactory('OffersListing')
		offersListing = await OffersListing.deploy() as OffersListing	
		await tokens0.connect(user0).setApprovalForAll(offersListing.address, true);		
	})
	describe('Offer', () => {
		it('should create bid', async () => {
			await expect(offersListing.Offer(
				tokens0.address,
				0,
				10,
				ethers.utils.parseEther("1"),
				{ value: ethers.utils.parseEther("10") }
				))
					.to.emit(offersListing, 'Bid')
			 		.withArgs(
						 user0.address,
						 0,
						 tokens0.address,
						 ethers.utils.parseEther("1"),
						 10
					);
		})

		it('should revert if not enouth ether was sent', async() => {
			await expect(offersListing.Offer(
				tokens0.address,
				0,
				10,
				ethers.utils.parseEther("1"),
				{ value: ethers.utils.parseEther("9.9") }
				))
					.to
					.be.revertedWith('not enough ether')
		})
		it('should return current bids', async () => {
			await offersListing.Offer(tokens0.address, 0, 10,
				ethers.utils.parseEther("1"),
				{ value: ethers.utils.parseEther("10") })

			await offersListing.Offer(tokens1.address, 1, 10,
				ethers.utils.parseEther("1"),
				{ value: ethers.utils.parseEther("10") })

			await offersListing.Offer(tokens1.address, 1, 10,
				ethers.utils.parseEther("1.1"),
				{ value: ethers.utils.parseEther("11") })

			await offersListing.Offer(tokens0.address, 0, 10,
				ethers.utils.parseEther("2"),
				{ value: ethers.utils.parseEther("20") })
				
			await offersListing.Offer(tokens0.address, 0, 10,
				ethers.utils.parseEther("2"),
				{ value: ethers.utils.parseEther("20") })

			let bids = await offersListing.getCurrentBids(tokens0.address)
			expect(bids.length).to.equal(3)
			bids = await offersListing.getCurrentBids(tokens1.address)
			expect(bids.length).to.equal(2)
		})
	})

	describe('Listing', () => {
		
		it('should create sale', async () => {
			await expect(offersListing.Listing(
				tokens0.address,
				0,
				10,
				ethers.utils.parseEther("1"),
				))
					.to.emit(offersListing, 'Sale')
			 		.withArgs(
						 user0.address,
						 0,
						 tokens0.address,
						 ethers.utils.parseEther("1"),
						 10
					);
		})
		it('should return current sales', async () => {
			await offersListing.Listing(tokens0.address, 0, 10,
				ethers.utils.parseEther("1"))

			await offersListing.Listing(tokens1.address, 1, 10,
				ethers.utils.parseEther("1"))

			await offersListing.Listing(tokens1.address, 1, 10,
				ethers.utils.parseEther("1.1"))

			await offersListing.Listing(tokens0.address, 0, 10,
				ethers.utils.parseEther("2"))
				
			await offersListing.Listing(tokens0.address, 0, 10,
				ethers.utils.parseEther("2"))

			let sales = await offersListing.getCurrentSales(tokens0.address)
			expect(sales.length).to.equal(3)
			sales = await offersListing.getCurrentSales(tokens1.address)
			expect(sales.length).to.equal(2)
		})
	})

	describe('Buy matching', async() => {
		beforeEach(async () => {
			//create listing
			await offersListing.Listing(tokens0.address, 0, 5,
				ethers.utils.parseEther("1.6"))

			await offersListing.Listing(tokens0.address, 0, 5,
				ethers.utils.parseEther("1.2"))

			await offersListing.Listing(tokens0.address, 0, 5,
				ethers.utils.parseEther("1.1"))

			await offersListing.Listing(tokens0.address, 0, 5,
				ethers.utils.parseEther("1.5"))
		})

		it('should not buy if there are no matching', async() => {
			await expect(offersListing.Offer(
				tokens0.address,
				0,
				10,
				ethers.utils.parseEther("1"),
				{ value: ethers.utils.parseEther("10") }
				))
					.to.emit(offersListing, 'Bid')
			 		.withArgs(
						 user0.address,
						 0,
						 tokens0.address,
						 ethers.utils.parseEther("1"),
						 10
					);
		})

		it('should not create bid if there are appropriate sales for all tokens', async() => {
			await offersListing.connect(user1).Offer(
				tokens0.address,
				0,
				9,
				ethers.utils.parseEther("1.3"),
				{ value: ethers.utils.parseEther("13") }
				)
			const bids = await offersListing.getCurrentBids(tokens0.address)
			expect(bids.length).to.equal(0)
			const sales = await offersListing.getCurrentSales(tokens0.address)
			expect(sales[1].restAmount).to.equal(0)
			expect(sales[2].restAmount).to.equal(1)
			expect(await tokens0.balanceOf(user1.address, 0)).to.equal(9);
		})

		it('should execute order and make a bid for the rest of tokens', async() => {
			await expect(offersListing.Offer(
				tokens0.address,
				0,
				12,
				ethers.utils.parseEther("1.3"),
				{ value: ethers.utils.parseEther("15.6") }
				))
					.to.emit(offersListing, 'Bid')
			 		.withArgs(
						 user0.address,
						 0,
						 tokens0.address,
						 ethers.utils.parseEther("1.3"),
						 2
					);
		})
	})

	describe('Sale matching', async() => {
		beforeEach(async () => {
			await offersListing.connect(user1).Offer(tokens0.address, 0, 10,
				ethers.utils.parseEther("1"),
				{ value: ethers.utils.parseEther("10") })

			await offersListing.connect(user1).Offer(tokens0.address, 0, 10,
				ethers.utils.parseEther("1.3"),
				{ value: ethers.utils.parseEther("13") })

			await offersListing.connect(user1).Offer(tokens0.address, 0, 10,
				ethers.utils.parseEther("0.9"),
				{ value: ethers.utils.parseEther("9") })

			await offersListing.connect(user1).Offer(tokens0.address, 0, 10,
				ethers.utils.parseEther("0.8"),
				{ value: ethers.utils.parseEther("8") })
				
			await offersListing.connect(user1).Offer(tokens0.address, 0, 10,
				ethers.utils.parseEther("1.1"),
				{ value: ethers.utils.parseEther("11") })
		})

		it('should not sale if there are no matching', async() => {
			await expect(offersListing.Listing(
				tokens0.address,
				0,
				10,
				ethers.utils.parseEther("1.4"),
				))
					.to.emit(offersListing, 'Sale')
			 		.withArgs(
						 user0.address,
						 0,
						 tokens0.address,
						 ethers.utils.parseEther("1.4"),
						 10
					);
		})

		it('should not create sale if there are appropriate bids for all tokens', async() => {
			await offersListing.Listing(
				tokens0.address,
				0,
				19,
				ethers.utils.parseEther("1.1"),
				)
			const sales = await offersListing.getCurrentSales(tokens0.address)
			expect(sales.length).to.equal(0)
			const bids = await offersListing.getCurrentBids(tokens0.address)
			expect(bids[1].restAmount).to.equal(0)
			expect(bids[4].restAmount).to.equal(1)
			expect(await tokens0.balanceOf(user1.address, 0)).to.equal(19);
		})
		it('should execute order and make a sale for the rest of tokens', async() => {
			await expect(offersListing.Listing(
				tokens0.address,
				0,
				25,
				ethers.utils.parseEther("1.1"),
				))
					.to.emit(offersListing, 'Sale')
			 		.withArgs(
						 user0.address,
						 0,
						 tokens0.address,
						 ethers.utils.parseEther("1.1"),
						 5
				);
			})
	})	
})
