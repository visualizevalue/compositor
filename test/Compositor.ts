import hre from 'hardhat'
import { expect } from 'chai'
import { encodeAbiParameters } from 'viem'
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import { compositorFixture } from './fixtures'
import { decodeBase64URI } from '../helpers/decode-uri'
import {
  HOLDER,
  HOLDER_CHECKS_80,
  HOLDER_CHECK_COMPOSITE_IMAGE,
  JALIL_VAULT,
  JALIL_CHECKS_20,
  JALIL_CHECKS_40,
  JALIL_CHECKS_80,
} from './constants'

describe('Compositor', async () => {
  let checks, compositor, publicClient

  beforeEach(async () => {
    const data = await loadFixture(compositorFixture)

    checks = data.checks
    compositor = data.compositor
    publicClient = data.publicClient
  })

  it('should allow compositing 2 tokens to a 40 check', async () => {
    await expect(compositor.write.composite(
      [[[ HOLDER_CHECKS_80[0], HOLDER_CHECKS_80[1] ]]],
      { account: HOLDER }
    ))
      .to.emit(checks, 'Composite')
      .withArgs(HOLDER_CHECKS_80[0], HOLDER_CHECKS_80[1], 40)

    const check = await checks.read.getCheck([ HOLDER_CHECKS_80[0] ])

    expect(check.checksCount).to.equal(40)
  })

  it('should allow compositing 4 tokens to a 20 check', async () => {
    await expect(compositor.write.composite(
      [[ HOLDER_CHECKS_80.slice(0, 4) ]],
      { account: HOLDER }
    ))
      .to.emit(checks, 'Composite')
      .withArgs(HOLDER_CHECKS_80[0], HOLDER_CHECKS_80[2], 40)
      .to.emit(checks, 'Composite')
      .withArgs(HOLDER_CHECKS_80[1], HOLDER_CHECKS_80[3], 40)
      .to.emit(checks, 'Composite')
      .withArgs(HOLDER_CHECKS_80[0], HOLDER_CHECKS_80[1], 20)

    const check = await checks.read.getCheck([ HOLDER_CHECKS_80[0] ])

    expect(check.checksCount).to.equal(20)
  })

  it('should allow compositing 64 tokens to a single check', async () => {
    await expect(compositor.write.composite(
      [[ HOLDER_CHECKS_80.slice(0, 64) ]],
      { account: HOLDER }
    ))
      .to.emit(checks, 'Composite')
      .withArgs(HOLDER_CHECKS_80[0], HOLDER_CHECKS_80[32], 40)
      .to.emit(checks, 'Composite')
      .withArgs(HOLDER_CHECKS_80[0], HOLDER_CHECKS_80[1], 1)

    const check = await checks.read.getCheck([ HOLDER_CHECKS_80[0] ])

    expect(check.checksCount).to.equal(1)
  })

  it('should allow compositing 64 tokens to a single check and simulate result', async () => {
    const { result: tokenURI } = await publicClient.simulateContract({
      address: compositor.address,
      abi: compositor.abi,
      functionName: 'compositeAndRender',
      args: [[ HOLDER_CHECKS_80.slice(0, 64) ]],
      account: HOLDER,
    })

    const data = decodeBase64URI(tokenURI)

    expect(data.name).to.equal(`Checks 10314`)
    expect(data.image).to.equal(HOLDER_CHECK_COMPOSITE_IMAGE)
  })

  it('should prevent compositing and uneven number of tokens', async () => {
    await expect(compositor.write.composite(
      [[[ HOLDER_CHECKS_80[0], HOLDER_CHECKS_80[1], HOLDER_CHECKS_80[2] ]]],
      { account: HOLDER }
    ))
      .to.be.revertedWithCustomError(compositor, 'InvalidTokenCount')

    await expect(compositor.write.composite(
      [[[ HOLDER_CHECKS_80[0] ]]],
      { account: HOLDER }
    ))
      .to.be.revertedWithCustomError(compositor, 'InvalidTokenCount')

    await expect(compositor.write.composite(
      [[ HOLDER_CHECKS_80 ]],
      { account: HOLDER }
    ))
      .to.be.revertedWithCustomError(compositor, 'InvalidTokenCount')
  })

  it('should allow compositing multiple sets of tokens with different checks counts', async () => {
    await expect(compositor.write.composite(
      [[
        [...JALIL_CHECKS_80],
        [JALIL_CHECKS_40[0], JALIL_CHECKS_80[0]],
        [JALIL_CHECKS_20[0], JALIL_CHECKS_40[0]],
      ]],
      { account: JALIL_VAULT }
    ))
      .to.emit(checks, 'Composite')
      .withArgs(JALIL_CHECKS_80[0], JALIL_CHECKS_80[1], 40)
      .to.emit(checks, 'Composite')
      .withArgs(JALIL_CHECKS_40[0], JALIL_CHECKS_80[0], 20)
      .to.emit(checks, 'Composite')
      .withArgs(JALIL_CHECKS_20[0], JALIL_CHECKS_40[0], 10)
  })

  it('should prevent compositing other peoples\' tokens', async () => {
    await expect(compositor.write.composite(
      [[
        [...JALIL_CHECKS_80, ...HOLDER_CHECKS_80.slice(0, 2)],
      ]],
      { account: HOLDER }
    ))
      .to.be.revertedWithCustomError(compositor, 'InvalidTokenOwnership')

    await expect(compositor.write.composite(
      [[
        JALIL_CHECKS_80
      ]],
    ))
      .to.be.revertedWithCustomError(compositor, 'InvalidTokenOwnership')
  })
})
