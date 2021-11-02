import { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } from 'constants'
import { task } from 'hardhat/config'
const dotenv = require('dotenv')
const fs = require('fs')
const envConfig = dotenv.parse(fs.readFileSync(".env"))
		for (const k in envConfig) {
			process.env[k] = envConfig[k]
		}
const offersListing = process.env.OFFERS_LISTING as string;
const tokens = process.env.TOKENS_ADDRESS as string;

task('make-bid', 'make a bid')
	.addParam('id', 'The token ID')
    .addParam('amount', 'Tokens amount')
	.addParam('price', 'price for the token')
	.setAction(async ({ id, amount, price}, { ethers }) => {
		const contract = await ethers.getContractAt('OffersListing', offersListing)
		await contract.Offer(
            tokens,
			id,
			amount,
			price,
            {value: price*amount}
		)
	})

task('make-sale', 'make a sale')
	.addParam('id', 'The token ID')
    .addParam('amount', 'Tokens amount')
	.addParam('price', 'price for the token')
	.setAction(async ({ id, amount, price}, { ethers }) => {
		const contract = await ethers.getContractAt('OffersListing', offersListing)
		await contract.Listing(
            tokens,
			id,
			amount,
			price,
		)
	})

task('get-bids', 'returns current bids')
	.setAction(async ({}, { ethers }) => {
		const contract = await ethers.getContractAt('OffersListing', offersListing)
        const bids = await contract.getCurrentBids(tokens);
        for(let i = 0; i < bids.length; i++) {
            console.log("Bid", i);
            console.log("tokenId", bids[i].tokenId.toString());
            console.log("price", bids[i].price.toString());
            console.log("amount", bids[i].restAmount.toString());
            console.log("");         
        }
	})

task('get-sales', 'returns current sales')
	.setAction(async ({}, { ethers }) => {
		const contract = await ethers.getContractAt('OffersListing', offersListing)
        const sales = await contract.getCurrentSales(tokens);
        for(let i = 0; i < sales .length; i++) {
            console.log("Sale", i);
            console.log("tokenId", sales [i].tokenId.toString());
            console.log("price", sales [i].price.toString());
            console.log("amount", sales [i].restAmount.toString());
            console.log("");         
        }
	})

task('approve', 'approves contract to transfer ERC1155')
	.setAction(async ({}, { ethers }) => {
		const contract = await ethers.getContractAt('Tokens', tokens)
        await contract.setApprovalForAll(offersListing, true)
	})

