import express from 'express';
import { supabase } from '../config/supabaseClient.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { data: templates, error } = await supabase
      .from('layout_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ templates });
  } catch (error) {
    next(error);
  }
});

// Create
router.post('/', async (req, res, next) => {
  try {
    const { name, category, pages, status, image } = req.body;
    const { data: template, error } = await supabase
      .from('layout_templates')
      .insert([{ name, category, pages, status, image }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(template);
  } catch (error) {
    next(error);
  }
});

// Update
router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, category, pages, status, image } = req.body;
    const { data: template, error } = await supabase
      .from('layout_templates')
      .update({ name, category, pages, status, image })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(template);
  } catch (error) {
    next(error);
  }
});

// Delete
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('layout_templates')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router;
