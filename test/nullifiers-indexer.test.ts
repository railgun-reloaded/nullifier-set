
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

  test('should initialize properly, scan nullifiers', () => {
    // TODO: Implement when block processing is ready
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
