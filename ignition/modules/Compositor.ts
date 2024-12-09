import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'

const CompositorModule = buildModule('CompositorModule', (m) => {
  const compositor = m.contract('Compositor', [], {})

  return { compositor }
})

export default CompositorModule
