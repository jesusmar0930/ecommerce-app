import dbConnect from '../../lib/mongoose';
import Product from "../../models/Product";

export default async function handler(req, res) {
  try {
    await dbConnect();
    
    const testProduct = new Product({
      name: "Test Product",
      description: "from add-tett-product",
      price: 9.99,
      category: "Test",
      picture: "\products\airpods.png"
    });

    await testProduct.save();

    res.status(200).json({ message: "Test product added successfully", product: testProduct });
  } catch (error) {
    console.error('Error adding test product:', error);
    res.status(500).json({ error: error.message });
  }
}