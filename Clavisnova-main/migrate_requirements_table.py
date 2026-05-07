#!/usr/bin/env python3
"""
迁移requirements表，重命名字段使其更有意义
"""

import sqlite3
import os
from pathlib import Path

def migrate_requirements_table():
    """迁移requirements表，重命名字段"""
    db_path = Path(__file__).parent / 'backend' / 'data' / 'Clavisnova.db'

    if not db_path.exists():
        print(f"❌ 数据库文件不存在: {db_path}")
        return

    print(f"🔄 开始迁移数据库: {db_path}")

    conn = sqlite3.connect(str(db_path))
    cursor = conn.cursor()

    try:
        # 检查当前表结构
        cursor.execute("PRAGMA table_info(requirements)")
        columns = cursor.fetchall()
        print("📋 当前requirements表结构:")
        for col in columns:
            print(f"  {col[1]} ({col[2]})")

        # 检查是否有数据
        cursor.execute("SELECT COUNT(*) FROM requirements")
        count = cursor.fetchone()[0]
        print(f"📊 当前有 {count} 条记录")

        if count > 0:
            # 创建新表
            print("🏗️ 创建新表结构...")
            cursor.execute('''
                CREATE TABLE requirements_new (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    school_name TEXT,
                    current_pianos TEXT,
                    preferred_type TEXT,
                    teacher_name TEXT,
                    background TEXT,
                    commitment TEXT,
                    ip_address VARCHAR(45),
                    user_agent TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            ''')

            # 复制数据
            print("📋 复制数据到新表...")
            cursor.execute('''
                INSERT INTO requirements_new (
                    id, school_name, current_pianos, preferred_type,
                    teacher_name, background, commitment,
                    ip_address, user_agent, created_at, updated_at
                )
                SELECT
                    id, info1, info2, info3, info4, info5, info6,
                    ip_address, user_agent, created_at, updated_at
                FROM requirements
            ''')

            # 验证数据迁移
            cursor.execute("SELECT COUNT(*) FROM requirements_new")
            new_count = cursor.fetchone()[0]
            print(f"✅ 新表有 {new_count} 条记录")

            # 删除旧表，重命名新表
            print("🔄 重命名表...")
            cursor.execute("DROP TABLE requirements")
            cursor.execute("ALTER TABLE requirements_new RENAME TO requirements")

            # 创建索引
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_requirements_created_at ON requirements(created_at)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_requirements_school_name ON requirements(school_name)")

        else:
            # 如果没有数据，直接创建新表结构
            print("🏗️ 创建新的requirements表结构...")
            cursor.execute("DROP TABLE IF EXISTS requirements")
            cursor.execute('''
                CREATE TABLE requirements (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    school_name TEXT,
                    current_pianos TEXT,
                    preferred_type TEXT,
                    teacher_name TEXT,
                    background TEXT,
                    commitment TEXT,
                    ip_address VARCHAR(45),
                    user_agent TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            ''')

        # 验证最终表结构
        cursor.execute("PRAGMA table_info(requirements)")
        new_columns = cursor.fetchall()
        print("📋 迁移后的requirements表结构:")
        for col in new_columns:
            print(f"  {col[1]} ({col[2]})")

        # 提交事务
        conn.commit()
        print("✅ 数据库迁移完成！")

    except Exception as e:
        print(f"❌ 迁移失败: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_requirements_table()
