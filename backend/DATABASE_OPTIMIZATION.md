# Database Connection Optimization

This document explains the database connection optimizations implemented to prevent connection exhaustion errors.

## Problem

The error `"remaining connection slots are reserved for roles with privileges of the "pg_use_reserved_connections" role"` indicates that your PostgreSQL database has reached its maximum connection limit.

## Solutions Implemented

### 1. Optimized Connection Pool Settings

**Before:**
- `max_overflow=10` (too many additional connections)
- `pool_size` not explicitly set
- No statement timeout

**After:**
- `pool_size=5` (maintain 5 connections)
- `max_overflow=5` (allow 5 additional connections, total 10)
- `pool_recycle=300` (recycle connections every 5 minutes)
- `pool_timeout=30` (wait 30 seconds for connection)
- `statement_timeout=30000` (30 second statement timeout)

### 2. Environment-Specific Settings

**Production:**
- `pool_size=3`
- `max_overflow=3`
- `pool_recycle=600` (10 minutes)

**Development:**
- `pool_size=10`
- `max_overflow=10`
- `pool_recycle=300` (5 minutes)

### 3. Connection Pool Monitoring

New endpoints added:
- `/health` - Optimized health check (uses cached status)
- `/debug/pool-status` - Real-time pool status monitoring

### 4. Configuration Management

New environment variables:
```bash
# Database Connection Pool Settings
DB_POOL_SIZE=5
DB_MAX_OVERFLOW=5
DB_POOL_TIMEOUT=30
DB_POOL_RECYCLE=300
DB_CONNECT_TIMEOUT=10
DB_STATEMENT_TIMEOUT=30000

# Database Monitoring Settings
ENABLE_POOL_MONITORING=true
LOG_POOL_STATUS_INTERVAL=300
MAX_CONNECTION_WARNINGS=80
```

## Monitoring Tools

### 1. Pool Status Endpoint
```bash
curl http://your-server/debug/pool-status
```

### 2. Monitoring Script
```bash
python monitor_db.py http://your-server
```

### 3. Continuous Monitoring
```bash
python monitor_db.py http://your-server --continuous
```

## Best Practices

### 1. Connection Management
- Always use the `get_db()` dependency for database sessions
- Sessions are automatically closed after each request
- Use `get_db_session()` for background tasks

### 2. Query Optimization
- Keep queries simple and efficient
- Use indexes on frequently queried columns
- Avoid N+1 query problems

### 3. Connection Limits
- Monitor connection usage regularly
- Set appropriate timeouts
- Use connection pooling effectively

## Troubleshooting

### High Connection Usage
1. Check pool status: `/debug/pool-status`
2. Look for long-running queries
3. Check for connection leaks
4. Consider increasing pool size temporarily

### Connection Timeouts
1. Check network connectivity
2. Verify database server is responsive
3. Review connection timeout settings
4. Check for firewall issues

### Performance Issues
1. Monitor query performance
2. Check for missing indexes
3. Review connection pool settings
4. Consider query optimization

## Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_POOL_SIZE` | 5 | Number of connections to maintain |
| `DB_MAX_OVERFLOW` | 5 | Additional connections allowed |
| `DB_POOL_TIMEOUT` | 30 | Seconds to wait for connection |
| `DB_POOL_RECYCLE` | 300 | Seconds before recycling connections |
| `DB_CONNECT_TIMEOUT` | 10 | Connection timeout |
| `DB_STATEMENT_TIMEOUT` | 30000 | Statement timeout in milliseconds |
| `ENABLE_POOL_MONITORING` | true | Enable pool monitoring |
| `LOG_POOL_STATUS_INTERVAL` | 300 | Log pool status every N seconds |
| `MAX_CONNECTION_WARNINGS` | 80 | Warn at N% connection usage |

## Deployment Notes

1. Update your environment variables in production
2. Monitor connection usage after deployment
3. Adjust pool settings based on actual usage
4. Set up alerts for high connection usage

## Additional Resources

- [SQLAlchemy Connection Pooling](https://docs.sqlalchemy.org/en/14/core/pooling.html)
- [PostgreSQL Connection Limits](https://www.postgresql.org/docs/current/runtime-config-connection.html)
- [FastAPI Database Dependencies](https://fastapi.tiangolo.com/tutorial/dependencies/) 