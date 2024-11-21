import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import Layout from '../Components/Layout';
import './csspages/Farmer.css';
import BASE_URL from '../service/BaseAddress';

const Farmer = () => {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [formData, setFormData] = useState({
    productType: '',
    product: '',
    minPrice: '',
    agreementType: 'Pre-harvest',
  });
  const [appliedPosts, setAppliedPosts] = useState(new Set());

  useEffect(() => {
    const fetchFarmers = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get('/allfarmers', config);
        setFarmers(response.data);
      } catch (error) {
        setError(error.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchFarmers();
  }, []);

  const openModal = (post) => {
    setSelectedPost(post);
    setFormData({
      ...formData,
      productType: "crops", // Ensure this pulls the correct value
      product: post.product,
    });
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedPost(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.post(
        `/farmers/${selectedPost.farmerId}/agreements/request`,
        { ...formData, postId: selectedPost._id },
        config
      );
      alert(response.data); // Handle the response as needed
      setAppliedPosts((prev) => new Set(prev).add(selectedPost._id));
      closeModal();
    } catch (error) {
      console.error('Failed to send agreement request:', error);
      // Handle the error as needed
    }
  };

  return (
    <>
      <Layout>
        <div className="farmerList">
          <button id="filter">Filter</button>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p>Error: {error}</p>
          ) : farmers.length === 0 ? (
            <p>No farmers found.</p>
          ) : (
            <table className="farmerTable">
              <thead>
                <tr>
                  <th>Photo</th>
                  <th>Farmer Name</th>
                  <th>Address</th>
                  <th>Product Type</th>
                  <th>Product</th>
                  <th>Harvest Date (expected)</th>
                  <th>Acres Grown</th>
                  <th>Request for Agreement</th>
                </tr>
              </thead>
              <tbody>
                {farmers.map((farmer) => (
                  <React.Fragment key={farmer._id}>
                    {farmer.posts.map((post, index) => (
                      <tr key={`${farmer._id}-${index}`}>
                        <td>
                          {index === 0 && (
                            <img
                              src={`${BASE_URL}/images/${farmer.photo || 'default-photo.jpg'}`}
                              alt={farmer.username}
                              className="farmerPhoto"
                              rowSpan={farmer.posts.length}
                            />
                          )}
                        </td>
                        <td>{index === 0 ? farmer.username : ''}</td>
                        <td>{index === 0 ? farmer.address : ''}</td>
                        <td>{post.productCategory}</td>
                        <td>{post.product}</td>
                        <td>{new Date(post.harvestDate).toLocaleDateString()}</td>
                        <td>{post.acresGrown} acres</td>
                        <td>
                          <button
                            onClick={() => openModal({ ...post, farmerId: farmer._id })}
                            disabled={appliedPosts.has(post._id)}
                          >
                            {appliedPosts.has(post._id) ? 'Requested' : 'Request'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          contentLabel="Request Agreement"
          className="requestModal"
          overlayClassName="requestModalOverlay"
        >
          <h2>Request Agreement for {selectedPost?.product}</h2>
          <form onSubmit={handleSubmit}>
            <div>
              <label>Product Type:</label>
              <input
                type="text"
                name="productType"
                value={formData.productType}
                readOnly
              />
            </div>
            <div>
              <label>Product:</label>
              <input
                type="text"
                name="product"
                value={formData.product}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label>Minimum Price:</label>
              <input
                type="text"
                name="minPrice"
                value={formData.minPrice}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label>Agreement Type:</label>
              <select
                name="agreementType"
                value={formData.agreementType}
                onChange={handleChange}
              >
                <option value="Pre-harvest">Pre-harvest</option>
                <option value="Post-harvest">Post-harvest</option>
              </select>
            </div>
            <button type="submit">Submit Request</button>
            <button type="button" onClick={closeModal}>
              Cancel
            </button>
          </form>
        </Modal>
      </Layout>
    </>
  );
};
export default Farmer;
