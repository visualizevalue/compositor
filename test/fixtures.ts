import { parseEther } from 'viem'
import { loadFixture } from '@nomicfoundation/hardhat-toolbox-viem/network-helpers'
import hre from 'hardhat'
import { CHECKS, JALIL_VAULT, HOLDER } from './constants'
import CompositorModule from '../ignition/modules/Compositor'

export async function baseFixture() {
  const [owner] = await hre.viem.getWalletClients()

  const publicClient = await hre.viem.getPublicClient()

  const testClient = await hre.viem.getTestClient()
  await testClient.impersonateAccount({ address: JALIL_VAULT })
  await testClient.impersonateAccount({ address: HOLDER })
  await testClient.setBalance({
    address: HOLDER,
    value: parseEther('100')
  })
  await testClient.setBalance({
    address: JALIL_VAULT,
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

  const checks = await hre.viem.getContractAt(`MockChecks`, CHECKS)

  await checks.write.setApprovalForAll(
    [ compositor.address, true ],
    { account: HOLDER }
  )
  await checks.write.setApprovalForAll(
    [ compositor.address, true ],
    { account: JALIL_VAULT }
  )

  return {
    checks,
    compositor,
    owner,
    publicClient,
  }
}

