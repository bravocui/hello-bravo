#!/usr/bin/env python3
"""
Database connection pool monitoring script
"""
import time
import requests
import json
from datetime import datetime

def monitor_pool_status(base_url: str = "http://localhost:8000"):
    """Monitor database connection pool status"""
    
    print("🔍 Database Connection Pool Monitor")
    print("=" * 50)
    
    try:
        # Get pool status
        response = requests.get(f"{base_url}/debug/pool-status", timeout=10)
        if response.status_code == 200:
            data = response.json()
            pool_status = data.get("pool_status", {})
            
            print(f"📊 Pool Status at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
            print(f"   📈 Pool Size: {pool_status.get('pool_size', 'N/A')}")
            print(f"   ✅ Checked In: {pool_status.get('checked_in', 'N/A')}")
            print(f"   🔄 Checked Out: {pool_status.get('checked_out', 'N/A')}")
            print(f"   ⚠️ Overflow: {pool_status.get('overflow', 'N/A')}")
            print(f"   ❌ Invalid: {pool_status.get('invalid', 'N/A')}")
            
            # Calculate usage percentage
            pool_size = pool_status.get('pool_size', 0)
            checked_out = pool_status.get('checked_out', 0)
            overflow = pool_status.get('overflow', 0)
            
            if pool_size > 0:
                total_connections = pool_size + overflow
                usage_percentage = (checked_out / total_connections) * 100 if total_connections > 0 else 0
                print(f"   📊 Usage: {usage_percentage:.1f}% ({checked_out}/{total_connections})")
                
                if usage_percentage > 80:
                    print("   ⚠️  WARNING: High connection usage!")
                elif usage_percentage > 60:
                    print("   ⚠️  WARNING: Moderate connection usage")
                else:
                    print("   ✅ Connection usage is normal")
            
        else:
            print(f"❌ Failed to get pool status: {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Error connecting to server: {e}")
    except Exception as e:
        print(f"❌ Error: {e}")

def monitor_health(base_url: str = "http://localhost:8000"):
    """Monitor application health"""
    
    try:
        response = requests.get(f"{base_url}/health", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"🏥 Health Status: {data.get('status', 'unknown')}")
            print(f"   📊 Database: {data.get('database', {}).get('status', 'unknown')}")
            print(f"   🌍 Environment: {data.get('environment', 'unknown')}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Error connecting to server: {e}")

if __name__ == "__main__":
    import sys
    
    base_url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8000"
    
    print(f"🔍 Monitoring server at: {base_url}")
    print()
    
    # Monitor health first
    monitor_health(base_url)
    print()
    
    # Monitor pool status
    monitor_pool_status(base_url)
    
    # If running continuously
    if len(sys.argv) > 2 and sys.argv[2] == "--continuous":
        print("\n🔄 Starting continuous monitoring (Ctrl+C to stop)...")
        try:
            while True:
                time.sleep(30)  # Check every 30 seconds
                print("\n" + "="*50)
                monitor_pool_status(base_url)
        except KeyboardInterrupt:
            print("\n🛑 Monitoring stopped") 