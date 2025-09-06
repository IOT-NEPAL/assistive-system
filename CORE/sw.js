// Service Worker for Offline Support
const CACHE_NAME = 'sewa-sathi-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/sewa-sathi-modular.js',
    '/vision-assistant.js',
    '/voice-command-library.js',
    '/colorblind-accessibility.js',
    '/touch-to-speech.js',
    '/api-handler.js',
    '/demo.html',
    '/ACCESSIBILITY_FEATURES.md',
    // Add any other static assets
    'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest/dist/tf.min.js',
    'https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@latest/dist/coco-ssd.min.js'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
            .catch((error) => {
                console.log('Cache install failed:', error);
            })
    );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached version or fetch from network
                if (response) {
                    return response;
                }
                
                // Clone the request for network fetch
                const fetchRequest = event.request.clone();
                
                return fetch(fetchRequest).then((response) => {
                    // Check if valid response
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    
                    // Clone the response for caching
                    const responseToCache = response.clone();
                    
                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseToCache);
                        });
                    
                    return response;
                }).catch(() => {
                    // Return offline page for navigation requests
                    if (event.request.mode === 'navigate') {
                        return caches.match('/index.html');
                    }
                });
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

// Push notifications
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : 'New update available',
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'View Updates',
                icon: '/icon-192x192.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/icon-192x192.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('Sewa Sathi', options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Background sync function
async function doBackgroundSync() {
    try {
        // Sync any offline data when connection is restored
        const offlineData = await getOfflineData();
        if (offlineData && offlineData.length > 0) {
            await syncOfflineData(offlineData);
        }
    } catch (error) {
        console.log('Background sync failed:', error);
    }
}

// Get offline data from IndexedDB
async function getOfflineData() {
    return new Promise((resolve) => {
        const request = indexedDB.open('SewaSathiOffline', 1);
        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction(['offlineData'], 'readonly');
            const store = transaction.objectStore('offlineData');
            const getAllRequest = store.getAll();
            
            getAllRequest.onsuccess = () => {
                resolve(getAllRequest.result);
            };
        };
        request.onerror = () => {
            resolve([]);
        };
    });
}

// Sync offline data to server
async function syncOfflineData(data) {
    try {
        const response = await fetch('/api/sync-offline-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            // Clear offline data after successful sync
            await clearOfflineData();
        }
    } catch (error) {
        console.log('Sync failed:', error);
    }
}

// Clear offline data from IndexedDB
async function clearOfflineData() {
    return new Promise((resolve) => {
        const request = indexedDB.open('SewaSathiOffline', 1);
        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction(['offlineData'], 'readwrite');
            const store = transaction.objectStore('offlineData');
            const clearRequest = store.clear();
            
            clearRequest.onsuccess = () => {
                resolve();
            };
        };
    });
}

