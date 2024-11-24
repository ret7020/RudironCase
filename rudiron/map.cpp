#include <Arduino.h>
#include <Servo.h>
#include <stddef.h>
#include <stdio.h>
#include "map.h"


Map::Map(){
    first_pair = NULL;
    last_pair = NULL;
}

Map::~Map(){
    deleteAll();
}

// get reference to value with passed key
// key - key of value
DWORD& Map::operator[](String key){
    MapPair *curr_pair = first_pair;
    while(curr_pair != NULL){
        if(curr_pair->key == key){
            return curr_pair->value;
        }
        curr_pair = curr_pair->next_pair;
    }

    // if no such key found create one
    addNewPair(key, 0);
    curr_pair = first_pair;
    while(curr_pair != NULL){
        if(curr_pair->key == key){
            return curr_pair->value;
        }
        curr_pair = curr_pair->next_pair;
    }
}

// check is key existed in map
// key - key you want to check
int Map::find(String key){
    MapPair *curr_pair = first_pair;
    while(curr_pair != NULL){
        if(curr_pair->key == key){
            return 1;
        }
    }
    return 0;
}

// add new pair
// key   - key of pair
// value - value of pair
int Map::addNewPair(String key, DWORD value){
    MapPair *curr_pair = (MapPair*)GlobalMemoryPool.allocate(sizeof(MapPair));
    if(curr_pair == NULL){ return 1; }

    curr_pair->key = key;
    curr_pair->value = value;
    curr_pair->next_pair = NULL;

    if(first_pair == NULL){ first_pair = curr_pair; }
    last_pair->next_pair = curr_pair;
    last_pair = curr_pair;

    return 0;
}

// delete pair
// key - key that this pair has
void Map::deletePair(String key){
    MapPair *prev_pair = NULL;
    MapPair *curr_pair = first_pair;
    while(curr_pair != NULL){
        if(curr_pair->key == key){ break; }
        prev_pair = curr_pair;
        curr_pair = curr_pair->next_pair;
    }
    if(prev_pair != NULL){
        prev_pair->next_pair = curr_pair->next_pair;
    }else{
        first_pair = curr_pair->next_pair;
    }
    GlobalMemoryPool.free((void*)curr_pair, 1);
}

// delete all pairs from map
void Map::deleteAll(){
    MapPair *curr_pair = first_pair;
    while(curr_pair != NULL){
        MapPair *tmp = curr_pair->next_pair;
        curr_pair->key.~String();
        GlobalMemoryPool.free((void*)curr_pair, sizeof(MapPair));
        curr_pair = tmp;
    }
    first_pair = NULL;
    last_pair = NULL;
}

void Map::freeServos(){
    MapPair *curr_pair = first_pair;
    while(curr_pair != NULL){
        Servo *obj = reinterpret_cast<Servo*>(curr_pair->value);
        obj->detach();
        Serial.println("detached!");
        obj->~Servo();
        GlobalMemoryPool.free((void*)obj, sizeof(Servo));
        curr_pair = curr_pair->next_pair;
    }
}