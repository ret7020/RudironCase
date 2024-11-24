#ifndef MAP_H
#define MAP_H


#include "typedef.h"
#include "memory_pool.h"


struct MapPair{
    String  key;
    DWORD   value;
    MapPair *next_pair;
};


class Map{
    private:
    MapPair *first_pair;
    MapPair *last_pair;

    public:
    Map();
    ~Map();

    DWORD& operator[](String key);
    int    find(String key);
    int    addNewPair(String key, DWORD value);
    void   deletePair(String key);
    void   deleteAll();
    void   freeServos();
};


#endif