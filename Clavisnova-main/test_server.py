#!/usr/bin/env python3
"""
简单的服务器测试脚本
"""

import requests
import time
import json

def test_health():
    """测试健康检查端点"""
    try:
        response = requests.get('http://localhost:8080/api/health', timeout=5)
        print(f"✅ 健康检查: {response.status_code}")
        print(f"   响应: {response.json()}")
        return True
    except Exception as e:
        print(f"❌ 健康检查失败: {e}")
        return False

def test_registration():
    """测试注册提交"""
    data = {
        "manufacturer": "Steinway",
        "model": "Model D",
        "serial": "123456",
        "year": 1995,
        "height": "Grand Piano",
        "finish": "Excellent",
        "color_wood": "Black",
        "city_state": "New York, NY"
    }

    try:
        response = requests.post('http://localhost:8080/api/registration',
                               json=data, timeout=10)
        print(f"✅ 注册测试: {response.status_code}")
        print(f"   响应: {response.json()}")
        return True
    except Exception as e:
        print(f"❌ 注册测试失败: {e}")
        return False

def test_requirements():
    """测试需求提交"""
    data = {
        "info1": "Test School",
        "info2": "5",
        "info3": "Upright Piano",
        "info4": "John Teacher",
        "info5": "We need pianos for our music program",
        "info6": "Commitment accepted"
    }

    try:
        response = requests.post('http://localhost:8080/api/requirements',
                               json=data, timeout=10)
        print(f"✅ 需求测试: {response.status_code}")
        print(f"   响应: {response.json()}")
        return True
    except Exception as e:
        print(f"❌ 需求测试失败: {e}")
        return False

def test_admin_stats():
    """测试管理统计"""
    try:
        response = requests.get('http://localhost:8080/api/admin/stats', timeout=5)
        print(f"✅ 管理统计: {response.status_code}")
        print(f"   响应: {response.json()}")
        return True
    except Exception as e:
        print(f"❌ 管理统计失败: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Clavisnova 服务器测试")
    print("=" * 40)

    print("1. 测试健康检查...")
    health_ok = test_health()

    if not health_ok:
        print("\n❌ 服务器似乎没有运行。请先启动服务器:")
        print("   python3 start.py")
        exit(1)

    print("\n2. 测试注册提交...")
    test_registration()

    print("\n3. 测试需求提交...")
    test_requirements()

    print("\n4. 测试管理统计...")
    test_admin_stats()

    print("\n✅ 测试完成!")
    print("\n📱 前端地址: http://localhost:8080")
    print("👨‍💼 管理后台: http://localhost:8080/admin.html")