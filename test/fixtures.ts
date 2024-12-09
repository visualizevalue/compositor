import { parseEther } from 'viem'
import { loadFixture } from '@nomicfoundation/hardhat-toolbox-viem/network-helpers'
import hre from 'hardhat'
import { JALIL } from './constants'
import CompositorModule from '../ignition/modules/Compositor'

export async function baseFixture() {
  const [owner] = await hre.viem.getWalletClients()

  const publicClient = await hre.viem.getPublicClient()

  const testClient = await hre.viem.getTestClient()
  await testClient.impersonateAccount({ address: JALIL })
  await testClient.setBalance({
    address: JALIL,
    value: parseEther('100')
  })
  await testClient.setBalance({
    address: owner.account.address,
    value: parseEther('100')
  })

  return { owner, publicClient }
}

export async function compositorFixture() {
  const { owner, publicClient } = await loadFixture(baseFixture)

  const { compositor } = await hre.ignition.deploy(CompositorModule)

  // TODO: Add Checks
  // const checks = await hre.viem.getContractAt('Checks', '0x...')

  return {
    compositor,
    owner,
    publicClient,
  }
}

