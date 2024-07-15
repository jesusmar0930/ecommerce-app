import { useState, useEffect } from "react";
import Product from "../components/Product";
import dbConnect from "../lib/mongoose";
import ProductModel from "../models/Product";
import Layout from "../components/Layout";

export default function Home({ initialProducts, error }) {
  const [products, setProducts] = useState(initialProducts);
  const [phrase, setPhrase] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (page > 1) {
      fetchMoreProducts();
    }
  }, [page]);

  const fetchMoreProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products?page=${page}&limit=20`);
      const newProducts = await res.json();
      setProducts(prev => [...prev, ...newProducts]);
    } catch (error) {
      console.error('Error fetching more products:', error);
    }
    setLoading(false);
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  const categoriesNames = [...new Set(products.map(p => p.category))];

  const filteredProducts = phrase
    ? products.filter(p => p.name.toLowerCase().includes(phrase.toLowerCase()))
    : products;

  return (
    <Layout>
      <input 
        value={phrase} 
        onChange={e => setPhrase(e.target.value)} 
        type="text" 
        placeholder="Search for products..." 
        className="bg-gray-200 w-full py-2 px-4 rounded-xl"
      />
      <div>
        {categoriesNames.map(categoryName => (
          <div key={categoryName}>
            {filteredProducts.find(p => p.category === categoryName) && (
              <div>
                <h2 className="text-2xl py-5 capitalize">{categoryName}</h2>
                <div className="flex -mx-5 overflow-x-scroll snap-x scrollbar-hide">
                  {filteredProducts.filter(p => p.category === categoryName).map(productInfo => (
                    <div key={productInfo._id} className="px-5 snap-start">
                      <div className="w-64">
                        <div className="bg-blue-100 p-5 rounded-xl">
                          <div className="w-full h-40 flex items-center justify-center">
                            <img 
                              className="max-w-full max-h-full object-contain" 
                              src={productInfo.picture} 
                              alt={productInfo.name}
                            />
                          </div>
                        </div>
                        <div className="mt-2">
                          <h3 className="font-bold text-lg">{productInfo.name}</h3>
                          <p className="text-sm mt-1 leading-4 text-gray-500">{productInfo.description}</p>
                          <div className="flex mt-1">
                            <div className="text-2xl font-bold grow">${productInfo.price}</div>
                            <button onClick={() => addProduct(productInfo._id)} className="bg-emerald-400 text-white py-1 px-3 rounded-xl">+</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {!phrase && (
        <button 
          onClick={() => setPage(prev => prev + 1)} 
          disabled={loading}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          {loading ? 'Loading...' : 'Load More'}
        </button>
      )}
    </Layout>
  )
}

export async function getServerSideProps() {
  console.log("getServerSideProps called");
  try {
    await dbConnect();
    const products = await ProductModel.find()
      .limit(20)
      .lean()
      .maxTimeMS(5000);
    
    return {
      props: {
        initialProducts: JSON.parse(JSON.stringify(products)),
      },
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    return {
      props: {
        initialProducts: [],
        error: error.message,
      },
    };
  }
}