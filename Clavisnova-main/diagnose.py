#!/usr/bin/env python3
"""
诊断脚本 - 检查Clavisnova项目配置
"""

import os
import sys
from pathlib import Path

def diagnose_project():
    """诊断项目配置"""
    print("🔍 Clavisnova项目诊断")
    print("=" * 50)

    # 1. 检查当前工作目录
    cwd = os.getcwd()
    print(f"📁 当前工作目录: {cwd}")

    # 2. 检查项目结构
    print("\n🏗️  项目结构检查:")

    # 检查backend目录
    backend_dir = Path(cwd) / 'backend'
    print(f"   backend目录: {backend_dir.exists()}")
    if backend_dir.exists():
        main_py = backend_dir / 'main.py'
        print(f"   main.py文件: {main_py.exists()}")

    # 检查frontend目录
    frontend_dir = Path(cwd) / 'frontend'
    print(f"   frontend目录: {frontend_dir.exists()}")
    if frontend_dir.exists():
        index_html = frontend_dir / 'index.html'
        print(f"   index.html文件: {index_html.exists()}")
        if index_html.exists():
            print(f"   index.html大小: {index_html.stat().st_size} bytes")

    # 3. 检查Python路径
    print(f"\n🐍 Python路径:")
    for i, path in enumerate(sys.path[:3]):
        print(f"   {i+1}. {path}")

    # 4. 测试导入
    print(f"\n📦 模块导入测试:")
    try:
        sys.path.insert(0, str(backend_dir))
        from config import settings
        print(f"   ✅ config导入成功，端口: {settings.port}")

        from flask import Flask, send_from_directory
        print("   ✅ Flask导入成功")
        # 测试路径计算（模拟main.py中的逻辑）
        current_file = backend_dir / 'main.py'
        frontend_calc = Path(os.path.dirname(os.path.abspath(str(current_file)))).parent / 'frontend'
        print(f"   计算的前端路径: {frontend_calc}")
        print(f"   前端路径存在: {frontend_calc.exists()}")

        if frontend_calc.exists():
            index_file = frontend_calc / 'index.html'
            print(f"   index.html存在: {index_file.exists()}")

            # 测试send_from_directory
            app = Flask(__name__)
            with app.test_request_context():
                try:
                    response = send_from_directory(frontend_calc, 'index.html', mimetype='text/html')
                    print("   ✅ send_from_directory测试成功")
                except Exception as e:
                    print(f"   ❌ send_from_directory测试失败: {e}")

    except Exception as e:
        print(f"   ❌ 导入失败: {e}")
        import traceback
        traceback.print_exc()

    # 5. 建议
    print(f"\n💡 建议:")
    if not frontend_dir.exists():
        print("   - 前端目录不存在，请确保frontend文件夹在项目根目录")
    elif not (frontend_dir / 'index.html').exists():
        print("   - index.html文件不存在，请检查frontend/index.html")
    else:
        print("   - 文件结构正常，尝试运行: python3 start.py")
        print("   - 如果仍有问题，请检查是否有权限问题")

if __name__ == "__main__":
    diagnose_project()
