import { Tokens } from '../typechain'
import {ethers, run} from 'hardhat'
import {delay} from '../utils'

async function deployTokens() {
	const Tokens = await ethers.getContractFactory('Tokens')
	console.log('starting deploying tokens...')
	const tokens = await Tokens.deploy() as Tokens
	console.log('Tokens deployed with address: ' + tokens.address)
	console.log('wait of deploying...')
	await tokens.deployed()
	console.log('wait of delay...')
	await delay(25000)
	console.log('starting verify tokens...')
	try {
		await run('verify:verify', {
			address: tokens!.address,
			contract: 'contracts/Tokens.sol:Tokens',
			constructorArguments: [  ],
		});
		console.log('verify success')
	} catch (e: any) {
		console.log(e.message)
	}

}

deployTokens()
.then(() => process.exit(0))
.catch(error => {
	console.error(error)
	process.exit(1)
})