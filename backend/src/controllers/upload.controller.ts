import { Request, Response } from 'express';

export const uploadFile = (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    // Return the URL so the frontend can save it in the DB
    // Example: "http://localhost:5000/uploads/170992-contract.pdf"
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    res.status(201).json({
      message: 'File uploaded successfully',
      fileUrl: fileUrl,
      filename: req.file.filename
    });
  } catch (error) {
    res.status(500).json({ message: 'File upload failed' });
  }
};