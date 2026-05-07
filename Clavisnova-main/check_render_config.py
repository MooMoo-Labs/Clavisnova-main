#!/usr/bin/env python3
"""
Clavisnova Render Deployment Configuration Checker
检查Render + Supabase + Cloudflare Pages部署配置
"""

import os
import sys
import re
from pathlib import Path

def print_header():
    print("🎹 Clavisnova Render Deployment Checker")
    print("=" * 50)

def print_success(message):
    print(f"✅ {message}")

def print_warning(message):
    print(f"⚠️  {message}")

def print_error(message):
    print(f"❌ {message}")

def check_env_file():
    """检查.env文件"""
    print("\n📋 检查环境配置文件...")

    env_file = Path(".env")
    if not env_file.exists():
        print_warning(".env文件不存在，将从env.example创建")
        example_file = Path("env.example")
        if example_file.exists():
            print_success("找到env.example文件")
            return True
        else:
            print_error("env.example文件也不存在")
            return False

    print_success(".env文件存在")

    # 检查必需的环境变量
    required_vars = ['DATABASE_URL', 'SECRET_KEY', 'FRONTEND_URL']
    missing_vars = []

    with open(env_file, 'r') as f:
        content = f.read()

    for var in required_vars:
        if f"{var}=" not in content:
            missing_vars.append(var)

    if missing_vars:
        print_error(f"缺少必需的环境变量: {', '.join(missing_vars)}")
        return False

    print_success("所有必需的环境变量都已配置")
    return True

def check_database_url():
    """检查数据库URL格式"""
    print("\n🗄️  检查数据库配置...")

    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        # 尝试从.env文件读取
        env_file = Path(".env")
        if env_file.exists():
            with open(env_file, 'r') as f:
                for line in f:
                    if line.startswith('DATABASE_URL='):
                        database_url = line.split('=', 1)[1].strip()
                        break

    if not database_url:
        print_error("DATABASE_URL未设置")
        return False

    # 检查Supabase URL格式
    supabase_pattern = r'postgresql://postgres:.+@db\..+\.supabase\.co:5432/postgres'
    if re.match(supabase_pattern, database_url):
        print_success("DATABASE_URL格式正确（Supabase）")
        return True
    else:
        print_warning("DATABASE_URL格式可能不正确，请确保是Supabase PostgreSQL URL")
        print_info("格式应为: postgresql://postgres:PASSWORD@db.PROJECT-REF.supabase.co:5432/postgres")
        return False

def check_frontend_url():
    """检查前端URL"""
    print("\n🌐 检查前端配置...")

    frontend_url = os.getenv('FRONTEND_URL')
    if not frontend_url:
        env_file = Path(".env")
        if env_file.exists():
            with open(env_file, 'r') as f:
                for line in f:
                    if line.startswith('FRONTEND_URL='):
                        frontend_url = line.split('=', 1)[1].strip()
                        break

    if not frontend_url:
        print_error("FRONTEND_URL未设置")
        return False

    # 检查Cloudflare Pages URL格式
    if 'pages.dev' in frontend_url or 'cloudflare' in frontend_url.lower():
        print_success("FRONTEND_URL配置正确")
        return True
    else:
        print_warning("FRONTEND_URL可能不是Cloudflare Pages URL")
        return True  # 不算错误，只是警告

def check_docker_config():
    """检查Docker配置"""
    print("\n🐳 检查Docker配置...")

    dockerfile = Path("backend/Dockerfile")
    if not dockerfile.exists():
        print_error("backend/Dockerfile不存在")
        return False

    print_success("Dockerfile存在")

    # 检查render.yaml
    render_yaml = Path("render.yaml")
    if render_yaml.exists():
        print_success("render.yaml配置文件存在")
    else:
        print_warning("render.yaml不存在，将需要手动配置Render")

    return True

def check_secret_key():
    """检查SECRET_KEY安全性"""
    print("\n🔐 检查安全配置...")

    secret_key = os.getenv('SECRET_KEY')
    if not secret_key:
        env_file = Path(".env")
        if env_file.exists():
            with open(env_file, 'r') as f:
                for line in f:
                    if line.startswith('SECRET_KEY='):
                        secret_key = line.split('=', 1)[1].strip()
                        break

    if not secret_key or secret_key == 'your-secret-key-change-in-production':
        print_error("SECRET_KEY未设置或使用默认值，请生成安全的密钥")
        print_info("生成安全密钥: openssl rand -hex 32")
        return False

    if len(secret_key) < 32:
        print_warning("SECRET_KEY长度建议至少32字符")

    print_success("SECRET_KEY已配置")
    return True

def print_info(message):
    print(f"ℹ️  {message}")

def print_summary():
    """打印总结"""
    print("\n" + "=" * 50)
    print("📋 部署检查总结")
    print("=" * 50)
    print("如果所有检查都通过，您的配置应该可以正常部署到Render")
    print("\n🚀 部署步骤:")
    print("1. 推送代码到GitHub")
    print("2. 在Render中创建Web Service")
    print("3. 配置环境变量")
    print("4. 部署应用")
    print("\n📖 详细指南请参考: RENDER_DEPLOYMENT.md")

def main():
    print_header()

    checks = [
        check_env_file,
        check_database_url,
        check_frontend_url,
        check_docker_config,
        check_secret_key
    ]

    all_passed = True
    for check in checks:
        if not check():
            all_passed = False

    print_summary()

    if not all_passed:
        print("\n⚠️  请修复上述问题后再进行部署")
        sys.exit(1)
    else:
        print("\n✅ 配置检查通过！准备部署到Render")

if __name__ == "__main__":
    main()
