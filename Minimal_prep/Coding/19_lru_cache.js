/**
 * Q19 | LRU Cache Design
 * Difficulty : Hard
 * Pattern    : HashMap + Doubly Linked List
 * Companies  : Amazon, Google, Microsoft
 *
 * PROBLEM:
 *   Design LRU (Least Recently Used) cache with O(1) get and put.
 *   get(key)       → return value or -1
 *   put(key, val)  → insert/update; evict LRU if over capacity
 *
 * APPROACH:
 *   HashMap for O(1) lookup.
 *   Doubly Linked List to track usage order (head=MRU, tail=LRU).
 *   On access/insert → move node to head.
 *   On evict → remove tail.
 *
 * TIME: O(1) get/put  SPACE: O(capacity)
 */

class DLLNode {
  constructor(key, val) {
    this.key = key; this.val = val;
    this.prev = null; this.next = null;
  }
}

class LRUCache {
  constructor(capacity) {
    this.cap  = capacity;
    this.map  = new Map();
    // dummy head (MRU side) and tail (LRU side)
    this.head = new DLLNode(0, 0);
    this.tail = new DLLNode(0, 0);
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  _remove(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }

  _insertFront(node) {
    node.next = this.head.next;
    node.prev = this.head;
    this.head.next.prev = node;
    this.head.next = node;
  }

  get(key) {
    if (!this.map.has(key)) return -1;
    const node = this.map.get(key);
    this._remove(node);
    this._insertFront(node); // mark as recently used
    return node.val;
  }

  put(key, val) {
    if (this.map.has(key)) this._remove(this.map.get(key));
    const node = new DLLNode(key, val);
    this._insertFront(node);
    this.map.set(key, node);

    if (this.map.size > this.cap) {
      const lru = this.tail.prev; // least recently used
      this._remove(lru);
      this.map.delete(lru.key);
    }
  }
}

// --- Tests ---
const cache = new LRUCache(2);
cache.put(1, 1);
cache.put(2, 2);
console.log(cache.get(1));    // 1
cache.put(3, 3);              // evicts key 2
console.log(cache.get(2));    // -1
cache.put(4, 4);              // evicts key 1
console.log(cache.get(1));    // -1
console.log(cache.get(3));    // 3
console.log(cache.get(4));    // 4
