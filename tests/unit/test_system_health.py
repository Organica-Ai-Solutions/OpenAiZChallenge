#!/usr/bin/env python3
"""
Comprehensive NIS System Health Check
Tests all major components and endpoints
"""

import requests
import json
import time
import sys
from typing import Dict, Any

def test_backend_health() -> Dict[str, Any]:
    """Test backend API health"""
    try:
        response = requests.get("http://localhost:8000/system/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            return {
                "status": "✅ HEALTHY",
                "details": data,
                "response_time": response.elapsed.total_seconds()
            }
        else:
            return {
                "status": "❌ UNHEALTHY", 
                "details": f"HTTP {response.status_code}",
                "response_time": response.elapsed.total_seconds()
            }
    except Exception as e:
        return {"status": "❌ ERROR", "details": str(e), "response_time": None}

def test_frontend_health() -> Dict[str, Any]:
    """Test frontend availability"""
    try:
        response = requests.get("http://localhost:3000/", timeout=5)
        if response.status_code == 200:
            return {
                "status": "✅ HEALTHY",
                "details": "Frontend responding",
                "response_time": response.elapsed.total_seconds()
            }
        else:
            return {
                "status": "❌ UNHEALTHY",
                "details": f"HTTP {response.status_code}",
                "response_time": response.elapsed.total_seconds()
            }
    except Exception as e:
        return {"status": "❌ ERROR", "details": str(e), "response_time": None}

def test_docker_containers() -> Dict[str, Any]:
    """Test Docker container status"""
    import subprocess
    try:
        result = subprocess.run(
            ["docker", "ps", "--format", "{{.Names}}\t{{.Status}}"],
            capture_output=True, text=True, timeout=10
        )
        if result.returncode == 0:
            lines = result.stdout.strip().split('\n')
            containers = {}
            for line in lines:
                if line.strip():
                    parts = line.split('\t')
                    if len(parts) >= 2:
                        name = parts[0]
                        status = parts[1]
                        containers[name] = "✅ UP" if "Up" in status else "❌ DOWN"
            
            expected_containers = [
                "nis-frontend", "nis-backend", "nis-redis", 
                "nis-kafka", "nis-zookeeper"
            ]
            
            all_healthy = all(
                containers.get(container, "❌ MISSING") == "✅ UP" 
                for container in expected_containers
            )
            
            return {
                "status": "✅ ALL UP" if all_healthy else "⚠️ ISSUES",
                "details": containers,
                "expected": expected_containers
            }
        else:
            return {"status": "❌ ERROR", "details": result.stderr}
    except Exception as e:
        return {"status": "❌ ERROR", "details": str(e)}

def main():
    """Run comprehensive system health check"""
    print("🔍 NIS System Health Check")
    print("=" * 50)
    
    # Test Docker containers
    print("\n📦 Docker Containers:")
    docker_result = test_docker_containers()
    print(f"   Status: {docker_result['status']}")
    if 'details' in docker_result and isinstance(docker_result['details'], dict):
        for container, status in docker_result['details'].items():
            print(f"   {container}: {status}")
    
    # Test Backend
    print("\n🔧 Backend API:")
    backend_result = test_backend_health()
    print(f"   Status: {backend_result['status']}")
    if backend_result['response_time']:
        print(f"   Response Time: {backend_result['response_time']:.3f}s")
    if isinstance(backend_result['details'], dict):
        services = backend_result['details'].get('services', {})
        for service, status in services.items():
            print(f"   {service}: {'✅' if status == 'healthy' else '❌'} {status}")
    
    # Test Frontend
    print("\n🌐 Frontend:")
    frontend_result = test_frontend_health()
    print(f"   Status: {frontend_result['status']}")
    if frontend_result['response_time']:
        print(f"   Response Time: {frontend_result['response_time']:.3f}s")
    
    # Overall Status
    print("\n" + "=" * 50)
    all_healthy = (
        docker_result['status'] == "✅ ALL UP" and
        backend_result['status'] == "✅ HEALTHY" and
        frontend_result['status'] == "✅ HEALTHY"
    )
    
    if all_healthy:
        print("🎉 SYSTEM STATUS: ALL SYSTEMS OPERATIONAL")
        print("✅ Your NIS Protocol is ready for use!")
        print("\n🔗 Access Points:")
        print("   Frontend: http://localhost:3000")
        print("   Backend API: http://localhost:8000/system/health")
        return 0
    else:
        print("⚠️ SYSTEM STATUS: ISSUES DETECTED")
        print("❌ Some components need attention")
        return 1

if __name__ == "__main__":
    sys.exit(main()) 