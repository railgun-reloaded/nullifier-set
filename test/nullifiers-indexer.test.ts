
import assert from 'node:assert'
import { describe, test } from 'node:test'
import { RPCProvider } from 'fafo-scanner'

import { NullifiersIndexer, RPC_URL, RAILGUN_PROXY_ADDRESS } from '../src'

describe('Nullifiers tests', () => {
  test('Should create a new nullifier empty set', () => {
    const scanner = new RPCProvider(RPC_URL, RAILGUN_PROXY_ADDRESS, 3)
    const nullifiersIndexer = new NullifiersIndexer(scanner)

    assert.ok(nullifiersIndexer, 'NullifiersIndexer should be created')
  })

  test('should initialize properly, scan nullifiers', async () => {
    const scanner = new RPCProvider(RPC_URL, RAILGUN_PROXY_ADDRESS, 3)
    const nullifiersIndexer = new NullifiersIndexer(scanner)

    await nullifiersIndexer.initialize()

    assert.ok(true, 'Initialize completed without errors')
  })


  // test scanning blocks through the nullifier indexer
  test('should scan blocks through nullifier indexer', async () => {
    const scanner = new RPCProvider(RPC_URL, RAILGUN_PROXY_ADDRESS, 3)
    const nullifiersIndexer = new NullifiersIndexer(scanner)

    // latestBlock should be null before initialization
    assert.strictEqual(nullifiersIndexer.latestBlock, null, 'latestBlock should be null before initialization')

    await nullifiersIndexer.initialize()

    // latestBlock should be set after scanning
    assert.ok(nullifiersIndexer.latestBlock !== null, 'latestBlock should be set after scanning')
    assert.ok(typeof nullifiersIndexer.latestBlock === 'bigint', 'latestBlock should be a bigint')
    console.log(`Scanned up to block: ${nullifiersIndexer.latestBlock}`)
  })

  test('should be able to check for existing known nullifier', () => {
    // TODO: Implement when block processing is ready
  })

  test('should not be able to store already existing nullifier', () => {
    // TODO: Implement when block processing is ready
  })

  test('should be able to store new nullifier', () => {
    // TODO: Implement when block processing is ready
  })

})
