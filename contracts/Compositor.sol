// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Composite single checks in one transaction.
/// @author Visualize Value
contract Compositor {

    /// @dev Reference to Checks Originals
    IChecks immutable CHECKS = IChecks(0x036721e5A769Cc48B3189EFbb9ccE4471E8A48B1);

    /// @dev Thrown if trying to composite an invalid number of tokens
    error InvalidTokenCount();

    /// @dev Thrown when trying to composite unauthorized checks.
    error InvalidTokenOwnership();

    /// @notice Composite multiple checks.
    /// @param tokenSets The token IDs to composite. The first one will be the keeper.
    function composite(uint256[][] calldata tokenSets) public {
        for (uint256 idx = 0; idx < tokenSets.length; idx++) _composite(tokenSets[idx]);
    }

    /// @notice Helper for simulating the result of a composite.
    /// @param tokenSets The token IDs to composite. The first one will be the keeper.
    function compositeAndRender(uint256[][] calldata tokenSets) external returns (string memory tokenURI) {
        composite(tokenSets);

        tokenURI = CHECKS.tokenURI(tokenSets[tokenSets.length - 1][0]);
    }

    /// @dev Recursively composite until only the first token is left.
    function _composite(uint256[] memory tokenIds) internal {
        _validateComposite(tokenIds);

        (uint256[] memory first, uint256[] memory second) = _split(tokenIds);

        CHECKS.compositeMany(first, second);

        if (first.length >= 2) _composite(first);
    }

    /// @dev Split the given array in two. Assumes arrays are always of even length.
    function _split(uint256[] memory arr) internal pure returns (uint256[] memory, uint256[] memory) {
        uint256 mid = arr.length / 2;

        uint256[] memory first = new uint256[](mid);
        uint256[] memory second = new uint256[](mid);

        for (uint256 i = 0; i < mid; i++) {
            first[i] = arr[i];
            second[i] = arr[mid + i];
        }

        return (first, second);
    }

    /// @dev Validate whether a composite is valid.
    function _validateComposite(uint256[] memory tokenIds) internal view {
        uint256 n = tokenIds.length;

        // Tokens count is valid if n >= 2, a power of 2, and <= 64.
        if (n < 2 || (n & (n - 1)) != 0 || n > 64) revert InvalidTokenCount();

        // We have to double check ownership to prevent unintended cross-user composites.
        for (uint256 idx = 0; idx < n; idx++) {
            if (CHECKS.ownerOf(tokenIds[idx]) != msg.sender) revert InvalidTokenOwnership();
        }
    }
}

interface IChecks {
    struct StoredCheck {
        uint16[6] composites;
        uint8[5] colorBands;
        uint8[5] gradients;
        uint8 divisorIndex;
        uint32 epoch;
        uint16 seed;
        uint24 day;
    }

    struct Check {
        StoredCheck stored;
        bool isRevealed;
        uint256 seed;
        uint8 checksCount;
        bool hasManyChecks;
        uint16 composite;
        bool isRoot;
        uint8 colorBand;
        uint8 gradient;
        uint8 direction;
        uint8 speed;
    }

    function ownerOf(uint256 tokenId) external view returns (address owner);
    function compositeMany(uint256[] calldata tokenIds, uint256[] calldata burnIds) external;
    function tokenURI(uint256 tokenId) external view returns (string memory);
}

