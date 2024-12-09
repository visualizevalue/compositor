import hre from 'hardhat'
import { expect } from 'chai'
import { encodeAbiParameters } from 'viem'
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import { compositorFixture } from './fixtures'

describe('Compositor', async () => {
  let compositor, checks

  beforeEach(async () => {
    { compositor } = await loadFixture(compositorFixture)
  })

  it('should allow compositing 2 tokens', async () => {
  })

  it('should allow compositing 4 tokens', async () => {
  })

  it('should prevent compositing and uneven number of tokens', async () => {
  })

  it('should allow compositing multiple sets of tokens with different checks counts', async () => {
  })

  it('should prevent compositing other peoples\' tokens', async () => {
  })
})
