#!/usr/bin/env python3
"""
Migration script to add is_visible column to categories table
"""

import sqlite3
import os

def add_category_visibility():
    # Database path
    db_path = os.path.join(os.path.dirname(__file__), 'instance', 'cms.db')
    
    if not os.path.exists(db_path):
        print(f"Database not found at: {db_path}")
        return
    
    print(f"Adding is_visible column to categories table in: {db_path}")
    
    try:
        # Connect to database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if column already exists
        cursor.execute("PRAGMA table_info(categories)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'is_visible' in columns:
            print("Column 'is_visible' already exists in categories table")
            return
        
        # Add the is_visible column with default value True
        cursor.execute("ALTER TABLE categories ADD COLUMN is_visible BOOLEAN DEFAULT 1 NOT NULL")
        
        # Update all existing categories to be visible
        cursor.execute("UPDATE categories SET is_visible = 1")
        
        # Commit changes
        conn.commit()
        
        print("Successfully added is_visible column to categories table")
        print("All existing categories set to visible (is_visible = True)")
        
    except sqlite3.Error as e:
        print(f"Database error: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == '__main__':
    add_category_visibility()