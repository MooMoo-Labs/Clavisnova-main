#!/usr/bin/env python3
"""
测试前端文件路径
"""

import sys
import os
from pathlib import Path

# 添加backend到路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

def test_frontend_paths():
    """测试前端路径"""
    print("🧪 测试前端路径配置...")

    # 计算FRONTEND_DIR (模拟main.py中的逻辑)
    script_dir = Path(__file__).parent
    FRONTEND_DIR = script_dir / 'frontend'

    print(f"脚本目录: {script_dir}")
    print(f"前端目录: {FRONTEND_DIR}")
    print(f"前端目录存在: {FRONTEND_DIR.exists()}")

    if FRONTEND_DIR.exists():
        html_files = list(FRONTEND_DIR.glob('*.html'))
        print(f"HTML文件: {[f.name for f in html_files]}")

        index_file = FRONTEND_DIR / 'index.html'
        print(f"index.html存在: {index_file.exists()}")

        # 测试读取文件
        try:
            with open(index_file, 'r', encoding='utf-8') as f:
                content = f.read()
                print(f"✅ 可以读取index.html，长度: {len(content)} 字符")
                print(f"开头内容: {content[:100]}...")
        except Exception as e:
            print(f"❌ 读取文件失败: {e}")

def test_flask_send():
    """测试Flask send_from_directory"""
    print("\n🧪 测试Flask send_from_directory...")

    try:
        from flask import Flask, send_from_directory

        script_dir = Path(__file__).parent
        FRONTEND_DIR = script_dir / 'frontend'

        app = Flask(__name__)

        with app.app_context():
            try:
                response = send_from_directory(FRONTEND_DIR, 'index.html', mimetype='text/html')
                print("✅ send_from_directory成功")
                print(f"响应类型: {type(response)}")
                if hasattr(response, 'status_code'):
                    print(f"状态码: {response.status_code}")
            except Exception as e:
                print(f"❌ send_from_directory失败: {e}")

    except ImportError as e:
        print(f"❌ 导入Flask失败: {e}")

if __name__ == "__main__":
    test_frontend_paths()
    test_flask_send()




