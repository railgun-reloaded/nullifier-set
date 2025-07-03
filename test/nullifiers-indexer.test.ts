
import assert from 'node:assert'
import { describe, test } from 'node:test'
import { RPCProvider } from 'fafo-scanner'

import { NullifiersIndexer, RPC_URL, RAILGUN_PROXY_ADDRESS, extractNullifiersFromBlock } from '../src'

describe('NullifiersIndexer', () => {
  test('creates nullifier indexer with injected scanner', () => {
    const scanner = new RPCProvider(RPC_URL, RAILGUN_PROXY_ADDRESS, 3)
    const indexer = new NullifiersIndexer(scanner)

    assert.ok(indexer, 'Should create NullifiersIndexer instance')
    assert.strictEqual(indexer.latestBlock, null, 'Should start with null latestBlock')
  })

  test('scans blocks and tracks progress', async () => {
    const scanner = new RPCProvider(RPC_URL, RAILGUN_PROXY_ADDRESS, 3)
    const indexer = new NullifiersIndexer(scanner)

    await indexer.initialize()

    assert.ok(indexer.latestBlock !== null, 'Should track latest block after scanning')
    assert.ok(typeof indexer.latestBlock === 'bigint', 'latestBlock should be bigint')
  })
})

describe('NullifiersIndexer - scan data', () => {
  test('examines scanner data structure to understand nullifier extraction', async () => {
    const scanner = new RPCProvider(RPC_URL, RAILGUN_PROXY_ADDRESS, 3)

    const blockIterator = scanner.from({
      startHeight: 14737691n,
      endHeight: 14737691n + 100n,
      chunkSize: 10n,
      liveSync: false
    })

    let blockCount = 0
    let transactionCount = 0
    let eventCount = 0

    for await (const blockData of blockIterator) {
      blockCount++
      console.log(`Block ${blockData.number}`)
      console.log(`Timestamp: ${blockData.timestamp}`)
      console.log(`Hash: ${blockData.hash}`)
      console.log(`Transactions: ${blockData.transactions?.length || 0}`)

      if (blockData.transactions) {
        blockData.transactions.forEach((tx, txIndex) => {
          transactionCount++
          console.log(`  Transaction ${txIndex}:`)
          console.log(`    Hash: ${tx.hash || 'N/A'}`)
          console.log(`    Logs: ${tx.logs?.length || 0}`)

          if (tx.logs) {
            tx.logs.forEach((log, logIndex) => {
              eventCount++
              console.log(`    Log ${logIndex}:`)
              console.log(`      Address: ${log.address || 'N/A'}`)
              console.log(`      Event Name: ${log.name || 'N/A'}`)
              console.log(`      Args: ${Object.keys(log.args || {}).length} properties`)
            })
          }
        })
      }

      if (blockCount >= 5 && transactionCount > 0) {
        break
      }
    }

    console.log(`Summary:`)
    console.log(`  Blocks examined: ${blockCount}`)
    console.log(`  Transactions found: ${transactionCount}`)
    console.log(`  Events found: ${eventCount}`)

    assert.ok(blockCount > 0, 'Should have examined at least one block')
  })

  test('finds and examines ENullifiersV1 events', async () => {
    const scanner = new RPCProvider(RPC_URL, RAILGUN_PROXY_ADDRESS, 3)

    const blockIterator = scanner.from({
      startHeight: 14755920n,
      endHeight: 14755920n + 5000n,
      chunkSize: 200n,
      liveSync: false
    })

    let nullifierEvents = 0
    let commitmentEvents = 0
    let otherEvents = 0
    let enullifiersV1Events = 0

    for await (const blockData of blockIterator) {
      if (blockData.transactions) {
        blockData.transactions.forEach(tx => {
          if (tx.logs) {
            tx.logs.forEach(log => {
              if (log.name) {
                const eventName = log.name

                if (eventName === 'Nullifiers') {
                  enullifiersV1Events++
                  console.log(`Nullifiers event found:`)
                  console.log(`  Block: ${blockData.number}`)
                  console.log(`  Tx: ${tx.hash}`)
                  console.log(`  Event: ${eventName}`)
                  console.log(`  Args structure:`)
                  console.log(JSON.stringify(log.args, (_key, value) => 
                    typeof value === 'bigint' ? value.toString() : value, 2))
                  
                  if (enullifiersV1Events >= 3) {
                    console.log(`Found ${enullifiersV1Events} Nullifiers events, stopping scan`)
                    return
                  }
                } else if (eventName.includes('Nullifier') ||
                          eventName.includes('nullifier') ||
                          eventName.includes('Nullified')) {
                  nullifierEvents++
                } else if (eventName.includes('Commitment') ||
                          eventName.includes('commitment')) {
                  commitmentEvents++
                } else {
                  otherEvents++
                }
              }
            })
          }
        })
      }
      
      if (enullifiersV1Events >= 3) {
        break
      }
    }

    console.log(`Event Analysis:`)
    console.log(`  Nullifiers events: ${enullifiersV1Events}`)
    console.log(`  Other nullifier events: ${nullifierEvents}`)
    console.log(`  Commitment events: ${commitmentEvents}`)
    console.log(`  Other events: ${otherEvents}`)

    assert.ok(true, 'Analysis completed')
  })

  test('scans for any RAILGUN activity to understand timeline', async () => {
    const scanner = new RPCProvider(RPC_URL, RAILGUN_PROXY_ADDRESS, 3)

    const blockIterator = scanner.from({
      startHeight: 14737691n,
      endHeight: 14737691n + 100000n,
      chunkSize: 1000n,
      liveSync: false
    })

    let totalEvents = 0
    let transactionBlocks = 0
    let eventTypes = new Set<string>()

    for await (const blockData of blockIterator) {
      if (blockData.transactions && blockData.transactions.length > 0) {
        transactionBlocks++
        console.log(`Block ${blockData.number} has ${blockData.transactions.length} transactions`)
        
        blockData.transactions.forEach(tx => {
          if (tx.logs && tx.logs.length > 0) {
            console.log(`  Tx ${tx.hash} has ${tx.logs.length} events:`)
            tx.logs.forEach(log => {
              totalEvents++
              eventTypes.add(log.name)
              console.log(`    - ${log.name}`)
            })
          }
        })

        if (transactionBlocks >= 5) {
          console.log(`Found ${transactionBlocks} blocks with transactions, stopping scan`)
          break
        }
      }
    }

    console.log(`Activity Summary:`)
    console.log(`  Blocks with transactions: ${transactionBlocks}`)
    console.log(`  Total events: ${totalEvents}`)
    console.log(`  Unique event types: ${Array.from(eventTypes).join(', ')}`)

    assert.ok(true, 'Timeline analysis completed')
  })
})

describe('NullifiersIndexer - Nullifier Management', () => {
  test('basic nullifier operations work correctly', () => {
    const scanner = new RPCProvider(RPC_URL, RAILGUN_PROXY_ADDRESS, 3)
    const indexer = new NullifiersIndexer(scanner)

    assert.strictEqual(indexer.exists('fake-nullifier'), false, 'Should return false for non-existent nullifier')
    assert.strictEqual(indexer.get('fake-nullifier'), null, 'Should return null for non-existent nullifier')

    const mockNullifier = {
      id: 'test-nullifier-1',
      blockNumber: 12345,
      blockTimestamp: '1234567890',
      transactionHash: '0xtest123',
      treeNumber: 1,
      nullifier: ['0x123', '0x456']
    }

    indexer.add(mockNullifier)
    assert.strictEqual(indexer.exists('test-nullifier-1'), true, 'Should find added nullifier')
    assert.deepStrictEqual(indexer.get('test-nullifier-1'), mockNullifier, 'Should retrieve correct nullifier data')

    assert.throws(() => indexer.add(mockNullifier), /already exists/, 'Should prevent duplicate nullifiers')

  })
})

describe('Nullifier Formatter', () => {
  test('extracts nullifiers from real block data', async () => {
    const scanner = new RPCProvider(RPC_URL, RAILGUN_PROXY_ADDRESS, 3)
    const blockIterator = scanner.from({
      startHeight: 14755920n,
      endHeight: 14755921n,
      chunkSize: 1n,
      liveSync: false
    })

    for await (const blockData of blockIterator) {
      console.log(`Processing block ${blockData.number}`)
      
      const extractedNullifiers = extractNullifiersFromBlock(blockData)
      
      console.log(`Extracted ${extractedNullifiers.length} nullifiers:`)
      extractedNullifiers.forEach((nullifier, index) => {
        console.log(`  ${index + 1}. ID: ${nullifier.id}`)
        console.log(`     Block: ${nullifier.blockNumber}`)
        console.log(`     Tree: ${nullifier.treeNumber}`)
        console.log(`     Tx: ${nullifier.transactionHash}`)
        console.log(`     Nullifier: ${nullifier.nullifier.join(', ')}`)
      })

      extractedNullifiers.forEach(nullifier => {
        assert.ok(typeof nullifier.id === 'string', 'id should be string')
        assert.ok(typeof nullifier.blockNumber === 'number', 'blockNumber should be number')
        assert.ok(typeof nullifier.blockTimestamp === 'string', 'blockTimestamp should be string')
        assert.ok(typeof nullifier.transactionHash === 'string', 'transactionHash should be string')
        assert.ok(typeof nullifier.treeNumber === 'number', 'treeNumber should be number')
        assert.ok(Array.isArray(nullifier.nullifier), 'nullifier should be array')
      })

      assert.ok(extractedNullifiers.length > 0, 'Should extract at least one nullifier')
      break
    }
  })

  test('demonstrates nullifier indexer with formatter integration', async () => {
    const scanner = new RPCProvider(RPC_URL, RAILGUN_PROXY_ADDRESS, 3)
    const indexer = new NullifiersIndexer(scanner)
    
    const blockIterator = scanner.from({
      startHeight: 14755920n,
      endHeight: 14755922n,
      chunkSize: 2n,
      liveSync: false
    })

    let totalNullifiers = 0

    for await (const blockData of blockIterator) {
      const nullifiers = extractNullifiersFromBlock(blockData)
      
      nullifiers.forEach(nullifier => {
        if (!indexer.exists(nullifier.id)) {
          indexer.add(nullifier)
          totalNullifiers++
        }
      })
      
      console.log(`Block ${blockData.number}: ${nullifiers.length} nullifiers extracted`)
    }

    console.log(`Total nullifiers processed: ${totalNullifiers}`)
    
    assert.ok(totalNullifiers > 0, 'Should have processed some nullifiers')
  })
})
