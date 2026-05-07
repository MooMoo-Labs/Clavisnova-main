#!/usr/bin/env python3
"""
安装Excel导出所需的依赖
"""

import subprocess
import sys

def install_openpyxl():
    """安装openpyxl库"""
    print("📦 安装Excel导出所需的openpyxl库...")
    print("这需要几秒钟时间...\n")

    try:
        # 尝试安装openpyxl
        result = subprocess.run([
            sys.executable, "-m", "pip", "install", "openpyxl==3.1.2"
        ], capture_output=True, text=True, timeout=60)

        if result.returncode == 0:
            print("✅ openpyxl库安装成功！")

            # 验证安装
            try:
                import openpyxl
                print(f"✅ openpyxl版本: {openpyxl.__version__}")
                print("🎉 Excel导出功能现在可以使用了！")
                return True
            except ImportError:
                print("❌ 安装似乎成功了，但无法导入openpyxl")
                return False
        else:
            print("❌ 安装失败:")
            print("错误信息:", result.stderr)
            return False

    except subprocess.TimeoutExpired:
        print("❌ 安装超时")
        return False
    except Exception as e:
        print(f"❌ 安装过程中出错: {e}")
        return False

def check_all_dependencies():
    """检查所有依赖"""
    print("🔍 检查依赖状态...")

    core_packages = [
        ('flask', 'Web框架'),
        ('sqlalchemy', '数据库ORM'),
        ('flask_cors', '跨域支持'),
    ]

    optional_packages = [
        ('openpyxl', 'Excel文件处理'),
    ]

    print("\n📦 核心依赖:")
    core_good = True
    for package, description in core_packages:
        try:
            __import__(package.replace('_', ''))
            print(f"✅ {package} - {description}")
        except ImportError:
            print(f"❌ {package} - {description} (未安装)")
            core_good = False

    print("\n📊 可选依赖:")
    excel_available = True
    for package, description in optional_packages:
        try:
            __import__(package)
            print(f"✅ {package} - {description}")
        except ImportError:
            print(f"⚠️  {package} - {description} (未安装)")
            excel_available = False

    return core_good, excel_available

if __name__ == "__main__":
    print("🎼 Clavisnova Excel导出依赖安装工具")
    print("=" * 50)

    # 检查现有依赖
    core_good, excel_available = check_all_dependencies()

    if not core_good:
        print("\n❌ 缺少核心依赖，请先安装:")
        print("pip install -r backend/requirements.txt")
        sys.exit(1)

    if excel_available:
        print("\n✅ 所有依赖都已安装！")
        print("\n🎯 使用方法:")
        print("1. 启动服务器: python3 start.py")
        print("2. 访问管理后台: http://localhost:8080/admin.html")
        print("3. 点击 'Export All Data' 按钮")
        print("4. 下载Excel文件")
        sys.exit(0)

    # 安装openpyxl
    print("\n📦 需要安装Excel导出功能...")
    success = install_openpyxl()

    if success:
        print("\n🎉 Excel导出功能安装完成！")
        print("\n🎯 现在可以:")
        print("1. 启动服务器: python3 start.py")
        print("2. 访问管理后台: http://localhost:8080/admin.html")
        print("3. 点击 'Export All Data' 按钮")
        print("4. 下载Excel文件")
    else:
        print("\n❌ 安装失败")
        print("\n🔧 手动安装方法:")
        print("1. 打开终端")
        print("2. 运行: pip install openpyxl==3.1.2")
        print("3. 重新运行此脚本验证安装")
        sys.exit(1)
