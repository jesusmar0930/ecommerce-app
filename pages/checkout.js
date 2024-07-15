import Layout from "../components/Layout";
import {useContext, useEffect, useState} from "react";
import {ProductsContext} from "../components/ProductsContext";

export default function CheckoutPage() {
  const {selectedProducts,setSelectedProducts} = useContext(ProductsContext);
  const [productsInfos,setProductsInfos] = useState([]);
  const [address,setAddress] = useState('');
  const [city,setCity] = useState('');
  const [name,setName] = useState('');
  const [email,setEmail] = useState('');
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const uniqIds = [...new Set(selectedProducts)];
    fetch('/api/products?ids='+uniqIds.join(','))
      .then(response => response.json())
      .then(json => setProductsInfos(json));
  }, [selectedProducts]);

  function moreOfThisProduct(id) {
    setSelectedProducts(prev => [...prev,id]);
  }
  function lessOfThisProduct(id) {
    const pos = selectedProducts.indexOf(id);
    if (pos !== -1) {
      setSelectedProducts( prev => {
        return prev.filter((value,index) => index !== pos);
      });
    }
  }

  const deliveryPrice = 5;
  let subtotal = 0;
  if (selectedProducts?.length) {
    for (let id of selectedProducts) {
      const price = productsInfos.find(p => p._id === id)?.price || 0;
      subtotal += price;
    }
  }
  const total = subtotal + deliveryPrice;

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validateForm = () => {
    const errors = {};
    if (!address.trim()) errors.address = "Address is required";
    if (!city.trim()) errors.city = "City is required";
    if (!name.trim()) errors.name = "Name is required";
    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!validateEmail(email)) {
      errors.email = "Please enter a valid email address";
    }
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length === 0) {
      // If no errors, submit the form
      e.target.submit();
    } else {
      setFormErrors(errors);
    }
  };

  return (
    <Layout>
      {!productsInfos.length && (
        <div>no products in your shopping cart</div>
      )}
      {productsInfos.length && productsInfos.map(productInfo => {
  const amount = selectedProducts.filter(id => id === productInfo._id).length;
  if (amount === 0) return null;
  return (
    <div className="flex mb-5 items-center" key={productInfo._id}>
      <div className="bg-gray-100 p-3 rounded-xl shrink-0 w-24 h-24 flex items-center justify-center" style={{boxShadow:'inset 1px 0px 10px 10px rgba(0,0,0,0.1)'}}>
        <img 
          className="max-w-full max-h-full object-contain" 
          src={productInfo.picture} 
          alt={productInfo.name}
        />
      </div>
      <div className="pl-4 flex-grow">
        <h3 className="font-bold text-lg">{productInfo.name}</h3>
        <p className="text-sm leading-4 text-gray-500">{productInfo.description}</p>
        <div className="flex mt-1">
          <div className="grow font-bold">${productInfo.price}</div>
          <div>
            <button onClick={() => lessOfThisProduct(productInfo._id)} className="border border-emerald-500 px-2 rounded-lg text-emerald-500">-</button>
            <span className="px-2">
              {selectedProducts.filter(id => id === productInfo._id).length}
            </span>
            <button onClick={() => moreOfThisProduct(productInfo._id)} className="bg-emerald-500 px-2 rounded-lg text-white">+</button>
          </div>
        </div>
      </div>
    </div>
  );
})}
      <form action="/api/checkout" method="POST" onSubmit={handleSubmit}>
        <div className="mt-8">
          <input name="address" value={address} onChange={e => setAddress(e.target.value)} className="bg-gray-100 w-full rounded-lg px-4 py-2 mb-2" type="text" placeholder="Street address, number"/>
          {formErrors.address && <p className="text-red-500 text-sm mb-2">{formErrors.address}</p>}
          
          <input name="city" value={city} onChange={e => setCity(e.target.value)} className="bg-gray-100 w-full rounded-lg px-4 py-2 mb-2" type="text" placeholder="City and postal code"/>
          {formErrors.city && <p className="text-red-500 text-sm mb-2">{formErrors.city}</p>}
          
          <input name="name" value={name} onChange={e => setName(e.target.value)} className="bg-gray-100 w-full rounded-lg px-4 py-2 mb-2" type="text" placeholder="Your name"/>
          {formErrors.name && <p className="text-red-500 text-sm mb-2">{formErrors.name}</p>}
          
          <input name="email" value={email} onChange={e => setEmail(e.target.value)} className="bg-gray-100 w-full rounded-lg px-4 py-2 mb-2" type="email" placeholder="Email address"/>
          {formErrors.email && <p className="text-red-500 text-sm mb-2">{formErrors.email}</p>}
        </div>
        <div className="mt-8">
          <div className="flex my-3">
            <h3 className="grow font-bold text-gray-400">Subtotal:</h3>
            <h3 className="font-bold">${subtotal}</h3>
          </div>
          <div className="flex my-3">
            <h3 className="grow font-bold text-gray-400">Delivery:</h3>
            <h3 className="font-bold">${deliveryPrice}</h3>
          </div>
          <div className="flex my-3 border-t pt-3 border-dashed border-emerald-500">
            <h3 className="grow font-bold text-gray-400">Total:</h3>
            <h3 className="font-bold">${total}</h3>
          </div>
        </div>
        <input type="hidden" name="products" value={selectedProducts.join(',')}/>
        <button type="submit" className="bg-emerald-500 px-5 py-2 rounded-xl font-bold text-white w-full my-4 shadow-emerald-300 shadow-lg">Pay ${total}</button>
      </form>
    </Layout>
  );
}