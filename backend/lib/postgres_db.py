import os
import json
from sqlalchemy import create_engine, Column, Integer, String, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import QueuePool

# Database URL configuration
# Default to localhost for VPS host access to Docker container
DATABASE_URL = os.environ.get('DATABASE_URL', 'postgresql://hbrl_admin:HardbanRecordsLab2026!@localhost:5432/hbrl_central')

Base = declarative_base()

class WebookDocument(Base):
    __tablename__ = 'webook_documents'
    
    id = Column(Integer, primary_key=True)
    collection = Column(String(64), index=True, nullable=False)
    data = Column(JSONB, nullable=False)

# Create engine
try:
    engine = create_engine(
        DATABASE_URL,
        pool_size=5,
        max_overflow=10,
        pool_pre_ping=True
    )
    
    # Create tables if not exist
    Base.metadata.create_all(engine)
    
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    print(f"Successfully connected to Postgres DB: {DATABASE_URL}")
except Exception as e:
    print(f"Failed to connect to Postgres DB: {e}")
    # Fallback to in-memory for testing if DB fails (optional, but safer to fail loud in prod)
    SessionLocal = None

class PostgresQueryBuilder:
    def __init__(self, data):
        self.data = data
        
    def sort(self, field, direction):
        # In-memory sort
        self.data.sort(key=lambda x: str(x.get(field, "")), reverse=(direction == -1))
        return self
        
    def to_list(self, limit=None):
        return self.data[:limit] if limit else self.data

class PostgresCollection:
    def __init__(self, name):
        self.name = name
        
    def _get_session(self):
        if SessionLocal:
            return SessionLocal()
        raise Exception("Database connection not initialized")
        
    def find_one(self, query, projection=None):
        session = self._get_session()
        try:
            stmt = session.query(WebookDocument).filter(WebookDocument.collection == self.name)
            if query:
                stmt = stmt.filter(WebookDocument.data.contains(query))
                
            result = stmt.first()
            if result:
                return result.data
            return None
        finally:
            session.close()

    def find(self, query=None, projection=None):
        session = self._get_session()
        try:
            stmt = session.query(WebookDocument).filter(WebookDocument.collection == self.name)
            if query:
                stmt = stmt.filter(WebookDocument.data.contains(query))
                
            results = stmt.all()
            data = [r.data for r in results]
            return PostgresQueryBuilder(data)
        finally:
            session.close()

    def insert_one(self, doc):
        session = self._get_session()
        try:
            db_doc = WebookDocument(collection=self.name, data=doc)
            session.add(db_doc)
            session.commit()
            return doc
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()

    def update_one(self, query, update):
        session = self._get_session()
        try:
            stmt = session.query(WebookDocument).filter(WebookDocument.collection == self.name)
            if query:
                stmt = stmt.filter(WebookDocument.data.contains(query))
            
            record = stmt.first()
            if record:
                current_data = dict(record.data)
                
                if "$set" in update:
                    current_data.update(update["$set"])
                elif "$inc" in update:
                    for k, v in update["$inc"].items():
                        current_data[k] = current_data.get(k, 0) + v
                else:
                    current_data.update(update)
                
                record.data = current_data
                session.commit()
                return True
            return False
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()

    def delete_one(self, query):
        session = self._get_session()
        try:
            stmt = session.query(WebookDocument).filter(WebookDocument.collection == self.name)
            if query:
                stmt = stmt.filter(WebookDocument.data.contains(query))
            
            record = stmt.first()
            if record:
                session.delete(record)
                session.commit()
                return True
            return False
        finally:
            session.close()

    def delete_many(self, query):
        session = self._get_session()
        try:
            stmt = session.query(WebookDocument).filter(WebookDocument.collection == self.name)
            if query:
                stmt = stmt.filter(WebookDocument.data.contains(query))
            
            # Note: bulk delete with JSONB filter might be slow for large tables
            # but using delete() with synchronization is safer
            deleted_count = stmt.delete(synchronize_session=False)
            session.commit()
            return True
        finally:
            session.close()

    def count_documents(self, query):
        session = self._get_session()
        try:
            stmt = session.query(WebookDocument).filter(WebookDocument.collection == self.name)
            if query:
                stmt = stmt.filter(WebookDocument.data.contains(query))
            return stmt.count()
        finally:
            session.close()

class PostgresDB:
    def __init__(self):
        self.collections = {}

    def __getattr__(self, name):
        if name not in self.collections:
            self.collections[name] = PostgresCollection(name)
        return self.collections[name]
