#include <Arduino.h>
#include <stddef.h>
#include <stdio.h>
#include <new>
#include "memory_pool.h"


MemoryPool::MemoryPool(){
    first_block = NULL;
    last_block = NULL;
    num_blocks = 0;
}

// frees all blocks in the memory pool (does not call desctruct for allocated data)
MemoryPool::~MemoryPool(){
    finalizePool();
}

// create and initialize new block and return its pointer
// [return] if successful: pointer to MemoryBlock, if not: NULL
MemoryBlock* MemoryPool::_createNewBlock(){
    MemoryBlock *new_block;
    new_block = new MemoryBlock;

    // initialize block data
    for(PChunkIndex i=0; i<MEMORY_BLOCK_FREE_MAP_SIZE; i++){
        new_block->free_map[i] = 0;
    }
    new_block->next_block = NULL;

    return new_block;
}

// find avaliable chunks in memory block and if successful set bits of allocated chunks in free_map
// block_i    - block in which data will
// num_chunks - how many cunks need to allocate
// [return]   - if successful: pointer to first chunk, if not: NULL
PChunkType* MemoryPool::_allocateChunks(PBlockIndex block_i, PChunkIndex num_chunks){
    // return error if number of chunks greater than MEMORY_BLOCK_SIZE
    if(num_chunks > MEMORY_BLOCK_SIZE){ return NULL; }

    // get required block pointer
    MemoryBlock *block = first_block;
    for(PBlockIndex i=0; i<block_i; i++){
        block = block->next_block;
    }

    // get the index of the chunk after which the number of free chunks >= num_chunks
    bool find = 0;
    PChunkIndex start_chunk = 0;
    PChunkIndex free_chunks_len = 0;
    for(PChunkIndex chunk_set_i=0; chunk_set_i<MEMORY_BLOCK_FREE_MAP_SIZE; chunk_set_i++){
        for(char shift=7; shift>=0; shift--){
            bool bit = (block->free_map[chunk_set_i] >> shift) & 0b1;
            if(free_chunks_len == num_chunks){ find = 1; break; }
            if(!bit && free_chunks_len == 0){
                start_chunk = (chunk_set_i*8+(7-shift));
            }
            if(!bit) { free_chunks_len++; }
            else     { free_chunks_len = 0; }
        }
        if(find == 1){ break; }
    }
    if(find == 0){ return NULL; }

    // zeros the chunks and set the allocation bits
    for(PChunkIndex i=0; i<num_chunks; i++){
        PChunkIndex curr_chunk_i = start_chunk+i;
        block->chunks[start_chunk+i] = 0;
        block->free_map[curr_chunk_i/8] |= 0b1 << (7-(curr_chunk_i%8));
    }

    // return start chunk pointer
    return (block->chunks+start_chunk);
}

// free a sequence of chunks from a memory block (just unset allocation bits and check start_chunk and num_chunks)
// block_i     - index of block where this sequence stored
// start_chunk - index of chunk from which the sequence starts
// num_chunks  - number of chunks in the sequence
int MemoryPool::_freeChunks(PChunkType *start_chunk, PChunkIndex num_chunks){
    // find the block from which the chunks are to be freed
    MemoryBlock *block = first_block;
    PChunkIndex start_chunk_i = 0;
    while(block != NULL){
        if((start_chunk-block->chunks) >= 0){
            QWORD tmp_chunk_i = (QWORD)(start_chunk-block->chunks)/sizeof(PChunkType);
            if(tmp_chunk_i < MEMORY_BLOCK_SIZE){
                start_chunk_i = DWORD(tmp_chunk_i);
                break;
            }
        }
        block = block->next_block;
    }
    if(block == NULL)                                  { return 1; }
    if(start_chunk_i+num_chunks >= MEMORY_BLOCK_SIZE)  { return 1; }

    // unset allocation bits
    for(PChunkIndex i=0; i<num_chunks; i++){
        PChunkIndex curr_chunk_i = start_chunk_i+i;
        block->free_map[curr_chunk_i/8] &= ~(0b1 << (7-(curr_chunk_i%8)));
    }

    return 0;
}

// create first memory block
// [return] - operation status
int MemoryPool::initializePool(){
    MemoryBlock *new_block = _createNewBlock();
    if(new_block == NULL){
        return 1;
    }

    // save pointer to first block
    first_block = new_block;
    last_block = new_block;

    num_blocks = 1;

    return 0;
}

// finalize the pool (frees all blocks without calling destuct for allocated data)
// [return] - operation status
int MemoryPool::finalizePool(){
    if(first_block != NULL && last_block != NULL){
        // free blocks
        MemoryBlock *curr_block = first_block;
        while(curr_block != NULL){
            MemoryBlock *tmp_ptr = curr_block->next_block;
            delete curr_block;
            curr_block = tmp_ptr;
        }
        
        first_block = NULL;
        last_block = NULL;
    }
    return 0;
}

// allocate some space in memory pool
// size     - number of bytes to allocate
// [return] - if successful: pointer to allocated space, if not: NULL
void* MemoryPool::allocate(DWORD size){
    // find the block where the data can be allocated
    PChunkType *chunk_p = NULL;
    PChunkIndex num_chunks = ((size+3) & ~3)/4;
    for(PBlockIndex block_i=0; block_i<num_blocks; block_i++){
        PChunkType *tmp_chunk_p = _allocateChunks(block_i, num_chunks);
        if(tmp_chunk_p == NULL){ continue; }
        chunk_p = tmp_chunk_p;
    }

    // if there is no avaliable chunks in all blocks, create new block
    if(chunk_p == NULL){
        if(num_blocks == MEMORY_POOL_MAX_NUM_BLOCKS){ return NULL; }

        // create new block
        MemoryBlock *new_block = _createNewBlock();
        if(new_block == NULL){ return NULL; }

        // update previous last blocks and pools pointers
        last_block->next_block = new_block;
        last_block = new_block;
        num_blocks++;

        PChunkType *tmp_chuk_p = _allocateChunks(num_blocks-1, num_chunks);
        if(tmp_chuk_p == NULL){ return NULL; }
        chunk_p = tmp_chuk_p;
    }

    return chunk_p;
}

// free allocated space in memory pool (without calling destructor)
// ptr      - pointer to the allocated space
// size     - how many bytes after this pointer need to free
// [return] - operation status
int MemoryPool::free(void *ptr, DWORD size){
    PChunkIndex num_chunks = ((size+3) & ~3)/4;
    int res = _freeChunks((PChunkType*)ptr, num_chunks);
    return res;
}

// free allocated space in memory pool and call destructor
// <TYPE>   - type of data stored by this pointer
// ptr      - pointer to the allocated space
// count    - how many TYPE objects are stored in the allocated space
// [return] - operation status
template <class TYPE>
int MemoryPool::freeDestruct(TYPE *ptr, DWORD count){
    // unset allocation bits
    PChunkIndex num_chunks = ((sizeof(TYPE)*count+3) & ~3)/3;
    int res = _freeChunks((PChunkType*)ptr, num_chunks);
    if(res > 0){ return res; }
    
    // call destructors
    TYPE *tmp_ptr = ptr;
    for(int obj_i=0; obj_i<count; obj_i++){
        tmp_ptr.~TYPE();
        tmp_ptr++;
    }

    return 0;
}