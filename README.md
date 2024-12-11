# Compositor Contracts

## How to use

The `Compositor.sol` contract has one main function: `composite` many
checks originals to the lowest possible check count.

For this to work, users first have to `approve` their checks to the Compositor
contract, and then call the `composite` function on it, passing a 
configuration specifying which checks should be composited 
and in what order.

Separately, the contract exposes a function called `compositeAndRender` which
is intended for use with simulating contract execution. Passing a composite
config to it will return the resulting tokenURI, so users can make sure
they get the single check color they want.

The compositing config is a two-dimensional array that enables passing checks
with different check counts and compositing them in one go.
The most simple config would be a single token set array
(e.g. containing up to 64 80-checks for a single check).

Only the first token in a passed token set will survive - all others will be burned.
So the first token ID in the last token set is the surviving token.

## Dev

This is a [hardhat](https://hardhat.org/) environment. Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Compositor.ts --network localhost
```

