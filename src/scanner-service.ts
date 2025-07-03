import { RPCProvider } from 'fafo-scanner'
import { NullifiersIndexer } from './nullifiers-indexer'
import { RPC_URL, RAILGUN_PROXY_ADDRESS } from './config'

export class ScannerService {
  private provider: RPCProvider
  private indexer: NullifiersIndexer

  constructor() {
    this.provider = new RPCProvider(
      RPC_URL,
      RAILGUN_PROXY_ADDRESS,
      3
    )
    this.indexer = new NullifiersIndexer(this.provider)
  }

  async initializeFromBlock(startHeight: bigint, endHeight?: bigint): Promise<void> {
    await this.indexer.initialize(startHeight, endHeight)
  }

  getNullifiersIndexer(): NullifiersIndexer {
    return this.indexer
  }

  async startLiveSync(startHeight: bigint): Promise<void> {
    const liveIterator = this.provider.from({
      startHeight,
      chunkSize: 499n,
      liveSync: true
    })

    for await (const blockData of liveIterator) {
      // TODO: Process live block data and extract nullifiers
      // This needs to be implemented based on actual block structure
      console.log('Processing live block:', blockData)
    }
  }
}
