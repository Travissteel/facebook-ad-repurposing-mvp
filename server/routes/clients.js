const express = require('express');
const router = express.Router();
const database = require('../models/database');

// Initialize database connection
database.connect().catch(console.error);

// Get all clients
router.get('/', async (req, res) => {
  try {
    const clients = await database.all('SELECT * FROM clients ORDER BY created_at DESC');
    res.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

// Get single client
router.get('/:id', async (req, res) => {
  try {
    const client = await database.get('SELECT * FROM clients WHERE id = ?', [req.params.id]);
    
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    res.json(client);
  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({ error: 'Failed to fetch client' });
  }
});

// Create new client
router.post('/', async (req, res) => {
  try {
    const { name, industry, target_roas = 3.0, avg_order_value } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Client name is required' });
    }

    const result = await database.run(
      'INSERT INTO clients (name, industry, target_roas, avg_order_value) VALUES (?, ?, ?, ?)',
      [name, industry, target_roas, avg_order_value]
    );

    const newClient = await database.get('SELECT * FROM clients WHERE id = ?', [result.id]);
    
    res.status(201).json(newClient);
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ error: 'Failed to create client' });
  }
});

// Update client
router.put('/:id', async (req, res) => {
  try {
    const { name, industry, target_roas, avg_order_value } = req.body;
    
    const result = await database.run(
      `UPDATE clients 
       SET name = ?, industry = ?, target_roas = ?, avg_order_value = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name, industry, target_roas, avg_order_value, req.params.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const updatedClient = await database.get('SELECT * FROM clients WHERE id = ?', [req.params.id]);
    res.json(updatedClient);
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ error: 'Failed to update client' });
  }
});

// Delete client
router.delete('/:id', async (req, res) => {
  try {
    const result = await database.run('DELETE FROM clients WHERE id = ?', [req.params.id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ error: 'Failed to delete client' });
  }
});

// Get client's ads
router.get('/:id/ads', async (req, res) => {
  try {
    const ads = await database.all(
      'SELECT * FROM ads WHERE client_id = ? ORDER BY created_at DESC',
      [req.params.id]
    );
    
    res.json(ads);
  } catch (error) {
    console.error('Error fetching client ads:', error);
    res.status(500).json({ error: 'Failed to fetch client ads' });
  }
});

// Get client's performance summary
router.get('/:id/performance', async (req, res) => {
  try {
    const clientId = req.params.id;
    
    // Get performance stats
    const stats = await database.get(`
      SELECT 
        COUNT(DISTINCT a.id) as total_ads,
        COUNT(DISTINCT av.id) as total_variations,
        COUNT(DISTINCT pt.id) as tracked_campaigns,
        AVG(pt.actual_roas) as avg_roas,
        AVG(pt.actual_ctr) as avg_ctr,
        AVG(pt.actual_conversion_rate) as avg_conversion_rate,
        AVG(pt.actual_cpa) as avg_cpa
      FROM ads a
      LEFT JOIN ad_variations av ON a.id = av.original_ad_id
      LEFT JOIN performance_tracking pt ON av.id = pt.variation_id
      WHERE a.client_id = ?
    `, [clientId]);

    // Get recent performance
    const recentPerformance = await database.all(`
      SELECT 
        av.variation_type,
        pt.actual_roas,
        pt.actual_ctr,
        pt.tracked_at
      FROM ads a
      JOIN ad_variations av ON a.id = av.original_ad_id
      JOIN performance_tracking pt ON av.id = pt.variation_id
      WHERE a.client_id = ?
      ORDER BY pt.tracked_at DESC
      LIMIT 10
    `, [clientId]);

    res.json({
      summary: stats,
      recentPerformance
    });
  } catch (error) {
    console.error('Error fetching client performance:', error);
    res.status(500).json({ error: 'Failed to fetch performance data' });
  }
});

module.exports = router;