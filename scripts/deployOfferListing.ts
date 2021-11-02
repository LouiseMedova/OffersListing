import { OffersListing } from '../typechain'
import {ethers, run} from 'hardhat'
import {delay} from '../utils'

async function deployOffersListing() {
	const OffersListing = await ethers.getContractFactory('OffersListing')
	console.log('starting deploying offersListing...')
	const offersListing = await OffersListing.deploy() as OffersListing
	console.log('OffersListing deployed with address: ' + offersListing.address)
	console.log('wait of deploying...')
	await offersListing.deployed()
	console.log('wait of delay...')
	await delay(25000)
	console.log('starting verify offersListing...')
	try {
		await run('verify:verify', {
			address: offersListing!.address,
			contract: 'contracts/OffersListing.sol:OffersListing',
			constructorArguments: [  ],
		});
		console.log('verify success')
	} catch (e: any) {
		console.log(e.message)
	}

}

deployOffersListing()
.then(() => process.exit(0))
.catch(error => {
	console.error(error)
	process.exit(1)
})