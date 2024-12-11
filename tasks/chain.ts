import { mine } from '@nomicfoundation/hardhat-network-helpers'
import { task } from 'hardhat/config'
import { Client } from 'viem'

task('mine', 'Mine a given number of blocks')
  .addParam<string>('blocks', 'The number of blocks to mine', '300')
  .setAction(async ({ blocks }) => {
    await mine(BigInt(blocks))
  })

task('block', 'Ge the current block')
  .setAction(async (_, hre) => {
    const client = await hre.viem.getPublicClient()

    console.log(await client.getBlockNumber())
  })

