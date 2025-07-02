// Design considerations:
// I think D.I here is pretty much applicable
// We have a downstream module which basically needs to consume data from the railgun scanner
// Listen to new events happening, checking if the nullifiers exist, do not, etc

export class NullifiersIndexer {
 #scanner: RailgunScanner
 #latestBlock: bigint | null
 #set: Set<Nullifier>

 constructor(scanner: RailgunScanner) {
   this.#scanner = scanner
   this.#set = new Set<Nullifiers>()
 }

 //
 // initialize fills up the first round of the set, scans up to date for nullifiers,
 // // THIS NOT EFFICIENT, PROLLY PROVIDING A FIXED BLOCK RANGE
 public initialize(): void {
   if (this.latestBlock != null) {
    throw new Error('Nullifier-Indexer has already been initialized')
   }

   // whenever we initialize the nullifier set, do we need to scan up to latest block date ?? or to a fixed block ?
   // scanner already exists so it should already handle having all the data ??
   const dataStream = scanner.from(blockRange) // ???
   for await (const blockInfo in dataStream) {
     const rawNullifier = blockInfo.transaction.nullifiers;
     const nullifier = parseRawNullifier(rawNullifier) // doesn't this have to be done by the formatter ? keep it here for now
     if (!this.#set.exists(nullifier.id)) {
       this.#set.add(nullifier.id, nullifier)
     }
   }
 }

 public get(id: string): Nullifier | null {
   return this.#set.get(id)
 }

 public add(nullifier: Nullifier): void {
   if (this.existsNullifier(nullifier.id)) {
     throw new Error('Nullifier already exists on set')
   }

   this.#set.add(nullifier.id, nullifier)
   return;
 }

 public exists(id: string): boolean {
   const nullifier = this.#set.get(id)
   return !!nullifier;
 }

 // @@ TODOV1: Store nullifiers locally, somehow
 // public storeNullifiers()

}
