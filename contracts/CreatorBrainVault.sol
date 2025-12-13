// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CreatorBrainVault {
    struct Entry {
        address owner;
        string kind;      // "idea" | "media"
        string content;   // idea text OR description
        string mediaUrl;  // optional: URL to media (image/video/file)
        uint64 createdAt;
        uint64 updatedAt;
    }

    uint256 public nextId;
    mapping(uint256 => Entry) private entries;
    mapping(address => uint256[]) private ownerEntries;

    event EntrySaved(address indexed owner, uint256 indexed id, string kind);
    event EntryUpdated(address indexed owner, uint256 indexed id);

    function saveEntry(
        string calldata kind,
        string calldata content,
        string calldata mediaUrl
    ) external returns (uint256 id) {
        id = ++nextId;

        entries[id] = Entry({
            owner: msg.sender,
            kind: kind,
            content: content,
            mediaUrl: mediaUrl,
            createdAt: uint64(block.timestamp),
            updatedAt: uint64(block.timestamp)
        });

        ownerEntries[msg.sender].push(id);

        emit EntrySaved(msg.sender, id, kind);
    }

    function updateEntry(
        uint256 id,
        string calldata content,
        string calldata mediaUrl
    ) external {
        Entry storage e = entries[id];
        require(e.owner == msg.sender, "Not owner");

        e.content = content;
        e.mediaUrl = mediaUrl;
        e.updatedAt = uint64(block.timestamp);

        emit EntryUpdated(msg.sender, id);
    }

    function getEntry(uint256 id) external view returns (Entry memory) {
        return entries[id];
    }

    function getMyEntryIds() external view returns (uint256[] memory) {
        return ownerEntries[msg.sender];
    }
}
