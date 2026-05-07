#!/usr/bin/env python3
"""
测试Flask路由
"""

import sys
import os
from pathlib import Path

# 添加backend到路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

def test_route_directly():
    """直接测试路由函数"""
    print("🧪 直接测试路由函数...")

    try:
        from flask import Flask
        from main import FRONTEND_DIR

        print(f"FRONTEND_DIR: {FRONTEND_DIR}")
        print(f"FRONTEND_DIR exists: {FRONTEND_DIR.exists()}")

        app = Flask(__name__)

        with app.test_request_context('/'):
            try:
                from flask import send_from_directory
                response = send_from_directory(FRONTEND_DIR, 'index.html', mimetype='text/html')
                print("✅ send_from_directory成功")
                print(f"响应类型: {type(response)}")
                print(f"状态码: {response.status_code}")
                print(f"内容类型: {response.content_type}")

                # 检查响应内容
                content = response.get_data(as_text=True)
                print(f"内容长度: {len(content)} 字符")
                if 'Clavisnova' in content:
                    print("✅ 包含网站标题")
                else:
                    print("⚠️  不包含网站标题")

            except Exception as e:
                print(f"❌ send_from_directory失败: {e}")
                import traceback
                traceback.print_exc()

    except ImportError as e:
        print(f"❌ 导入失败: {e}")

if __name__ == "__main__":
    test_route_directly()




