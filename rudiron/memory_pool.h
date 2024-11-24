#ifndef MEMORY_POOL_H
#define MEMORY_POOL_H


#include "typedef.h"


#define MEMORY_POOL_MAX_NUM_BLOCKS  8
#define MEMORY_BLOCK_SIZE           2000  // bytes
#define MEMORY_BLOCK_FREE_MAP_SIZE  MEMORY_BLOCK_SIZE/8
#define MRMORY_BLOCK_CHUNK_SIZE     4


struct MemoryBlock{
    BYTE         free_map[MEMORY_BLOCK_FREE_MAP_SIZE];
    PChunkType    chunks[MEMORY_BLOCK_SIZE];
    MemoryBlock  *next_block;
};

class MemoryPool{
    private:
    MemoryBlock   *first_block;
    MemoryBlock   *last_block;
    PBlockIndex    num_blocks;

    MemoryBlock*  _createNewBlock();
    PChunkType*    _allocateChunks(PBlockIndex block_i, PChunkIndex num_chunks);
    int           _freeChunks(PChunkType *start_chunk, PChunkIndex num_chunks);

    public:
    MemoryPool();
    ~MemoryPool();

    int    initializePool();
    int    finalizePool();
    void*  allocate(DWORD size);
    int    free(void *ptr, DWORD size);
    template <class TYPE>
    int    freeDestruct(TYPE *ptr, DWORD count);
};


extern MemoryPool GlobalMemoryPool;


#endif