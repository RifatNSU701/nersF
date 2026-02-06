import { Request, Response } from 'express';
import { VendorModel } from '../models/vendor.model';
import { VendorProfile } from '../interfaces/vendor.interface';

export const createVendorProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Get the User ID from the Token (The user MUST be logged in)
    // We cast to 'any' because strict TypeScript doesn't know about 'req.user' yet
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized: User ID not found in token' });
      return;
    }

    // 2. Get Data from Body
    const { company_name, trade_license_no, tax_id_no, address_line, city } = req.body;

    // 3. Validation: Check empty fields
    if (!company_name || !trade_license_no || !tax_id_no) {
      res.status(400).json({ message: 'Missing required fields: Company Name, License, or Tax ID' });
      return;
    }

    // 4. Check if this User ALREADY has a profile
    const existingProfile = await VendorModel.findByUserId(userId);
    if (existingProfile) {
      res.status(409).json({ message: 'Profile already exists for this user' });
      return;
    }

    // 5. Check if License Number is taken by someone else
    const duplicateLicense = await VendorModel.findByLicense(trade_license_no);
    if (duplicateLicense) {
      res.status(409).json({ message: 'Trade License Number already registered' });
      return;
    }

    // 6. Create the Profile
    const newProfile: VendorProfile = {
      user_id: userId,
      company_name,
      trade_license_no,
      tax_id_no,
      address_line,
      city
    };

    const profileId = await VendorModel.create(newProfile);

    res.status(201).json({ 
      message: 'Vendor Profile submitted successfully', 
      profileId 
    });

  } catch (error) {
    console.error('Create Profile Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};