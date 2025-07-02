
// import assert from 'node:assert'
// import { describe, test } from 'node:test'

import dotenv from 'dotenv'

// import { NullifiersSet } from '../src'

dotenv.config()

const MOCK_RPC_URL = process.env['RPC_API_KEY']!
const RAILGUN_PROXY_ADDRESS = '0xFA7093CDD9EE6932B4eb2c9e1cde7CE00B1FA4b9' as `0x${string}`

describe('Nullifiers tests', () => {
  test('Should create a new nullifier empty set ', () => {
    // @ TODO:
    // const nullifiersSet = new NullifiersSet()
  })

  test('should initialize properly, scan nullifiers', () => {
    // @ TODO:
    // const nullifiersSet = new NullifiersSet()
  })

  test('should be able to check for existing known nullifier', () => {
    // @ TODO:
    // const nullifiersSet = new NullifiersSet()
  })

  test('should not be able to store already existing nullifier', () => {
    // @ TODO:
    // const nullifiersSet = new NullifiersSet()
  })

  test('should be able to store new nullifier', () => {

  })


})
