#!/usr/bin/env python3
"""
检查Clavisnova数据库内容
"""

import sqlite3
import os
from pathlib import Path

def check_database():
    """检查数据库内容"""
    # 数据库路径
    db_path = Path(__file__).parent / 'backend' / 'data' / 'Clavisnova.db'

    if not db_path.exists():
        print(f"❌ 数据库文件不存在: {db_path}")
        return

    print(f"✅ 数据库文件: {db_path}")
    print(f"📊 文件大小: {db_path.stat().st_size} bytes")

    conn = sqlite3.connect(str(db_path))
    cursor = conn.cursor()

    try:
        # 获取所有表
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = cursor.fetchall()

        print(f"\\n📋 数据库表 ({len(tables)}个):")
        for table in tables:
            table_name = table[0]
            cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
            count = cursor.fetchone()[0]
            print(f"  • {table_name}: {count} 条记录")

        # 显示注册记录
        print("\\n🎹 钢琴注册记录:")
        cursor.execute("""
            SELECT id, manufacturer, model, city_state, created_at
            FROM registrations
            ORDER BY created_at DESC
            LIMIT 5
        """)
        registrations = cursor.fetchall()

        if registrations:
            print("ID | 制造商 | 型号 | 城市 | 注册时间")
            print("-" * 50)
            for reg in registrations:
                created_time = reg[4][:19] if reg[4] else 'N/A'
                print(f"{reg[0]} | {reg[1] or 'N/A'} | {reg[2] or 'N/A'} | {reg[3] or 'N/A'} | {created_time}")
        else:
            print("暂无注册记录")

        # 显示需求记录
        print("\\n📚 需求申请记录:")
        cursor.execute("""
            SELECT id, school_name, current_pianos, preferred_type, created_at
            FROM requirements
            ORDER BY created_at DESC
            LIMIT 5
        """)
        requirements = cursor.fetchall()

        if requirements:
            print("ID | 学校名称 | 当前钢琴 | 偏好类型 | 申请时间")
            print("-" * 55)
            for req in requirements:
                created_time = req[4][:19] if req[4] else 'N/A'
                print(f"{req[0]} | {req[1] or 'N/A'} | {req[2] or 'N/A'} | {req[3] or 'N/A'} | {created_time}")
        else:
            print("暂无需求记录")

        # 显示表结构
        print("\\n🏗️ 数据库表结构:")
        for table in tables:
            table_name = table[0]
            if table_name != 'sqlite_sequence':  # 跳过内部表
                print(f"\\n{table_name.upper()} 表:")
                cursor.execute(f"PRAGMA table_info({table_name})")
                columns = cursor.fetchall()
                for col in columns:
                    nullable = "NOT NULL" if col[3] else "NULL"
                    print(f"  {col[1]} ({col[2]}) {nullable}")

    except Exception as e:
        print(f"❌ 数据库检查失败: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    check_database()
