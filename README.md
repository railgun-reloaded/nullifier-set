# Nullifier Set

> A local nullifier tracking module for RAILGUN

```ts
// Scanner provides the data stream
const scanner = new RPCProvider(rpcUrl, contractAddress, chainId)

// Nullifier indexer consumes the stream
const nullifierIndexer = new NullifiersIndexer(scanner)
```

## API

```ts
import { NullifiersIndexer } from 'nullifier-set'

// Initialize with injected scanner
const indexer = new NullifiersIndexer(scanner)
await indexer.initialize()

indexer.exists(nullifierId) // boolean

// Get nullifier metadata
indexer.get(nullifierId) // Nullifier | null

// Add new nullifier to set
indexer.add(nullifier) // void
```

## Data Model

```ts
type Nullifier = {
  id: string              // Nullifier identifier
  blockNumber: number     // Block height
  blockTimestamp: string  // Block timestamp
  transactionHash: string // EVM transaction hash
  treeNumber: number      // RAILGUN tree number
  nullifier: string[]     // Nullifier data array
}
```
