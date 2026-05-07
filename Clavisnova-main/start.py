#!/usr/bin/env python3
"""
Clavisnova 启动脚本
启动后端Flask服务器，提供前端文件服务
"""

import os
import sys
import subprocess

# Add backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

def check_python_version():
    """检查Python版本"""
    if sys.version_info < (3, 8):
        print("❌ 需要Python 3.8或更高版本")
        sys.exit(1)
    print(f"✅ Python版本: {sys.version.split()[0]}")

def check_dependencies():
    """检查依赖"""
    try:
        import flask
        import sqlalchemy
        print("✅ 核心依赖包检查通过")

        # 检查Excel导出依赖（可选）
        try:
            import openpyxl
            print("✅ Excel导出功能可用")
        except ImportError:
            print("⚠️  Excel导出功能不可用")
            print("   如需Excel导出，请运行: pip install openpyxl==3.1.2")
            print("   或运行: python3 install_excel_export.py")

    except ImportError as e:
        print(f"❌ 缺少核心依赖包: {e}")
        print("请运行: pip install -r backend/requirements.txt")
        sys.exit(1)

def start_server():
    """启动服务器"""
    print("🚀 启动Clavisnova服务器...")

    # 获取项目根目录
    project_root = os.path.dirname(os.path.abspath(__file__))
    frontend_dir = os.path.join(project_root, 'frontend')
    backend_dir = os.path.join(project_root, 'backend')

    print(f"📁 项目根目录: {project_root}")
    print(f"📁 前端目录: {frontend_dir}")
    print(f"📁 后端目录: {backend_dir}")

    # 验证前端文件存在
    if not os.path.exists(frontend_dir):
        print(f"❌ 前端目录不存在: {frontend_dir}")
        print("请确保frontend文件夹在项目根目录中")
        return

    index_file = os.path.join(frontend_dir, 'index.html')
    if not os.path.exists(index_file):
        print(f"❌ index.html不存在: {index_file}")
        print("请确保index.html文件存在")
        return

    print("✅ 前端文件验证通过")
    print("📱 前端地址: http://localhost:8080")
    print("👨‍💼 管理后台: http://localhost:8080/admin.html")
    print("🛑 按 Ctrl+C 停止服务器")

    # 设置PYTHONPATH
    env = os.environ.copy()
    env['PYTHONPATH'] = backend_dir

    # 切换到backend目录并启动
    os.chdir(backend_dir)
    print(f"🔄 切换到目录: {backend_dir}")

    # 启动Flask服务器
    subprocess.run([sys.executable, 'main.py'], env=env)

if __name__ == "__main__":
    print("🎹 Clavisnova 启动器")
    print("=" * 40)

    check_python_version()
    check_dependencies()
    print()

    try:
        start_server()
    except KeyboardInterrupt:
        print("\n🛑 服务器已停止")
    except Exception as e:
        print(f"\n❌ 启动失败: {e}")
        sys.exit(1)
