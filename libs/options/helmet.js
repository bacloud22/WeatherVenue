import { createRequire } from 'module'
const require = createRequire(import.meta.url)

export default {
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'same-site' },
    contentSecurityPolicy: {
        directives: {
            ...require('@fastify/helmet').contentSecurityPolicy.getDefaultDirectives(),
            'default-src': ["'self'", 'cdn.jsdelivr.net', 'https://*.googleapis.com'],
            'script-src': [
                "'self'",
                "'unsafe-inline'",
                "'unsafe-eval'",
                'cdn.jsdelivr.net',
                'https://*.googleapis.com',
                'https://*.gstatic.com',
                '*.google.com',
                'https://*.ggpht.com',
                '*.googleusercontent.com',
                'unpkg.com',
                'https://*.googletagmanager.com',
                'https://*.cookiebot.com'
            ],
            'script-src-attr': ["'unsafe-inline'"],
            'img-src': [
                "'self'",
                'https://*.googleapis.com',
                'https://*.gstatic.com',
                '*.google.com',
                '*.googleusercontent.com',
                'openweathermap.org',
                'https://*.google-analytics.com',
                'https://*.googletagmanager.com',
                'data:',
            ],
            'frame-src': [
                '*.google.com',
                'https://*.cookiebot.com'
            ],
            'connect-src': [
                "'self'",
                'https://*.googleapis.com',
                '*.google.com',
                'https://*.gstatic.com',
                'https://*.google-analytics.com',
                'https://*.analytics.google.com',
                'https://*.googletagmanager.com',
                'https://*.cookiebot.com',
                'data: blob:',

            ],
            'font-src': ['https://fonts.gstatic.com', 'cdn.jsdelivr.net'],
            'style-src': ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net', 'https://fonts.googleapis.com', 'unpkg.com'],
        },
    },
}
