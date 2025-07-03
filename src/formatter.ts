import type { EVMBlock, EVMLog } from 'fafo-scanner/src/models'
import type { Nullifier } from './model'

export function extractNullifiersFromBlock(blockData: EVMBlock): Nullifier[] {
  const nullifiers: Nullifier[] = []

  if (!blockData.transactions) {
    return nullifiers
  }

  blockData.transactions.forEach(tx => {
    if (!tx.logs) {
      return
    }

    tx.logs.forEach(log => {
      if (log.name === 'Nullifiers') {
        const extractedNullifiers = extractNullifiersFromEvent(log, blockData, tx.hash)
        nullifiers.push(...extractedNullifiers)
      }
    })
  })

  return nullifiers
}

function extractNullifiersFromEvent(
  log: EVMLog, 
  blockData: EVMBlock, 
  transactionHash: string
): Nullifier[] {
  const nullifiers: Nullifier[] = []

  if (!log.args || !log.args['nullifier'] || !Array.isArray(log.args['nullifier'])) {
    return nullifiers
  }

  const treeNumber = parseInt(log.args['treeNumber']?.toString() || '0', 10)
  const nullifierArray = log.args['nullifier'] as string[]

  nullifierArray.forEach(nullifierValue => {
    const nullifierString = nullifierValue.toString()
    const nullifier: Nullifier = {
      id: nullifierString,
      blockNumber: Number(blockData.number),
      blockTimestamp: blockData.timestamp.toString(),
      transactionHash,
      treeNumber,
      nullifier: [nullifierString]
    }

    nullifiers.push(nullifier)
  })

  return nullifiers
}