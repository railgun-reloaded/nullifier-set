import { RPCProvider } from 'fafo-scanner'
import type { EVMBlock } from 'fafo-scanner/src/models'
import { Nullifier } from './model'

const RAILGUN_DEPLOYMENT_BLOCK = 14737691n
const FIXED_END_BLOCK = RAILGUN_DEPLOYMENT_BLOCK + 10000n
const FIXED_CHUNK_SIZE = 499n

export class NullifiersIndexer {
 #scanner: RPCProvider<EVMBlock>
 #latestBlock: bigint | null
 #set: Map<string, Nullifier>

 constructor(scanner: RPCProvider<EVMBlock>) {
   this.#scanner = scanner
   this.#latestBlock = null
   this.#set = new Map<string, Nullifier>()
 }

 public async initialize(): Promise<void> {
   if (this.#latestBlock != null) {
    throw new Error('Nullifier-Indexer has already been initialized')
   }

   const blockIterator = this.#scanner.from({
     startHeight: RAILGUN_DEPLOYMENT_BLOCK,
     endHeight: FIXED_END_BLOCK,
     chunkSize: FIXED_CHUNK_SIZE,
     liveSync: false
   })

   for await (const blockData of blockIterator) {
     console.log(`Processing block ${blockData.number}`)
     this.#latestBlock = blockData.number
   }
 }

 public get(id: string): Nullifier | null {
   return this.#set.get(id) ?? null
 }

 public add(nullifier: Nullifier): void {
   if (this.exists(nullifier.id)) {
     throw new Error('Nullifier already exists on set')
   }

   this.#set.set(nullifier.id, nullifier)
 }

 public exists(id: string): boolean {
   return this.#set.has(id)
 }

 public get latestBlock(): bigint | null {
   return this.#latestBlock
 }
}
