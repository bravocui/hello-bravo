# Backend Tools

This directory contains utility scripts for monitoring, debugging, and maintenance.

## Available Tools

### `monitor_db.py`
Database connection pool monitoring script.

**Usage:**
```bash
# Basic monitoring
python3 tools/monitor_db.py

# Monitor specific server
python3 tools/monitor_db.py http://other-server:8000

# Continuous monitoring
python3 tools/monitor_db.py --continuous
```

**Features:**
- Database connection pool statistics
- Health check monitoring
- Usage percentage calculations
- Warning alerts for high connection usage
- Continuous monitoring mode

**Endpoints used:**
- `/health` - Application health status
- `/debug/pool-status` - Database pool statistics 