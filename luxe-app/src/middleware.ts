// Next.js Security Middleware
import { NextRequest, NextResponse } from 'next/server';
import { SecurityHeaders, RateLimiter, SecurityAuditLogger } from '@/lib/security/securityUtils';

// Security middleware for all routes
export function middleware(request: NextRequest) {
  const startTime = Date.now();
  const { pathname } = request.nextUrl;
  const clientIP = getClientIP(request);
  const userAgent = request.headers.get('user-agent') || 'unknown';

  // Skip middleware for static files and API routes (handled separately)
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next();
  }

  // Log security events
  SecurityAuditLogger.logSecurityEvent('PAGE_REQUEST', {
    pathname,
    method: request.method,
    ip: clientIP,
    userAgent,
    referer: request.headers.get('referer'),
    timestamp: new Date().toISOString()
  }, 'low');

  // Rate limiting for page requests
  const rateLimitKey = `page:${clientIP}:${pathname}`;
  if (RateLimiter.isRateLimited(rateLimitKey, 60, 15 * 60 * 1000)) { // 60 requests per 15 minutes
    SecurityAuditLogger.logSecurityEvent('PAGE_RATE_LIMITED', {
      pathname,
      ip: clientIP,
      userAgent
    }, 'high');

    return new NextResponse('Too many requests', { 
      status: 429,
      headers: {
        'Retry-After': '900' // 15 minutes
      }
    });
  }

  // Check for suspicious patterns
  if (isSuspiciousRequest(request)) {
    SecurityAuditLogger.logSecurityEvent('SUSPICIOUS_REQUEST', {
      pathname,
      ip: clientIP,
      userAgent,
      suspiciousPatterns: detectSuspiciousPatterns(request)
    }, 'high');

    return new NextResponse('Forbidden', { status: 403 });
  }

  // Create response with security headers
  const response = NextResponse.next();
  
  // Add security headers
  const securityHeaders = SecurityHeaders.getSecurityHeaders();
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Add custom security headers
  response.headers.set('X-Request-ID', generateRequestId());
  response.headers.set('X-Response-Time', `${Date.now() - startTime}ms`);

  // HSTS for HTTPS
  if (request.nextUrl.protocol === 'https:') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  return response;
}

// Get client IP address
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (cfConnectingIP) return cfConnectingIP;
  if (realIP) return realIP;
  if (forwarded) return forwarded.split(',')[0].trim();
  
  return 'unknown';
}

// Generate unique request ID
function generateRequestId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Check for suspicious request patterns
function isSuspiciousRequest(request: NextRequest): boolean {
  const { pathname, searchParams } = request.nextUrl;
  const userAgent = request.headers.get('user-agent') || '';
  
  // Check for common attack patterns
  const suspiciousPatterns = [
    /\.\./,  // Directory traversal
    /<script/i,  // XSS attempts
    /union.*select/i,  // SQL injection
    /javascript:/i,  // JavaScript injection
    /eval\(/i,  // Code injection
    /base64/i,  // Base64 encoding (potential obfuscation)
  ];

  // Check URL path
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(pathname)) {
      return true;
    }
  }

  // Check query parameters
  for (const [key, value] of searchParams.entries()) {
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(key) || pattern.test(value)) {
        return true;
      }
    }
  }

  // Check for suspicious user agents
  const suspiciousUserAgents = [
    /sqlmap/i,
    /nikto/i,
    /nmap/i,
    /masscan/i,
    /zap/i,
    /burp/i,
    /w3af/i,
    /havij/i,
    /acunetix/i,
  ];

  for (const pattern of suspiciousUserAgents) {
    if (pattern.test(userAgent)) {
      return true;
    }
  }

  // Check for excessive parameter length
  const totalParamLength = Array.from(searchParams.entries())
    .reduce((total, [key, value]) => total + key.length + value.length, 0);
  
  if (totalParamLength > 10000) { // 10KB limit
    return true;
  }

  return false;
}

// Detect specific suspicious patterns
function detectSuspiciousPatterns(request: NextRequest): string[] {
  const patterns: string[] = [];
  const { pathname, searchParams } = request.nextUrl;
  const userAgent = request.headers.get('user-agent') || '';

  if (/\.\./.test(pathname)) patterns.push('directory_traversal');
  if (/<script/i.test(pathname)) patterns.push('xss_attempt');
  if (/union.*select/i.test(pathname)) patterns.push('sql_injection');
  if (/javascript:/i.test(pathname)) patterns.push('javascript_injection');
  if (/eval\(/i.test(pathname)) patterns.push('code_injection');
  if (/sqlmap/i.test(userAgent)) patterns.push('sqlmap_scanner');
  if (/nikto/i.test(userAgent)) patterns.push('nikto_scanner');
  if (/nmap/i.test(userAgent)) patterns.push('nmap_scanner');

  return patterns;
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
