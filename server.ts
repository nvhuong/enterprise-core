import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import db from './db';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// API Routes

// --- Companies ---
app.get('/api/v1/companies', (req, res) => {
  try {
    const companies = db.prepare('SELECT * FROM company ORDER BY created_at DESC').all();
    res.json(companies);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.get('/api/v1/companies/:id', (req, res) => {
  try {
    const company = db.prepare('SELECT * FROM company WHERE id = ?').get(req.params.id);
    if (company) {
      res.json(company);
    } else {
      res.status(404).json({ error: 'Company not found' });
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post('/api/v1/companies', (req, res) => {
  try {
    const { name, company_type, tax_code, status } = req.body;
    const id = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO company (id, name, company_type, tax_code, status)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(id, name, company_type, tax_code, status || 'ACTIVE');
    const newCompany = db.prepare('SELECT * FROM company WHERE id = ?').get(id);
    res.status(201).json(newCompany);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.put('/api/v1/companies/:id', (req, res) => {
  try {
    const { name, company_type, tax_code, status } = req.body;
    const stmt = db.prepare(`
      UPDATE company 
      SET name = ?, company_type = ?, tax_code = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    const info = stmt.run(name, company_type, tax_code, status, req.params.id);
    if (info.changes > 0) {
      const updatedCompany = db.prepare('SELECT * FROM company WHERE id = ?').get(req.params.id);
      res.json(updatedCompany);
    } else {
      res.status(404).json({ error: 'Company not found' });
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.delete('/api/v1/companies/:id', (req, res) => {
  try {
    const info = db.prepare('DELETE FROM company WHERE id = ?').run(req.params.id);
    if (info.changes > 0) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Company not found' });
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// --- Employees ---
app.get('/api/v1/companies/:companyId/employees', (req, res) => {
  try {
    const employees = db.prepare('SELECT * FROM employee WHERE company_id = ?').all(req.params.companyId);
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// --- Organization Units ---
app.get('/api/v1/companies/:companyId/units', (req, res) => {
  try {
    const units = db.prepare('SELECT * FROM organization_unit WHERE company_id = ? ORDER BY level, name').all(req.params.companyId);
    res.json(units);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post('/api/v1/companies/:companyId/units', (req, res) => {
  try {
    const { name, parent_id, unit_type } = req.body;
    const companyId = req.params.companyId;
    const id = uuidv4();
    
    let level = 1;
    let path = id;

    if (parent_id) {
      const parent = db.prepare('SELECT level, path FROM organization_unit WHERE id = ?').get(parent_id) as any;
      if (parent) {
        level = parent.level + 1;
        path = `${parent.path}/${id}`;
      }
    }

    const stmt = db.prepare(`
      INSERT INTO organization_unit (id, company_id, parent_id, name, unit_type, level, path)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, companyId, parent_id, name, unit_type, level, path);
    
    const newUnit = db.prepare('SELECT * FROM organization_unit WHERE id = ?').get(id);
    res.status(201).json(newUnit);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.put('/api/v1/units/:id', (req, res) => {
  try {
    const { name, unit_type } = req.body;
    const stmt = db.prepare('UPDATE organization_unit SET name = ?, unit_type = ? WHERE id = ?');
    const info = stmt.run(name, unit_type, req.params.id);
    
    if (info.changes > 0) {
      const updatedUnit = db.prepare('SELECT * FROM organization_unit WHERE id = ?').get(req.params.id);
      res.json(updatedUnit);
    } else {
      res.status(404).json({ error: 'Unit not found' });
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.delete('/api/v1/units/:id', (req, res) => {
  try {
    // Check for children
    const children = db.prepare('SELECT count(*) as count FROM organization_unit WHERE parent_id = ?').get(req.params.id) as any;
    if (children.count > 0) {
      return res.status(400).json({ error: 'Cannot delete unit with children' });
    }

    const info = db.prepare('DELETE FROM organization_unit WHERE id = ?').run(req.params.id);
    if (info.changes > 0) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Unit not found' });
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// --- Roles ---
app.get('/api/v1/companies/:companyId/roles', (req, res) => {
  try {
    const roles = db.prepare('SELECT * FROM role WHERE company_id = ? ORDER BY created_at DESC').all(req.params.companyId);
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post('/api/v1/companies/:companyId/roles', (req, res) => {
  try {
    const { name, description, scope_type } = req.body;
    const id = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO role (id, company_id, name, description, scope_type)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(id, req.params.companyId, name, description, scope_type || 'CUSTOM');
    const newRole = db.prepare('SELECT * FROM role WHERE id = ?').get(id);
    res.status(201).json(newRole);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.put('/api/v1/roles/:id', (req, res) => {
  try {
    const { name, description, scope_type } = req.body;
    const stmt = db.prepare('UPDATE role SET name = ?, description = ?, scope_type = ? WHERE id = ?');
    const info = stmt.run(name, description, scope_type, req.params.id);
    if (info.changes > 0) {
      const updatedRole = db.prepare('SELECT * FROM role WHERE id = ?').get(req.params.id);
      res.json(updatedRole);
    } else {
      res.status(404).json({ error: 'Role not found' });
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.delete('/api/v1/roles/:id', (req, res) => {
  try {
    const info = db.prepare('DELETE FROM role WHERE id = ?').run(req.params.id);
    if (info.changes > 0) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Role not found' });
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// --- Permissions ---
app.get('/api/v1/features', (req, res) => {
  try {
    const features = db.prepare(`
      SELECT f.*, s.name as service_name 
      FROM feature f 
      JOIN service s ON f.service_id = s.id 
      ORDER BY s.name, f.name
    `).all();
    res.json(features);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.get('/api/v1/permission-types', (req, res) => {
  try {
    const types = db.prepare('SELECT * FROM permission_type').all();
    res.json(types);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// --- Services ---
app.get('/api/v1/services', (req, res) => {
  try {
    const services = db.prepare('SELECT * FROM service ORDER BY name').all();
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.put('/api/v1/services/:id/toggle', (req, res) => {
  try {
    const service = db.prepare('SELECT is_active FROM service WHERE id = ?').get(req.params.id) as any;
    if (!service) return res.status(404).json({ error: 'Service not found' });
    
    const newState = service.is_active ? 0 : 1;
    db.prepare('UPDATE service SET is_active = ? WHERE id = ?').run(newState, req.params.id);
    
    res.json({ success: true, is_active: newState });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.put('/api/v1/features/:id/toggle', (req, res) => {
  try {
    const feature = db.prepare('SELECT is_active FROM feature WHERE id = ?').get(req.params.id) as any;
    if (!feature) return res.status(404).json({ error: 'Feature not found' });
    
    const newState = feature.is_active ? 0 : 1;
    db.prepare('UPDATE feature SET is_active = ? WHERE id = ?').run(newState, req.params.id);
    
    res.json({ success: true, is_active: newState });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.get('/api/v1/roles/:roleId/permissions', (req, res) => {
  try {
    const permissions = db.prepare(`
      SELECT rp.*, f.code as feature_code, pt.code as permission_code
      FROM role_permission rp
      JOIN feature f ON rp.feature_id = f.id
      JOIN permission_type pt ON rp.permission_type_id = pt.id
      WHERE rp.role_id = ?
    `).all(req.params.roleId);
    res.json(permissions);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post('/api/v1/roles/:roleId/permissions', (req, res) => {
  try {
    const { permissions } = req.body; // Array of { feature_id, permission_type_id, is_allowed }
    const roleId = req.params.roleId;

    const insertStmt = db.prepare(`
      INSERT INTO role_permission (id, role_id, feature_id, permission_type_id, is_allowed)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(role_id, feature_id, permission_type_id) 
      DO UPDATE SET is_allowed = excluded.is_allowed
    `);

    const transaction = db.transaction((perms) => {
      for (const p of perms) {
        insertStmt.run(uuidv4(), roleId, p.feature_id, p.permission_type_id, p.is_allowed ? 1 : 0);
      }
    });

    transaction(permissions);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Vite Middleware (Must be last)
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
