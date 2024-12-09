import { formatAbi } from 'abitype'
import { task } from 'hardhat/config'

task('export:abi:compositor', 'Exports an abi in its human readable form')
  .setAction(async (_, hre) => {
    const compositor = await hre.viem.deployContract('Compositor', [])

    console.log(formatAbi(compositor.abi))
  })

