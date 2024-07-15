import dbConnect from '../../lib/mongoose';

import mongoose from 'mongoose';
import Product from "../../models/Product";

export default async function handler(req, res) {
  try {
    await dbConnect();
    const dbName = mongoose.connection.db.databaseName;
    const collections = await mongoose.connection.db.listCollections().toArray();
    const productCount = await Product.countDocuments();
    const sampleProduct = await Product.findOne();

    res.status(200).json({
      databaseName: dbName,
      collections: collections.map(c => c.name),
      productCount,
      sampleProduct,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}