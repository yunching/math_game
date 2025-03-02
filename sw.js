const CACHE_NAME = 'math-game-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  './manifest.json',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

// Install the service worker and cache all assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate the service worker and clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Check if URL is cacheable
function isCacheableUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch (e) {
    return false;
  }
}

// Serve cached content when offline
self.addEventListener('fetch', event => {
  // Skip non-GET requests and non-cacheable URL schemes
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Check if URL is cacheable before proceeding
  if (!isCacheableUrl(event.request.url)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        
        // Clone the request to avoid consuming it
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            try {
              // Clone the response to avoid consuming it
              const responseToCache = response.clone();
              
              // Use a separate async operation to cache the response
              caches.open(CACHE_NAME)
                .then(cache => {
                  // Double check that the URL is still cacheable
                  if (isCacheableUrl(event.request.url)) {
                    cache.put(event.request, responseToCache)
                      .catch(err => console.log('Cache put error:', err));
                  }
                })
                .catch(err => console.log('Cache open error:', err));
                
              return response;
            } catch (err) {
              console.log('Caching error:', err);
              return response;
            }
          }
        ).catch(err => {
          console.log('Fetch error:', err);
          // If network request fails, try to return the offline page
          return caches.match('./index.html');
        });
      })
  );
});