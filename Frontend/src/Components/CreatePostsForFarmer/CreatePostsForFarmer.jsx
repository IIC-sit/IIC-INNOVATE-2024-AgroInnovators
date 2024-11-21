import React, { useState } from 'react';
import axios from 'axios';
import './CreatePostsForFarmers.css';

const CreatePostsForFarmers = () => {
  const [formData, setFormData] = useState({
    product: '',
    harvestDate: '',
    acresGrown: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/farmers/me/post', formData, {
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${token}`
        },
      });

      if (response.status === 200) {
        // Handle success (e.g., clear form, show success message)
        alert('Post created successfully!');
      } else {
        // Handle error
        alert('Failed to create post!');
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <div className="farmer-posts">
      <form onSubmit={handleSubmit}>
        <div>
          <label>Product Name:</label>
          <input
            type="text"
            name="product"
            value={formData.product}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Expected Harvest Date:</label>
          <input
            type="date"
            name="harvestDate"
            value={formData.harvestDate}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Acres Grown:</label>
          <input
            type="number"
            name="acresGrown"
            value={formData.acresGrown}
            onChange={handleChange}
          />
        </div>
        <button type="submit">Submit Post</button>
      </form>
    </div>
  );
};

export default CreatePostsForFarmers;
