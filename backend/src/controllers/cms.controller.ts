import { Request, Response } from 'express';
import pool from '../config/database';

// 1. NEWS LOGIC
export const getNews = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id, title, category, image_url, created_at, is_published 
       FROM news 
       WHERE is_published = TRUE 
       ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching news' });
  }
};

export const createNews = async (req: Request, res: Response) => {
  try {
    const { title, content, category, image_url } = req.body;
    const authorId = (req as any).user?.id || null; 

    await pool.execute(
      `INSERT INTO news (title, content, category, image_url, author_id) 
       VALUES (?, ?, ?, ?, ?)`,
      [title, content, category || 'GENERAL', image_url, authorId]
    );

    res.status(201).json({ message: 'News Article Created Successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating news' });
  }
};

// 2. NOTICES LOGIC
export const getNotices = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.execute(
      `SELECT * FROM notices 
       WHERE is_active = TRUE 
       ORDER BY publish_date DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching notices' });
  }
};

export const createNotice = async (req: Request, res: Response) => {
  try {
    const { title, file_url, reference_number, publish_date } = req.body;

    await pool.execute(
      `INSERT INTO notices (title, file_url, reference_number, publish_date) 
       VALUES (?, ?, ?, ?)`,
      [title, file_url, reference_number, publish_date]
    );

    res.status(201).json({ message: 'Notice Published Successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating notice' });
  }
};