#!/usr/bin/env python3
"""
添加测试数据用于测试导出功能
"""

import sys
import os
from pathlib import Path

# 添加backend到路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

def add_test_data():
    """添加测试数据"""
    print("🎹 添加钢琴注册测试数据...")

    try:
        from config import settings
        from models import Registration, Requirements
        from sqlalchemy import create_engine
        from sqlalchemy.orm import sessionmaker

        # 使用正确的数据库路径
        db_path = Path(__file__).parent / 'backend' / 'data' / 'Clavisnova.db'
        db_url = f"sqlite:///{db_path}"

        engine = create_engine(db_url)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

        db = SessionLocal()
        try:
            # 添加钢琴注册测试数据
            test_registrations = [
                {
                    'manufacturer': 'Steinway & Sons',
                    'model': 'Model D',
                    'serial': '123456',
                    'year': 1995,
                    'height': '52.5',
                    'finish': 'Polished Ebony',
                    'color_wood': 'Black Ebony',
                    'city_state': 'New York, NY'
                },
                {
                    'manufacturer': 'Yamaha',
                    'model': 'C7X',
                    'serial': '789012',
                    'year': 2010,
                    'height': '48.5',
                    'finish': 'Satin Walnut',
                    'color_wood': 'Brown Walnut',
                    'city_state': 'Los Angeles, CA'
                },
                {
                    'manufacturer': 'Bosendorfer',
                    'model': 'Imperial 290',
                    'serial': '345678',
                    'year': 2005,
                    'height': '55.5',
                    'finish': 'High Gloss',
                    'color_wood': 'Black Spruce',
                    'city_state': 'Chicago, IL'
                }
            ]

            for i, reg_data in enumerate(test_registrations, 1):
                reg = Registration(**reg_data)
                db.add(reg)
                print(f"✅ 添加注册记录 {i}: {reg_data['manufacturer']} {reg_data['model']}")

            # 添加需求测试数据
            test_requirements = [
                {
                    'info1': 'Grand Piano',
                    'info2': 'Concert Hall',
                    'info3': 'Professional',
                    'info4': 'Monthly',
                    'info5': 'New York',
                    'info6': 'Advanced'
                },
                {
                    'info1': 'Upright Piano',
                    'info2': 'School',
                    'info3': 'Educational',
                    'info4': 'Weekly',
                    'info5': 'Boston',
                    'info6': 'Intermediate'
                }
            ]

            for i, req_data in enumerate(test_requirements, 1):
                req = Requirements(**req_data)
                db.add(req)
                print(f"✅ 添加需求记录 {i}")

            db.commit()
            print(f"\n🎉 成功添加 {len(test_registrations)} 条注册记录和 {len(test_requirements)} 条需求记录")
            print("现在可以测试Excel导出功能了！")

        finally:
            db.close()

    except Exception as e:
        print(f"❌ 错误: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    add_test_data()



