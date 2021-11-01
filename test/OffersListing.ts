import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { ethers, network, upgrades } from 'hardhat'
import { expect } from 'chai'


import Web3 from 'web3'
// @ts-ignore
const web3 = new Web3(network.provider) as Web3
const provider = ethers.provider;
import { OffersListing, Tokens } from '../typechain'

let offersListing: OffersListing
let tokens: Tokens
let user0: SignerWithAddress
let user1: SignerWithAddress

describe('Contract: OffersListing', () => {
	beforeEach(async () => {
		[user0, user1] = await ethers.getSigners()
		let Tokens = await ethers.getContractFactory('Tokens')
		tokens = await Tokens.deploy() as Tokens
		let OffersListing = await ethers.getContractFactory('OffersListing')
		offersListing = await OffersListing.deploy(tokens.address) as OffersListing	

		await tokens.connect(user0).setApprovalForAll(offersListing.address, true);		
		// await offersListing
		// 	.connect(user0)
		// 	.Offer(
		// 		0,
		// 		10,
		// 		11,
		// 		{ value: ethers.utils.parseEther("0.0005") }
		// 	)
		// await offersListing
		// 	.connect(user0)
		// 	.Listing(
		// 		0,
		// 		10,
		// 		ethers.utils.parseEther("1")
		// 	)
	})
	describe('Offer', () => {
		it('should create offer', async () => {
			await expect(offersListing.Offer(
				0,
				10,
				ethers.utils.parseEther("1"),
				{ value: ethers.utils.parseEther("10") }
				))
					.to.emit(offersListing, 'Bid')
			 		.withArgs(
						 user0.address,
						 0,
						 ethers.utils.parseEther("1"),
						 10
					);
		})

		it('should create listing', async () => {
			await expect(offersListing.Listing(
				0,
				10,
				ethers.utils.parseEther("1")
				))
					.to.emit(offersListing, 'Sale')
			 		.withArgs(
						 user0.address,
						 0,
						 ethers.utils.parseEther("1"),
						 10
					);
		})

		it('should buy if there are appropriate sales', async() => {
			// let balance0 = await provider.getBalance(user0.address)
			// let balance1 = await provider.getBalance(user1.address)
			// console.log(balance0.toString());
			// console.log(balance1.toString());
			await offersListing.Listing(0, 6, ethers.utils.parseEther("1.2"))
			await offersListing.Listing(0, 7, ethers.utils.parseEther("1.5"))
			await offersListing.Listing(0, 5, ethers.utils.parseEther("1.1"))
			await offersListing.Listing(0, 7, ethers.utils.parseEther("1.4"))

			await offersListing.connect(user1).Offer(
				0,
				15,
				ethers.utils.parseEther("1.3"),
				{ value: ethers.utils.parseEther("20") })
			const sales = await offersListing.getCurrentSales(0);
			console.log(sales[0].restAmount.toString(), sales[0].price.toString());
			console.log(sales[1].restAmount.toString(), sales[1].price.toString());
	//		console.log(sales[2].restAmount.toString(), sales[2].price.toString());

			const bids = await offersListing.getCurrentBids(0);			
		})

		it('should sale if there are appropriate bids', async () => {
			await offersListing.Offer(0, 6, ethers.utils.parseEther("1.2"),{ value: ethers.utils.parseEther("20") })
			await offersListing.Offer(0, 7, ethers.utils.parseEther("1.5"),{ value: ethers.utils.parseEther("20") })
			await offersListing.Offer(0, 5, ethers.utils.parseEther("1.1"),{ value: ethers.utils.parseEther("20") })
			await offersListing.Offer(0, 7, ethers.utils.parseEther("1.4"),{ value: ethers.utils.parseEther("20") })

			await offersListing.Listing(0, 11, ethers.utils.parseEther("1.2"))
			const bids = await offersListing.getCurrentBids(0);
			console.log(bids);	
			console.log(bids[0].restAmount.toString(), bids[0].price.toString());
			console.log(bids[1].restAmount.toString(), bids[1].price.toString());
			console.log(bids[2].restAmount.toString(), bids[2].price.toString());
		//	console.log(bids[3].restAmount.toString(), bids[3].price.toString());
		})
		it('should return current bids', async () => {
			const bids = await offersListing.getCurrentBids(0);
		//	console.log(bids);	
			
		})
		it('should return current sales', async () => {
			const sales = await offersListing.getCurrentSales(0);
		//	console.log(sales);	
			
		})
		
	})
})
