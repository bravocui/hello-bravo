"""
Database connection configuration and monitoring
"""
import os
from typing import Dict, Any

# Database connection pool settings
DB_POOL_CONFIG = {
    "pool_size": int(os.getenv("DB_POOL_SIZE", "5")),           # Number of connections to maintain
    "max_overflow": int(os.getenv("DB_MAX_OVERFLOW", "5")),     # Additional connections allowed
    "pool_timeout": int(os.getenv("DB_POOL_TIMEOUT", "30")),    # Seconds to wait for connection
    "pool_recycle": int(os.getenv("DB_POOL_RECYCLE", "300")),   # Seconds before recycling connections
    "connect_timeout": int(os.getenv("DB_CONNECT_TIMEOUT", "10")), # Connection timeout
    "statement_timeout": int(os.getenv("DB_STATEMENT_TIMEOUT", "30000")), # Statement timeout in ms
}

# Connection monitoring settings
MONITORING_CONFIG = {
    "enable_pool_monitoring": os.getenv("ENABLE_POOL_MONITORING", "true").lower() == "true",
    "log_pool_status_interval": int(os.getenv("LOG_POOL_STATUS_INTERVAL", "300")), # Log every 5 minutes
    "max_connection_warnings": int(os.getenv("MAX_CONNECTION_WARNINGS", "80")), # Warn at 80% usage
}

def get_pool_config() -> Dict[str, Any]:
    """Get database pool configuration"""
    return DB_POOL_CONFIG.copy()

def get_monitoring_config() -> Dict[str, Any]:
    """Get monitoring configuration"""
    return MONITORING_CONFIG.copy()

def print_config():
    """Print current database configuration"""
    print("🔧 Database Configuration:")
    print(f"   📊 Pool Size: {DB_POOL_CONFIG['pool_size']}")
    print(f"   🔄 Max Overflow: {DB_POOL_CONFIG['max_overflow']}")
    print(f"   ⏱️ Pool Timeout: {DB_POOL_CONFIG['pool_timeout']}s")
    print(f"   🔄 Pool Recycle: {DB_POOL_CONFIG['pool_recycle']}s")
    print(f"   🔗 Connect Timeout: {DB_POOL_CONFIG['connect_timeout']}s")
    print(f"   ⏰ Statement Timeout: {DB_POOL_CONFIG['statement_timeout']}ms")
    print(f"   📈 Monitoring Enabled: {MONITORING_CONFIG['enable_pool_monitoring']}")
    print("=" * 60)

# Environment-specific overrides
if os.getenv("ENVIRONMENT") == "production":
    # Production settings - more conservative
    DB_POOL_CONFIG.update({
        "pool_size": int(os.getenv("DB_POOL_SIZE", "3")),  # Smaller pool for production
        "max_overflow": int(os.getenv("DB_MAX_OVERFLOW", "3")),  # Less overflow
        "pool_recycle": int(os.getenv("DB_POOL_RECYCLE", "600")),  # Recycle every 10 minutes
    })
elif os.getenv("ENVIRONMENT") == "development":
    # Development settings - more permissive
    DB_POOL_CONFIG.update({
        "pool_size": int(os.getenv("DB_POOL_SIZE", "10")),  # Larger pool for development
        "max_overflow": int(os.getenv("DB_MAX_OVERFLOW", "10")),  # More overflow
        "pool_recycle": int(os.getenv("DB_POOL_RECYCLE", "300")),  # Recycle every 5 minutes
    }) 