import dbConnect from "../../lib/mongoose";
import Product from "../../models/Product";

export const config = {
  api: {
    responseLimit: false,
  },
};

export default async function handle(req, res) {
  console.log("API route called");
  const start = Date.now();

  try {
    await dbConnect();
    const { ids, page = 1, limit = 20 } = req.query;
    
    if (Date.now() - start > 9000) {
      throw new Error('Database connection timeout');
    }

    if (ids) {
      const idsArray = ids.split(',');
      const products = await Product.find({
        '_id': { $in: idsArray }
      }).lean().maxTimeMS(5000);
      console.log('Products found by IDs:', products.length);
      res.json(products);
    } else {
      const skip = (page - 1) * limit;
      const allProducts = await Product.find()
        .skip(skip)
        .limit(Number(limit))
        .lean()
        .maxTimeMS(5000);
      res.json(allProducts);
    }
  } catch (error) {
    console.error('API route error:', error);
    res.status(500).json({ error: error.message });
  }
}