### Nullifier Set // WIP

Current module is an API to easily check if nullifiers already exist or not.


API:

```ts
// Api should be really similar to what a Set is

const nullifiersSet = new NullifiersSet();

// Check if nullifier exists
// Uint8Array ??? Stringified ? how do we store them ?

// Exists:
nullifiersSet.exists(someNullifier) // true || false

// Get
nullifiersSet.get(existingNullifier) // nullifier || null

// Add
nullifiersSet.add(newNullifier) // void

```



FAQ:

Q: What is a nullifier ?
A: [DRAFT]: Nullifiers are a way of tackling the double spend issue. Every transaction has its nullifier. Notes are just preimages of commitments, that let you "spend". If you apply a _nullifier_ to that note, it can't be spent again


Q: What do I use nullifiers for ?
For making a transaction, you need to generate a nullifier.
Hint: Look at contract-private/helpers/logic/note.ts to get an idea of what they look like and what role do they play

```ts
getNullifyingKey(): Promise<Uint8Array> {
  return hash.poseidon([this.viewingKey]);
}
```

```ts
  /**
   * Calculate nullifier
   *
   * @param leafIndex - leaf index of note
   * @returns nullifier
   */
  async getNullifier(leafIndex: number): Promise<Uint8Array> {
    return hash.poseidon([await this.getNullifyingKey(), bigIntToArray(BigInt(leafIndex), 32)]);
  }
```

 tldr; nullifier = poseidon(hash(poseidon(viewingKey)), bigIntToarray(leafIndex))


Q: Do I need to keep track all of the nullifiers ?
**YES**, you need to keep track of nullifiers. If a commitment doesn't have a related nullifier yet, means it hasn't been spent *yet*. Hence the UTXO (unspent transaction output), it didn't produce an output *yet*.
