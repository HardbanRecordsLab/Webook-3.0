const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Initialize database
async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        subtitle TEXT,
        author VARCHAR(255),
        description TEXT,
        language VARCHAR(10) DEFAULT 'pl',
        data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS uploads (
        id UUID PRIMARY KEY,
        project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
        filename VARCHAR(255) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        mimetype VARCHAR(100),
        size BIGINT,
        path TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_projects_created ON projects(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_uploads_project ON uploads(project_id);
    `);
    console.log('✅ Database initialized');
  } catch (err) {
    console.error('❌ Database initialization error:', err);
  } finally {
    client.release();
  }
}

initDB();

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|mp3|wav|ogg|mp4|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Invalid file type'));
  }
});

// ============================================================================
// ROUTES
// ============================================================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get all projects
app.get('/api/projects', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title, subtitle, author, created_at, updated_at FROM projects ORDER BY updated_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Get project by ID
app.get('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching project:', err);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// Create new project
app.post('/api/projects', async (req, res) => {
  try {
    const { title, subtitle, author, description, language, data } = req.body;
    const id = uuidv4();
    
    const result = await pool.query(
      `INSERT INTO projects (id, title, subtitle, author, description, language, data)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [id, title, subtitle, author, description, language, JSON.stringify(data)]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating project:', err);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Update project
app.put('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle, author, description, language, data } = req.body;
    
    const result = await pool.query(
      `UPDATE projects 
       SET title = $1, subtitle = $2, author = $3, description = $4, 
           language = $5, data = $6, updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [title, subtitle, author, description, language, JSON.stringify(data), id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating project:', err);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Delete project
app.delete('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete associated files
    const uploads = await pool.query('SELECT path FROM uploads WHERE project_id = $1', [id]);
    uploads.rows.forEach(row => {
      try {
        fs.unlinkSync(row.path);
      } catch (err) {
        console.error('Error deleting file:', err);
      }
    });
    
    // Delete project
    const result = await pool.query('DELETE FROM projects WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    console.error('Error deleting project:', err);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// Upload file
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const { projectId } = req.body;
    const fileId = uuidv4();
    
    const fileData = {
      id: fileId,
      project_id: projectId || null,
      filename: req.file.filename,
      original_name: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      url: `/uploads/${req.file.filename}`
    };
    
    // Save to database
    if (projectId) {
      await pool.query(
        `INSERT INTO uploads (id, project_id, filename, original_name, mimetype, size, path)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [fileId, projectId, req.file.filename, req.file.originalname, 
         req.file.mimetype, req.file.size, req.file.path]
      );
    }
    
    res.json(fileData);
  } catch (err) {
    console.error('Error uploading file:', err);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Get project uploads
app.get('/api/projects/:id/uploads', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT id, filename, original_name, mimetype, size, created_at FROM uploads WHERE project_id = $1',
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching uploads:', err);
    res.status(500).json({ error: 'Failed to fetch uploads' });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
  ╔════════════════════════════════════════╗
  ║   🚀 DTR STUDIO BACKEND RUNNING       ║
  ║                                        ║
  ║   Port: ${PORT}                          ║
  ║   API:  http://localhost:${PORT}/api     ║
  ║   DB:   PostgreSQL connected           ║
  ╚════════════════════════════════════════╝
  `);
});
